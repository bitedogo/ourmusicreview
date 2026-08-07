/** POST/GET 좋아요 토글·상태 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Like } from "@/src/lib/db/entities/Like";
import { randomUUID } from "crypto";
import { apiError, apiOk } from "@/src/lib/http/response";

type LikeTarget = {
  postId: string | null;
  reviewId: string | null;
  playlistId: string | null;
};

function resolveLikeTarget(input: {
  postId?: unknown;
  reviewId?: unknown;
  playlistId?: unknown;
}): LikeTarget | null {
  const postId = input.postId ? String(input.postId) : null;
  const reviewId = input.reviewId ? String(input.reviewId) : null;
  const playlistId = input.playlistId ? String(input.playlistId) : null;
  const targets = [postId, reviewId, playlistId].filter(Boolean);
  if (targets.length !== 1) return null;
  return { postId, reviewId, playlistId };
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = await request.json();
    const target = resolveLikeTarget(body);
    if (!target) {
      return apiError("postId, reviewId 또는 playlistId 중 하나가 필요합니다.", {
        status: 400,
      });
    }

    const dataSource = await initializeDatabase();
    const likeRepository = dataSource.getRepository(Like);

    const existingLike = await likeRepository.findOne({
      where: {
        userId: session.user.id,
        postId: target.postId,
        reviewId: target.reviewId,
        playlistId: target.playlistId,
        commentId: null,
      },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      return apiOk({ liked: false });
    }

    const newLike = likeRepository.create({
      id: randomUUID(),
      userId: session.user.id,
      postId: target.postId,
      reviewId: target.reviewId,
      playlistId: target.playlistId,
      commentId: null,
    });
    await likeRepository.save(newLike);
    return apiOk({ liked: true });
  } catch {
    return apiError("좋아요 처리 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = resolveLikeTarget({
      postId: searchParams.get("postId"),
      reviewId: searchParams.get("reviewId"),
      playlistId: searchParams.get("playlistId"),
    });

    if (!target) {
      return apiError("postId, reviewId 또는 playlistId 중 하나가 필요합니다.", {
        status: 400,
      });
    }

    const dataSource = await initializeDatabase();
    const session = await getAppSession();
    const likeRepository = dataSource.getRepository(Like);

    const where = target.postId
      ? { postId: target.postId }
      : target.reviewId
        ? { reviewId: target.reviewId }
        : { playlistId: target.playlistId! };

    const count = await likeRepository.count({ where });

    let liked = false;
    if (session?.user?.id) {
      const myLike = await likeRepository.findOne({
        where: {
          userId: session.user.id,
          ...where,
          commentId: null,
        },
      });
      liked = !!myLike;
    }

    return apiOk({ count, liked });
  } catch {
    return apiError("좋아요 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
