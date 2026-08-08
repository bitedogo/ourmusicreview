/** POST/GET 좋아요 토글·상태 */

import { randomUUID } from "crypto";
import { IsNull, type FindOptionsWhere } from "typeorm";
import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Like } from "@/src/lib/db/entities/Like";
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

/** TypeORM where는 null 대신 IsNull() 사용 */
function buildLikeWhere(
  target: LikeTarget,
  userId?: string
): FindOptionsWhere<Like> {
  const where: FindOptionsWhere<Like> = {
    commentId: IsNull(),
    postId: target.postId ?? IsNull(),
    reviewId: target.reviewId ?? IsNull(),
    playlistId: target.playlistId ?? IsNull(),
  };
  if (userId) where.userId = userId;
  return where;
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
      where: buildLikeWhere(target, session.user.id),
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

    const countWhere = buildLikeWhere(target);
    const count = await likeRepository.count({ where: countWhere });

    let liked = false;
    if (session?.user?.id) {
      const myLike = await likeRepository.findOne({
        where: buildLikeWhere(target, session.user.id),
      });
      liked = !!myLike;
    }

    return apiOk({ count, liked });
  } catch {
    return apiError("좋아요 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
