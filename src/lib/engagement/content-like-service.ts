/** 게시글·리뷰·플레이리스트 좋아요 */

import { randomUUID } from "crypto";
import type { DataSource, FindOptionsWhere } from "typeorm";
import { IsNull } from "typeorm";
import { Like } from "@/src/lib/db/entities/Like";
import { ServiceError } from "@/src/lib/http/service-error";
import { notifyContentLiked } from "@/src/lib/notifications/activity-notifications";

export type ContentLikeTarget = {
  postId: string | null;
  reviewId: string | null;
  playlistId: string | null;
};

export function resolveContentLikeTarget(input: {
  postId?: unknown;
  reviewId?: unknown;
  playlistId?: unknown;
}): ContentLikeTarget {
  const postId = input.postId ? String(input.postId) : null;
  const reviewId = input.reviewId ? String(input.reviewId) : null;
  const playlistId = input.playlistId ? String(input.playlistId) : null;
  const targets = [postId, reviewId, playlistId].filter(Boolean);
  if (targets.length !== 1) {
    throw new ServiceError(
      "postId, reviewId 또는 playlistId 중 하나가 필요합니다.",
      400
    );
  }
  return { postId, reviewId, playlistId };
}

function buildLikeWhere(
  target: ContentLikeTarget,
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

export async function toggleContentLike(
  dataSource: DataSource,
  userId: string,
  target: ContentLikeTarget
) {
  const likeRepository = dataSource.getRepository(Like);
  const existingLike = await likeRepository.findOne({
    where: buildLikeWhere(target, userId),
  });

  if (existingLike) {
    await likeRepository.remove(existingLike);
    return { liked: false };
  }

  const newLike = likeRepository.create({
    id: randomUUID(),
    userId,
    postId: target.postId,
    reviewId: target.reviewId,
    playlistId: target.playlistId,
    commentId: null,
  });
  await likeRepository.save(newLike);
  await notifyContentLiked(dataSource, userId, target);

  return { liked: true };
}

export async function getContentLikeStatus(
  dataSource: DataSource,
  target: ContentLikeTarget,
  viewerUserId?: string | null
) {
  const likeRepository = dataSource.getRepository(Like);
  const count = await likeRepository.count({ where: buildLikeWhere(target) });

  let liked = false;
  if (viewerUserId) {
    const myLike = await likeRepository.findOne({
      where: buildLikeWhere(target, viewerUserId),
    });
    liked = !!myLike;
  }

  return { count, liked };
}
