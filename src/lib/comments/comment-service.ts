/** 댓글 작성·수정·삭제·목록·댓글 좋아요 */

import { randomUUID } from "crypto";
import type { DataSource, FindOptionsWhere } from "typeorm";
import { In, IsNull } from "typeorm";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import {
  buildCommentTree,
  commentTrackFromRow,
  countAllComments,
} from "@/src/lib/comments/comment-list-service";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { User } from "@/src/lib/db/entities/User";
import { ServiceError } from "@/src/lib/http/service-error";
import { resolveSongSnapshot } from "@/src/lib/itunes/song-snapshot";
import { assertPlaylistReadable } from "@/src/lib/playlists/playlist-access";
import { notifyCommentCreated, notifyCommentLiked } from "@/src/lib/notifications/activity-notifications";

export interface CreateCommentInput {
  content?: unknown;
  postId?: unknown;
  reviewId?: unknown;
  playlistId?: unknown;
  parentId?: unknown;
  trackId?: unknown;
}

function readTrackId(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^\d{1,20}$/.test(value.trim())) {
    throw new ServiceError("곡 번호가 올바르지 않습니다.", 400);
  }
  return value.trim();
}

async function trackFromId(trackId: string | null): Promise<CommentTrackData | null> {
  if (!trackId) return null;
  const track = await resolveSongSnapshot(trackId);
  if (!track) {
    throw new ServiceError("추천할 곡을 찾지 못했습니다.", 400);
  }
  return track;
}

function assignCommentTrack(comment: Comment, track: CommentTrackData | null) {
  comment.trackId = track?.trackId ?? null;
  comment.trackName = track?.trackName ?? null;
  comment.artistName = track?.artistName ?? null;
  comment.collectionId = track?.collectionId ?? null;
  comment.collectionName = track?.collectionName ?? null;
  comment.artworkUrl = track?.artworkUrl ?? null;
  comment.previewUrl = track?.previewUrl ?? null;
}

export async function createComment(
  dataSource: DataSource,
  userId: string,
  body: CreateCommentInput
) {
  const contentRaw = body.content;
  const postId = body.postId;
  const reviewId = body.reviewId;
  const playlistId = body.playlistId;
  const parentId = body.parentId;

  if (!postId && !reviewId && !playlistId && !parentId) {
    throw new ServiceError("필수 정보가 누락되었습니다.", 400);
  }

  let resolvedPostId = postId ? String(postId) : null;
  let resolvedReviewId = reviewId ? String(reviewId) : null;
  let resolvedPlaylistId = playlistId ? String(playlistId) : null;

  if (parentId) {
    const parent = await dataSource.getRepository(Comment).findOne({
      where: { id: String(parentId) },
    });
    if (!parent) {
      throw new ServiceError("원본 댓글을 찾을 수 없습니다.", 404);
    }
    if (parent.parentId) {
      throw new ServiceError("대댓글에는 답글을 달 수 없습니다.", 400);
    }
    resolvedPostId = parent.postId ?? null;
    resolvedReviewId = parent.reviewId ?? null;
    resolvedPlaylistId = parent.playlistId ?? null;
  }

  if (resolvedPlaylistId) {
    await assertPlaylistReadable(dataSource, resolvedPlaylistId, userId);
  }

  const content = typeof contentRaw === "string" ? contentRaw.trim() : "";
  const track = await trackFromId(readTrackId(body.trackId));
  if ((content && track) || (!content && !track)) {
    throw new ServiceError(
      content && track
        ? "글과 곡은 함께 등록할 수 없습니다."
        : "댓글 내용을 입력하거나 곡을 골라주세요.",
      400
    );
  }

  const newComment = new Comment();
  newComment.id = randomUUID();
  newComment.content = content;
  newComment.userId = userId;
  newComment.postId = resolvedPostId;
  newComment.reviewId = resolvedReviewId;
  newComment.playlistId = resolvedPlaylistId;
  newComment.parentId = parentId ? String(parentId) : null;
  assignCommentTrack(newComment, track);

  await dataSource.getRepository(Comment).save(newComment);

  const user = await dataSource.getRepository(User).findOne({
    where: { id: userId },
    select: ["id", "nickname"],
  });
  await notifyCommentCreated(
    dataSource,
    userId,
    user?.nickname ?? "누군가",
    newComment,
    content,
    newComment.trackName
  );

  return newComment;
}

