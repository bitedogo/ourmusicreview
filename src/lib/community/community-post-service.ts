/** 커뮤니티 게시글 작성·수정·삭제·조회 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { isNoticeCategory } from "@/src/lib/community/notice-category";
import type { NoticeCategory } from "@/src/lib/community/types";
import { Post, type PostCategory } from "@/src/lib/db/entities/Post";
import { ServiceError } from "@/src/lib/http/service-error";

const BOARD_CATEGORIES: PostCategory[] = ["K", "I", "M", "W"];

export interface CreateCommunityPostInput {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
  isRelease?: boolean;
}

export interface UpdateCommunityPostInput {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
  isRelease?: boolean;
}

function createPostId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

function resolveCreateCategory(
  requested: PostCategory | undefined,
  isPostAdmin: boolean
): PostCategory {
  if (requested === "N") {
    if (!isPostAdmin) {
      throw new ServiceError("공지사항 작성 권한이 없습니다.", 403);
    }
    return "N";
  }
  if (requested && BOARD_CATEGORIES.includes(requested)) {
    return requested;
  }
  return "K";
}

export async function createCommunityPost(
  dataSource: DataSource,
  actor: { userId: string; nickname: string; isAdmin: boolean },
  body: CreateCommunityPostInput
): Promise<{ id: string }> {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!title || !content) {
    throw new ServiceError("제목과 내용을 모두 입력해주세요.", 400);
  }

  const category = resolveCreateCategory(body.category, actor.isAdmin);
  const isReleaseRequested = actor.isAdmin && body.isRelease === true;
  const isGlobal = actor.isAdmin && body.isGlobal === true ? "Y" : "N";

  let noticeCategory: NoticeCategory | null = null;
  if (category === "N") {
    if (!isNoticeCategory(body.noticeCategory)) {
      throw new ServiceError(
        "공지사항 카테고리를 선택해주세요. (RELEASE NOTE, EVENT, SERVICE, REPORT)",
        400
      );
    }
    noticeCategory = body.noticeCategory;
  }

  const canCreateRelease = category === "K" || category === "I";
  const isRelease = isReleaseRequested && canCreateRelease;

  const createdPostId = await dataSource.transaction(async (manager) => {
    const postRepository = manager.getRepository(Post);
    const id = createPostId();

    const post = postRepository.create({
      id,
      title,
      content,
      category,
      isGlobal: isRelease ? "N" : isGlobal,
      noticeCategory: isRelease ? "RELEASE_NOTE" : noticeCategory,
      userId: actor.userId,
      nickname: actor.nickname,
    });
    await postRepository.save(post);

    if (isRelease) {
      const mirroredCategory: PostCategory = category === "K" ? "I" : "K";
      const mirroredPost = postRepository.create({
        id: createPostId(),
        title,
        content,
        category: mirroredCategory,
        isGlobal: "N",
        noticeCategory: "RELEASE_NOTE",
        userId: actor.userId,
        nickname: actor.nickname,
      });
      await postRepository.save(mirroredPost);
    }

    return post.id;
  });

  return { id: createdPostId };
}

export async function getCommunityPost(dataSource: DataSource, id: string) {
  const post = await dataSource.getRepository(Post).findOne({
    where: { id },
    relations: ["user"],
  });
  if (!post) {
    throw new ServiceError("게시글을 찾을 수 없습니다.", 404);
  }
  return post;
}

export async function updateCommunityPost(
  dataSource: DataSource,
  id: string,
  actor: { userId: string; isAdmin: boolean },
  body: UpdateCommunityPostInput
): Promise<Post> {
  const postRepository = dataSource.getRepository(Post);
  const post = await postRepository.findOne({ where: { id } });
  if (!post) {
    throw new ServiceError("게시글을 찾을 수 없습니다.", 404);
  }
  if (post.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("수정 권한이 없습니다.", 403);
  }

  const previousTitle = post.title;
  const previousContent = post.content;
  const previousCategory = post.category;
  const previousNoticeCategory = post.noticeCategory;

  if (body.title) post.title = body.title;
  if (body.content) post.content = body.content;
  if (body.category) post.category = body.category;
  if (actor.isAdmin && typeof body.isGlobal === "boolean") {
    post.isGlobal = body.isGlobal ? "Y" : "N";
  }
  if (post.category === "N") {
    if (isNoticeCategory(body.noticeCategory)) {
      post.noticeCategory = body.noticeCategory;
    }
  } else if (actor.isAdmin && typeof body.isRelease === "boolean") {
    if (body.isRelease) {
      post.noticeCategory = "RELEASE_NOTE";
      post.isGlobal = "N";
    } else if (post.noticeCategory === "RELEASE_NOTE") {
      post.noticeCategory = null;
    }
  }

  await dataSource.transaction(async (manager) => {
    const txPostRepository = manager.getRepository(Post);
    await txPostRepository.save(post);

    const isBoardPost = post.category === "K" || post.category === "I";
    if (!actor.isAdmin || typeof body.isRelease !== "boolean" || !isBoardPost) {
      return;
    }

    const oppositeCategory: PostCategory = post.category === "K" ? "I" : "K";

    let mirroredPost = await txPostRepository.findOne({
      where: {
        userId: post.userId,
        category: oppositeCategory,
        noticeCategory: "RELEASE_NOTE",
        title: previousTitle,
        content: previousContent,
      },
    });

    if (!mirroredPost) {
      mirroredPost = await txPostRepository.findOne({
        where: {
          userId: post.userId,
          category: oppositeCategory,
          noticeCategory: "RELEASE_NOTE",
          title: post.title,
          content: post.content,
        },
      });
    }

    const wasReleasePost =
      previousNoticeCategory === "RELEASE_NOTE" &&
      (previousCategory === "K" || previousCategory === "I");

    if (body.isRelease) {
      if (mirroredPost) {
        mirroredPost.title = post.title;
        mirroredPost.content = post.content;
        mirroredPost.nickname = post.nickname;
        mirroredPost.isGlobal = "N";
        mirroredPost.noticeCategory = "RELEASE_NOTE";
        await txPostRepository.save(mirroredPost);
      } else {
        const newMirroredPost = txPostRepository.create({
          id: createPostId(),
          title: post.title,
          content: post.content,
          category: oppositeCategory,
          isGlobal: "N",
          noticeCategory: "RELEASE_NOTE",
          userId: post.userId,
          nickname: post.nickname,
        });
        await txPostRepository.save(newMirroredPost);
      }
    } else if (wasReleasePost && mirroredPost) {
      await txPostRepository.remove(mirroredPost);
    }
  });

  return post;
}

export async function deleteCommunityPost(
  dataSource: DataSource,
  id: string,
  actor: { userId: string; isAdmin: boolean }
): Promise<void> {
  const postRepository = dataSource.getRepository(Post);
  const post = await postRepository.findOne({ where: { id } });
  if (!post) {
    throw new ServiceError("게시글을 찾을 수 없습니다.", 404);
  }
  if (post.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("삭제 권한이 없습니다.", 403);
  }
  await postRepository.remove(post);
}
