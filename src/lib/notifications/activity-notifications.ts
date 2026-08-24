/** 좋아요·댓글 활동 알림 */

import type { DataSource } from "typeorm";
import { Album } from "@/src/lib/db/entities/Album";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { Post } from "@/src/lib/db/entities/Post";
import { Review } from "@/src/lib/db/entities/Review";
import { contentTargetLink } from "@/src/lib/notifications/content-link";
import {
  findCommentAuthorUserId,
  findPlaylistOwnerUserId,
  findPostOwnerUserId,
  findReviewOwnerUserId,
} from "@/src/lib/notifications/content-owner";
import { notifyUnlessSelf } from "@/src/lib/notifications/notification-service";

function commentPreview(actorName: string, content: string): string {
  return `${actorName}: ${content.slice(0, 80)}`;
}

export async function notifyContentLiked(
  dataSource: DataSource,
  actorUserId: string,
  target: {
    postId: string | null;
    reviewId: string | null;
    playlistId: string | null;
  }
) {
  if (target.postId) {
    const [ownerUserId, post] = await Promise.all([
      findPostOwnerUserId(dataSource, target.postId),
      dataSource.getRepository(Post).findOne({
        where: { id: target.postId },
        select: ["id", "title"],
      }),
    ]);
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "POST_LIKE",
      title: "내 게시글에 좋아요가 달렸어요",
      body: post?.title ?? null,
      link: contentTargetLink(target),
    });
    return;
  }

  if (target.reviewId) {
    const ownerUserId = await findReviewOwnerUserId(dataSource, target.reviewId);
    const review = await dataSource.getRepository(Review).findOne({
      where: { id: target.reviewId },
      select: ["id", "albumId"],
    });
    const album = review?.albumId
      ? await dataSource.getRepository(Album).findOne({
          where: { albumId: review.albumId },
          select: ["albumId", "title"],
        })
      : null;
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "REVIEW_LIKE",
      title: "내 리뷰에 좋아요가 달렸어요",
      body: album?.title ?? null,
      link: contentTargetLink(target),
    });
    return;
  }

  if (target.playlistId) {
    const [ownerUserId, playlist] = await Promise.all([
      findPlaylistOwnerUserId(dataSource, target.playlistId),
      dataSource.getRepository(Playlist).findOne({
        where: { id: target.playlistId },
        select: ["id", "title"],
      }),
    ]);
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "PLAYLIST_LIKE",
      title: "내 플레이리스트에 좋아요가 달렸어요",
      body: playlist?.title ?? null,
      link: contentTargetLink(target),
    });
  }
}

export async function notifyCommentCreated(
  dataSource: DataSource,
  actorUserId: string,
  actorName: string,
  comment: {
    parentId?: string | null;
    postId?: string | null;
    reviewId?: string | null;
    playlistId?: string | null;
  },
  content: string
) {
  const link = contentTargetLink(comment);
  const preview = commentPreview(actorName, content);

  if (comment.parentId) {
    const parentUserId = await findCommentAuthorUserId(
      dataSource,
      comment.parentId
    );
    await notifyUnlessSelf(dataSource, parentUserId, actorUserId, {
      type: "COMMENT_REPLY",
      title: "내 댓글에 답글이 달렸어요",
      body: preview,
      link,
    });
    return;
  }

  if (comment.postId) {
    const ownerUserId = await findPostOwnerUserId(dataSource, comment.postId);
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "POST_COMMENT",
      title: "내 게시글에 댓글이 달렸어요",
      body: preview,
      link,
    });
    return;
  }

  if (comment.reviewId) {
    const ownerUserId = await findReviewOwnerUserId(
      dataSource,
      comment.reviewId
    );
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "REVIEW_COMMENT",
      title: "내 리뷰에 댓글이 달렸어요",
      body: preview,
      link,
    });
    return;
  }

  if (comment.playlistId) {
    const ownerUserId = await findPlaylistOwnerUserId(
      dataSource,
      comment.playlistId
    );
    await notifyUnlessSelf(dataSource, ownerUserId, actorUserId, {
      type: "PLAYLIST_COMMENT",
      title: "내 플레이리스트에 댓글이 달렸어요",
      body: preview,
      link,
    });
  }
}

export async function notifyCommentLiked(
  dataSource: DataSource,
  actorUserId: string,
  comment: {
    id: string;
    postId?: string | null;
    reviewId?: string | null;
    playlistId?: string | null;
  }
) {
  const authorUserId = await findCommentAuthorUserId(dataSource, comment.id);
  await notifyUnlessSelf(dataSource, authorUserId, actorUserId, {
    type: "COMMENT_LIKE",
    title: "내 댓글에 좋아요가 달렸어요",
    link: contentTargetLink(comment),
  });
}
