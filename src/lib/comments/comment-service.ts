/** 댓글 작성·수정·삭제·목록·댓글 좋아요 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { In } from "typeorm";
import {
  buildCommentTree,
  countAllComments,
} from "@/src/lib/comments/comment-list-service";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { ServiceError } from "@/src/lib/http/service-error";

export interface CreateCommentInput {
  content?: unknown;
  postId?: unknown;
  reviewId?: unknown;
  playlistId?: unknown;
  parentId?: unknown;
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

  if (!contentRaw || (!postId && !reviewId && !playlistId)) {
    throw new ServiceError("필수 정보가 누락되었습니다.", 400);
  }

  const commentRepository = dataSource.getRepository(Comment);
  let resolvedPostId = postId ? String(postId) : null;
  let resolvedReviewId = reviewId ? String(reviewId) : null;
  let resolvedPlaylistId = playlistId ? String(playlistId) : null;

  if (parentId) {
    const parent = await commentRepository.findOne({
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

  const content = String(contentRaw).trim();
  if (!content) {
    throw new ServiceError("댓글 내용을 입력해주세요.", 400);
  }

  const newComment = new Comment();
  newComment.id = randomUUID();
  newComment.content = content;
  newComment.userId = userId;
  newComment.postId = resolvedPostId;
  newComment.reviewId = resolvedReviewId;
  newComment.playlistId = resolvedPlaylistId;
  newComment.parentId = parentId ? String(parentId) : null;

  await commentRepository.save(newComment);
  return newComment;
}

export async function listComments(
  dataSource: DataSource,
  params: {
    postId?: string | null;
    reviewId?: string | null;
    playlistId?: string | null;
    viewerUserId?: string | null;
  }
) {
  const { postId, reviewId, playlistId, viewerUserId } = params;
  if (!postId && !reviewId && !playlistId) {
    throw new ServiceError("postId, reviewId 또는 playlistId가 필요합니다.", 400);
  }

  const commentRepository = dataSource.getRepository(Comment);
  const likeRepository = dataSource.getRepository(Like);

  const comments = await commentRepository.find({
    where: postId
      ? { postId }
      : reviewId
        ? { reviewId }
        : { playlistId: playlistId! },
    relations: ["user"],
    order: { createdAt: "ASC" },
  });

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
    totalCount: countAllComments(tree),
  };
}

export async function updateComment(
  dataSource: DataSource,
  commentId: string,
  actor: { userId: string; isAdmin: boolean },
  content: string
) {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new ServiceError("댓글 내용을 입력해주세요.", 400);
  }

  const commentRepository = dataSource.getRepository(Comment);
  const comment = await commentRepository.findOne({ where: { id: commentId } });
  if (!comment) {
    throw new ServiceError("댓글을 찾을 수 없습니다.", 404);
  }
  if (comment.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("수정 권한이 없습니다.", 403);
  }

  comment.content = trimmed;
  await commentRepository.save(comment);
  return { id: comment.id, content: comment.content };
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

  const likeRepository = dataSource.getRepository(Like);
  const id = String(commentId);
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
