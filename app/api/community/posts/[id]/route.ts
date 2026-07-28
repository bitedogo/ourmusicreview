/** GET/PATCH/DELETE 커뮤니티 게시글 상세·수정·삭제 */

import { isAdmin, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";
import { isNoticeCategory } from "@/src/lib/community/notice-category";
import { apiError, apiOk } from "@/src/lib/http/response";
import { randomUUID } from "crypto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { title, content, category, isGlobal, noticeCategory, isRelease } = await request.json();

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const post = await postRepository.findOne({ where: { id } });

    if (!post) {
      return apiError("게시글을 찾을 수 없습니다.", { status: 404 });
    }

    const isPostAdmin = isAdmin(session);

    if (post.userId !== session.user.id && !isPostAdmin) {
      return apiError("수정 권한이 없습니다.", { status: 403 });
    }

    const previousTitle = post.title;
    const previousContent = post.content;
    const previousCategory = post.category;
    const previousNoticeCategory = post.noticeCategory;

    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (isPostAdmin && typeof isGlobal === "boolean") {
      post.isGlobal = isGlobal ? "Y" : "N";
    }
    if (post.category === "N") {
      if (isNoticeCategory(noticeCategory)) {
        post.noticeCategory = noticeCategory;
      }
    } else if (isPostAdmin && typeof isRelease === "boolean") {
      if (isRelease) {
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
      if (!isPostAdmin || typeof isRelease !== "boolean" || !isBoardPost) {
        return;
      }

      const oppositeCategory = post.category === "K" ? "I" : "K";

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

      const wasReleasePost = previousNoticeCategory === "RELEASE_NOTE" && (previousCategory === "K" || previousCategory === "I");

      if (isRelease) {
        if (mirroredPost) {
          mirroredPost.title = post.title;
          mirroredPost.content = post.content;
          mirroredPost.nickname = post.nickname;
          mirroredPost.isGlobal = "N";
          mirroredPost.noticeCategory = "RELEASE_NOTE";
          await txPostRepository.save(mirroredPost);
        } else {
          const newMirroredPost = txPostRepository.create({
            id: randomUUID().replace(/-/g, "").slice(0, 24),
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

    return apiOk({ post });
  } catch {
    return apiError("게시글 수정 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    
    const post = await postRepository.findOne({ where: { id } });

    if (!post) {
      return apiError("게시글을 찾을 수 없습니다.", { status: 404 });
    }

    if (post.userId !== session.user.id && !isAdmin(session)) {
      return apiError("삭제 권한이 없습니다.", { status: 403 });
    }

    await postRepository.remove(post);

    return apiOk({});
  } catch {
    return apiError("게시글 삭제 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const post = await postRepository.findOne({ 
      where: { id },
      relations: ["user"]
    });

    if (!post) {
      return apiError("게시글을 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({ post });
  } catch {
    return apiError("게시글 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
