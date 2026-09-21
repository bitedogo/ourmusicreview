/** 커뮤니티 게시글 작성·수정·삭제·조회 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { isNoticeCategory } from "@/src/lib/community/notice-category";
import type { NoticeCategory } from "@/src/lib/community/types";
import { Post, type PostCategory } from "@/src/lib/db/entities/Post";
import { ServiceError } from "@/src/lib/http/service-error";
import { communityDetail } from "@/src/lib/navigation/routes";
import { stripEmbeddedAudio } from "@/src/lib/utils/editor";

const BOARD_CATEGORIES: PostCategory[] = ["K", "I", "M", "W"];
const NOTICE_CATEGORY_REQUIRED =
  "공지사항 카테고리를 선택해주세요. (RELEASE NOTE, EVENT, SERVICE, REPORT)";

export interface CreateCommunityPostInput {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
}

export interface UpdateCommunityPostInput {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
}

function createPostId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

function resolvePostCategory(
  requested: PostCategory | undefined,
  isPostAdmin: boolean,
  fallback: PostCategory
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
  return fallback;
}

export async function createCommunityPost(
  dataSource: DataSource,
  actor: { userId: string; nickname: string; isAdmin: boolean },
  body: CreateCommunityPostInput
): Promise<{ id: string }> {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content =
    typeof body.content === "string"
      ? stripEmbeddedAudio(body.content.trim())
      : "";
  if (!title || !content) {
    throw new ServiceError("제목과 내용을 모두 입력해주세요.", 400);
  }

  const category = resolvePostCategory(body.category, actor.isAdmin, "K");
  const isGlobal = actor.isAdmin && body.isGlobal === true ? "Y" : "N";

  let noticeCategory: NoticeCategory | null = null;
  if (category === "N") {
    if (!isNoticeCategory(body.noticeCategory)) {
      throw new ServiceError(NOTICE_CATEGORY_REQUIRED, 400);
    }
    noticeCategory = body.noticeCategory;
  }

  const postRepository = dataSource.getRepository(Post);
  const post = postRepository.create({
    id: createPostId(),
    title,
    content,
    category,
    isGlobal,
    noticeCategory,
    userId: actor.userId,
    nickname: actor.nickname,
  });
  await postRepository.save(post);

  return { id: post.id };
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

export async function listNoticeAnnouncements(
  dataSource: DataSource,
  limit = 10
) {
  const safeLimit = Math.max(1, Math.min(limit, 30));
  const posts = await dataSource.getRepository(Post).find({
    where: { category: "N" },
    order: { createdAt: "DESC" },
    take: safeLimit,
    select: ["id", "title", "createdAt", "noticeCategory"],
  });

  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    noticeCategory: post.noticeCategory,
    createdAt: new Date(post.createdAt).toISOString(),
    link: communityDetail(post.id),
  }));
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

  if (body.title) post.title = body.title;
  if (body.content) post.content = stripEmbeddedAudio(body.content);
  if (body.category !== undefined) {
    post.category = resolvePostCategory(
      body.category,
      actor.isAdmin,
      post.category
    );
  }
  if (actor.isAdmin && typeof body.isGlobal === "boolean") {
    post.isGlobal = body.isGlobal ? "Y" : "N";
  }
  if (post.category === "N") {
    if (isNoticeCategory(body.noticeCategory)) {
      post.noticeCategory = body.noticeCategory;
    } else if (!isNoticeCategory(post.noticeCategory)) {
      throw new ServiceError(NOTICE_CATEGORY_REQUIRED, 400);
    }
  } else {
    post.noticeCategory = null;
  }

  await postRepository.save(post);
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
