/** 댓글 API 클라이언트 */

import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { fetchJson } from "@/src/lib/http/client";

export {
  updateCommentContentInTree,
  updateCommentLikeInTree,
} from "@/src/lib/comments/comment-tree";

function getCommentQuery(
  postId?: string,
  reviewId?: string,
  playlistId?: string
): string {
  if (postId) return `postId=${encodeURIComponent(postId)}`;
  if (reviewId) return `reviewId=${encodeURIComponent(reviewId)}`;
  return `playlistId=${encodeURIComponent(playlistId ?? "")}`;
}

export async function fetchCommentsApi(
  postId?: string,
  reviewId?: string,
  playlistId?: string,
  options?: { page?: number; pageSize?: number }
) {
  const search = new URLSearchParams(
    getCommentQuery(postId, reviewId, playlistId)
  );
  if (options?.page != null) search.set("page", String(options.page));
  if (options?.pageSize != null) {
    search.set("pageSize", String(options.pageSize));
  }
  return fetchJson<{
    ok: true;
    data: {
      comments: CommentItemData[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }>(`/api/comments?${search}`);
}

export async function createCommentApi(
  content: string,
  postId?: string,
  reviewId?: string,
  parentId?: string,
  playlistId?: string
) {
  return fetchJson<{ ok: true; data: { comment?: { id: string }; id?: string } }>(
    "/api/comments",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, postId, reviewId, playlistId, parentId }),
    }
  );
}

export async function toggleCommentLikeApi(commentId: string) {
  return fetchJson<{ ok: true; data: { liked: boolean; count: number } }>(
    "/api/comments/like",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId }),
    }
  );
}

export async function deleteCommentApi(commentId: string) {
  return fetchJson<{ ok: true; data: { id?: string } }>(
    `/api/comments/${encodeURIComponent(commentId)}`,
    { method: "DELETE" }
  );
}

export async function editCommentApi(commentId: string, content: string) {
  return fetchJson<{ ok: true; data: { id?: string; content?: string } }>(
    `/api/comments/${encodeURIComponent(commentId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }
  );
}
