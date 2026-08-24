/** 댓글·좋아요 알림용 콘텐츠 소유자 조회 */

import type { DataSource, EntityTarget, ObjectLiteral } from "typeorm";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { Post } from "@/src/lib/db/entities/Post";
import { Review } from "@/src/lib/db/entities/Review";

async function findOwnerUserId(
  dataSource: DataSource,
  entity: EntityTarget<ObjectLiteral>,
  alias: string,
  id: string
): Promise<string | null> {
  const row = await dataSource
    .getRepository(entity)
    .createQueryBuilder(alias)
    .select(`${alias}.userId`, "userId")
    .where(`${alias}.id = :id`, { id })
    .getRawOne<{ userId: string }>();
  return row?.userId ?? null;
}

export function findPostOwnerUserId(dataSource: DataSource, postId: string) {
  return findOwnerUserId(dataSource, Post, "post", postId);
}

export function findReviewOwnerUserId(dataSource: DataSource, reviewId: string) {
  return findOwnerUserId(dataSource, Review, "review", reviewId);
}

export function findPlaylistOwnerUserId(
  dataSource: DataSource,
  playlistId: string
) {
  return findOwnerUserId(dataSource, Playlist, "playlist", playlistId);
}

export function findCommentAuthorUserId(
  dataSource: DataSource,
  commentId: string
) {
  return findOwnerUserId(dataSource, Comment, "comment", commentId);
}
