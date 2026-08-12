/** 좋아요/신고 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";

export interface ContentLikeTarget {
  postId?: string;
  reviewId?: string;
  playlistId?: string;
}

function buildLikeQuery(input: ContentLikeTarget): string | null {
  if (input.postId) return `postId=${encodeURIComponent(input.postId)}`;
  if (input.reviewId) return `reviewId=${encodeURIComponent(input.reviewId)}`;
  if (input.playlistId) {
    return `playlistId=${encodeURIComponent(input.playlistId)}`;
  }
  return null;
}

export async function fetchContentLikeStatus(target: ContentLikeTarget) {
  const query = buildLikeQuery(target);
  if (!query) {
    throw new Error("좋아요 대상이 필요합니다.");
  }

  return fetchJson<{ ok: true; data: { count: number; liked: boolean } }>(
    `/api/actions/like?${query}`
  );
}

export async function toggleContentLikeApi(target: ContentLikeTarget) {
  return fetchJson<{ ok: true; data: { liked: boolean } }>("/api/actions/like", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  });
}

export async function submitReportApi(input: {
  reason: string;
  postId?: string;
  reviewId?: string;
}) {
  return fetchJson<{
    ok: true;
    data: { reported: boolean };
    message?: string;
  }>("/api/actions/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