export async function listComments(
  dataSource: DataSource,
  params: {
    postId?: string | null;
    reviewId?: string | null;
    playlistId?: string | null;
    viewerUserId?: string | null;
    page?: string | number | null;
    pageSize?: string | number | null;
  }
) {
  const { postId, reviewId, playlistId, viewerUserId } = params;
  if (!postId && !reviewId && !playlistId) {
    throw new ServiceError("postId, reviewId 또는 playlistId가 필요합니다.", 400);
  }

  if (playlistId) {
    await assertPlaylistReadable(dataSource, String(playlistId), viewerUserId);
  }

  const commentRepository = dataSource.getRepository(Comment);
  const likeRepository = dataSource.getRepository(Like);
  const targetWhere: FindOptionsWhere<Comment> = postId
    ? { postId }
    : reviewId
      ? { reviewId }
      : { playlistId: playlistId! };
  const requestedPage = Number(params.page);
  const requestedPageSize = Number(params.pageSize);
  const isPaginated = params.page != null || params.pageSize != null;
  const pageSize =
    Number.isInteger(requestedPageSize) && requestedPageSize > 0
      ? Math.min(requestedPageSize, 100)
      : 10;

  let page = 1;
  let totalPages = 1;
  let totalCount = 0;
  let comments: Comment[];

  if (isPaginated) {
    const [allCount, rootCount] = await Promise.all([
      commentRepository.count({ where: targetWhere }),
      commentRepository.count({
        where: { ...targetWhere, parentId: IsNull() },
      }),
    ]);
    totalCount = allCount;
    totalPages = Math.max(1, Math.ceil(rootCount / pageSize));
    page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? Math.min(requestedPage, totalPages)
        : 1;

    const roots = await commentRepository.find({
      where: { ...targetWhere, parentId: IsNull() },
      relations: ["user"],
      order: { createdAt: "ASC" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const rootIds = roots.map((comment) => comment.id);
    const replies =
      rootIds.length > 0
        ? await commentRepository.find({
            where: { parentId: In(rootIds) },
            relations: ["user"],
            order: { createdAt: "ASC" },
          })
        : [];
    comments = [...roots, ...replies];
  } else {
    comments = await commentRepository.find({
      where: targetWhere,
      relations: ["user"],
      order: { createdAt: "ASC" },
    });
  }

  const commentIds = comments.map((comment) => comment.id);
  const likeCountByCommentId = new Map<string, number>();
  const likedCommentIds = new Set<string>();

  if (commentIds.length > 0) {
    const likeRows = await likeRepository
      .createQueryBuilder("like")
      .select("like.comment_id", "commentId")
      .addSelect("COUNT(*)", "count")
      .where("like.comment_id IN (:...commentIds)", { commentIds })
      .groupBy("like.comment_id")
      .getRawMany<{ commentId: string; count: string }>();

    for (const row of likeRows) {
      likeCountByCommentId.set(row.commentId, Number(row.count));
    }

    if (viewerUserId) {
      const myLikes = await likeRepository.find({
        where: {
          userId: viewerUserId,
          commentId: In(commentIds),
        },
        select: ["commentId"],
      });
      for (const like of myLikes) {
        if (like.commentId) likedCommentIds.add(like.commentId);
      }
    }
  }

  const tree = buildCommentTree(
    comments,
    likeCountByCommentId,
    likedCommentIds
  );

  return {
    comments: tree,
    totalCount: isPaginated ? totalCount : countAllComments(tree),
    page,
    pageSize: isPaginated ? pageSize : Math.max(tree.length, 1),
    totalPages: isPaginated ? totalPages : 1,
  };
}

export async function updateComment(
  dataSource: DataSource,
  commentId: string,
  actor: { userId: string; isAdmin: boolean },
  content: string,
  trackId?: unknown
) {
  const trimmed = content.trim();

  const commentRepository = dataSource.getRepository(Comment);
  const comment = await commentRepository.findOne({ where: { id: commentId } });
  if (!comment) {
    throw new ServiceError("댓글을 찾을 수 없습니다.", 404);
  }
  if (comment.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("수정 권한이 없습니다.", 403);
  }

  comment.content = trimmed;
  if (trackId !== undefined) {
    const nextTrackId = readTrackId(trackId);
    const keepStoredTrack =
      nextTrackId != null &&
      nextTrackId === comment.trackId &&
      comment.trackName != null &&
      comment.artistName != null;
    if (!keepStoredTrack) {
      assignCommentTrack(comment, await trackFromId(nextTrackId));
    }
  }
  const hasText = Boolean(trimmed);
  const hasTrack = Boolean(comment.trackId);
  if (hasText === hasTrack) {
    throw new ServiceError(
      hasText
        ? "글과 곡은 함께 등록할 수 없습니다."
        : "댓글 내용을 입력하거나 곡을 골라주세요.",
      400
    );
  }
  await commentRepository.save(comment);
  return {
    id: comment.id,
    content: comment.content,
    track: commentTrackFromRow(comment),
  };
}

export async function deleteComment(
  dataSource: DataSource,
  commentId: string,
  actor: { userId: string; isAdmin: boolean }
) {
  const commentRepository = dataSource.getRepository(Comment);
  const comment = await commentRepository.findOne({ where: { id: commentId } });
  if (!comment) {
    throw new ServiceError("댓글을 찾을 수 없습니다.", 404);
  }
  if (comment.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("삭제 권한이 없습니다.", 403);
  }
  await commentRepository.remove(comment);
  return { id: comment.id };
}

export async function toggleCommentLike(
  dataSource: DataSource,
  userId: string,
  commentId: string
) {
  if (!commentId) {
    throw new ServiceError("commentId가 필요합니다.", 400);
  }

  const id = String(commentId);
  const comment = await dataSource.getRepository(Comment).findOne({
    where: { id },
    select: ["id", "postId", "reviewId", "playlistId"],
  });
  if (comment?.playlistId) {
    await assertPlaylistReadable(dataSource, comment.playlistId, userId);
  }

  const likeRepository = dataSource.getRepository(Like);
  const existingLike = await likeRepository.findOne({
    where: { userId, commentId: id },
  });

  if (existingLike) {
    await likeRepository.remove(existingLike);
    const count = await likeRepository.count({ where: { commentId: id } });
    return { liked: false, count };
  }

  const newLike = likeRepository.create({
    id: randomUUID(),
    userId,
    commentId: id,
    postId: null,
    reviewId: null,
    playlistId: null,
  });
  await likeRepository.save(newLike);

  if (comment) {
    await notifyCommentLiked(dataSource, userId, comment);
  }

  const count = await likeRepository.count({ where: { commentId: id } });
  return { liked: true, count };
}

export async function getCommentLikeStatus(
  dataSource: DataSource,
  commentId: string,
  viewerUserId?: string | null
) {
  if (!commentId) {
    throw new ServiceError("commentId가 필요합니다.", 400);
  }

  const comment = await dataSource.getRepository(Comment).findOne({
    where: { id: commentId },
    select: ["id", "playlistId"],
  });
  if (comment?.playlistId) {
    await assertPlaylistReadable(
      dataSource,
      comment.playlistId,
      viewerUserId
    );
  }

  const likeRepository = dataSource.getRepository(Like);
  const count = await likeRepository.count({ where: { commentId } });

  let liked = false;
  if (viewerUserId) {
    const myLike = await likeRepository.findOne({
      where: { userId: viewerUserId, commentId },
    });
    liked = !!myLike;
  }

  return { count, liked };
}
