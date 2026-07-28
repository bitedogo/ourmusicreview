/** POST 커뮤니티 게시글 작성 */

import { isAdmin, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Post, PostCategory } from "@/src/lib/db/entities/Post";
import type { NoticeCategory } from "@/src/lib/community/types";
import { isNoticeCategory } from "@/src/lib/community/notice-category";
import { randomUUID } from "crypto";
import { apiError, apiOk } from "@/src/lib/http/response";

interface CreatePostBody {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
  isRelease?: boolean;
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    if (!session.user.name) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const body = (await request.json()) as CreatePostBody;
    const title =
      typeof body.title === "string" ? body.title.trim() : undefined;
    const content =
      typeof body.content === "string" ? body.content.trim() : undefined;

    const userId = session.user.id;
    const nickname = session.user.name;
    const isPostAdmin = isAdmin(session);
    const isReleaseRequested = isPostAdmin && body.isRelease === true;
    const isGlobal = isPostAdmin && body.isGlobal === true ? "Y" : "N";

    const allowedCategories: PostCategory[] = ["K", "I", "M", "W"];
    const requestedCategory = body.category as PostCategory;
    let category: PostCategory = "K";
    if (requestedCategory === "N") {
      if (!isPostAdmin) {
        return apiError("공지사항 작성 권한이 없습니다.", { status: 403 });
      }
      category = "N";
    } else if (allowedCategories.includes(requestedCategory)) {
      category = requestedCategory;
    }

    if (!title || !content) {
      return apiError("제목과 내용을 모두 입력해주세요.", { status: 400 });
    }

    let noticeCategory: CreatePostBody["noticeCategory"] | null = null;
    if (category === "N") {
      if (!isNoticeCategory(body.noticeCategory)) {
        return apiError(
          "공지사항 카테고리를 선택해주세요. (RELEASE NOTE, EVENT, SERVICE, REPORT)",
          { status: 400 }
        );
      }
      noticeCategory = body.noticeCategory;
    }

    const canCreateRelease = category === "K" || category === "I";
    const isRelease = isReleaseRequested && canCreateRelease;

    const dataSource = await initializeDatabase();
    const createdPostId = await dataSource.transaction(async (manager) => {
      const postRepository = manager.getRepository(Post);
      const id = randomUUID().replace(/-/g, "").slice(0, 24);

      const post = postRepository.create({
        id,
        title,
        content,
        category,
        isGlobal: isRelease ? "N" : isGlobal,
        noticeCategory: isRelease ? "RELEASE_NOTE" : noticeCategory,
        userId,
        nickname,
      });
      await postRepository.save(post);

      if (isRelease) {
        const mirroredCategory: PostCategory = category === "K" ? "I" : "K";
        const mirroredPost = postRepository.create({
          id: randomUUID().replace(/-/g, "").slice(0, 24),
          title,
          content,
          category: mirroredCategory,
          isGlobal: "N",
          noticeCategory: "RELEASE_NOTE",
          userId,
          nickname,
        });
        await postRepository.save(mirroredPost);
      }

      return post.id;
    });

    return apiOk({ id: createdPostId }, { status: 201 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "게시글 작성 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

