/** 댓글 API 유틸 */

import type { CommentItemData } from "@/src/components/interaction/comment-types";

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function getCommentQuery(
  postId?: string,
  reviewId?: string,
  playlistId?: string
): string {
  if (postId) return `postId=${encodeURIComponent(postId)}`;
  if (reviewId) return `reviewId=${encodeURIComponent(reviewId)}`;
  return `playlistId=${encodeURIComponent(playlistId ?? "")}`;
}

async function parseJson<T>(response: Response): Promise<ApiResult<T>> {
  return (await response.json()) as ApiResult<T>;
}

export async function fetchCommentsApi(
  postId?: string,
  reviewId?: string,
  playlistId?: string
) {
  const query = getCommentQuery(postId, reviewId, playlistId);
  const response = await fetch(`/api/comments?${query}`);
  return parseJson<{ comments: CommentItemData[]; totalCount: number }>(
    response
  );
}

export async function createCommentApi(
  content: string,
  postId?: string,
  reviewId?: string,
  parentId?: string,
  playlistId?: string
) {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, postId, reviewId, playlistId, parentId }),
  });
  return parseJson<{ id?: string }>(response);
}

export async function toggleCommentLikeApi(commentId: string) {
  const response = await fetch("/api/comments/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commentId }),
  });
  return parseJson<{ liked: boolean; count: number }>(response);
}

export async function deleteCommentApi(commentId: string) {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  return parseJson<{ id?: string }>(response);
}

export async function editCommentApi(commentId: string, content: string) {
  const response = await fetch(`/api/comments/${commentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return parseJson<{ id?: string; content?: string }>(response);
}

export function countAllComments(comments: CommentItemData[]): number {
  return comments.reduce(
    (sum, comment) => sum + 1 + countAllComments(comment.replies),
    0
  );
}

export function updateCommentLikeInTree(
  comments: CommentItemData[],
  commentId: string,
  liked: boolean,
  count: number
): CommentItemData[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, liked, likeCount: count };
    }
    return {
      ...comment,
      replies: updateCommentLikeInTree(comment.replies, commentId, liked, count),
    };
  });
}

export function updateCommentContentInTree(
  comments: CommentItemData[],
  commentId: string,
  content: string
): CommentItemData[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, content };
    }
    return {
      ...comment,
      replies: updateCommentContentInTree(comment.replies, commentId, content),
    };
  });
}
