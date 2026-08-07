/** POST/GET 댓글 좋아요 토글·상태 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Like } from "@/src/lib/db/entities/Like";
import { randomUUID } from "crypto";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { commentId } = await request.json();

    if (!commentId) {
      return apiError("commentId가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const likeRepository = dataSource.getRepository(Like);

    const existingLike = await likeRepository.findOne({
      where: {
        userId: session.user.id,
        commentId: String(commentId),
      },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      const count = await likeRepository.count({
        where: { commentId: String(commentId) },
      });
      return apiOk({ liked: false, count });
    }

    const newLike = likeRepository.create({
      id: randomUUID(),
      userId: session.user.id,
      commentId: String(commentId),
      postId: null,
      reviewId: null,
      playlistId: null,
    });
    await likeRepository.save(newLike);

    const count = await likeRepository.count({
      where: { commentId: String(commentId) },
    });
    return apiOk({ liked: true, count });
  } catch {
    return apiError("좋아요 처리 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return apiError("commentId가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const session = await getAppSession();
    const likeRepository = dataSource.getRepository(Like);

    const count = await likeRepository.count({
      where: { commentId },
    });

    let liked = false;
    if (session?.user?.id) {
      const myLike = await likeRepository.findOne({
        where: {
          userId: session.user.id,
          commentId,
        },
      });
      liked = !!myLike;
    }

    return apiOk({ count, liked });
  } catch {
    return apiError("좋아요 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
