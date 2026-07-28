/** 댓글 API 유틸 */

import type { CommentItemData } from "@/src/components/interaction/comment-types";

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function getCommentQuery(postId?: string, reviewId?: string): string {
  return postId ? `postId=${postId}` : `reviewId=${reviewId ?? ""}`;
}

async function parseJson<T>(response: Response): Promise<ApiResult<T>> {
  return (await response.json()) as ApiResult<T>;
}

export async function fetchCommentsApi(postId?: string, reviewId?: string) {
  const query = getCommentQuery(postId, reviewId);
  const response = await fetch(`/api/comments?${query}`);
  return parseJson<{ comments: CommentItemData[] }>(response);
}

export async function createCommentApi(
  content: string,
  postId?: string,
  reviewId?: string
) {
  const response = await fetch("/api/comments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, postId, reviewId }),
  });
  return parseJson<{ id?: string }>(response);
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
