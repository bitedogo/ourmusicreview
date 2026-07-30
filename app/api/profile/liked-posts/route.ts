/** GET 프로필 추천(좋아요)한 게시글 목록 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { apiError, apiOk } from "@/src/lib/http/response";
import { IsNull, Not } from "typeorm";

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const likeRepository = dataSource.getRepository(Like);
    const commentRepository = dataSource.getRepository(Comment);

    const likes = await likeRepository.find({
      where: { userId: session.user.id, postId: Not(IsNull()) },
      relations: ["post"],
      order: { createdAt: "DESC" },
    });

    const posts = await Promise.all(
      likes
        .filter((like) => Boolean(like.postId && like.post))
        .map(async (like) => {
          const post = like.post!;
          const commentCount = await commentRepository.count({
            where: { postId: post.id },
          });

          return {
            likeId: like.id,
            likedAt: like.createdAt,
            id: post.id,
            title: post.title,
            category: post.category,
            isGlobal: post.isGlobal,
            createdAt: post.createdAt,
            commentCount,
          };
        })
    );

    return apiOk({ posts });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "추천한 글 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
