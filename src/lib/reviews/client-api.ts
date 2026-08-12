/** 리뷰 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";

export async function incrementReviewView(reviewId: string) {
  return fetchJson<{
    ok: true;
    data?: { skipped?: boolean; views?: number };
  }>(`/api/reviews/${encodeURIComponent(reviewId)}/view`, {
    method: "POST",
  });
}

export async function checkReviewExists(albumId: string) {
  return fetchJson<{
    ok: true;
    data: { exists: boolean; reviewId?: string };
  }>(`/api/reviews/check?albumId=${encodeURIComponent(albumId)}`);
}

export async function fetchAlbumReviews<T = unknown>(albumId: string) {
  return fetchJson<{ ok: true; data: T }>(
    `/api/reviews/album/${encodeURIComponent(albumId)}`
  );
}

export async function fetchAlbumRating(albumId: string) {
  return fetchJson<{
    ok: true;
    data: { averageRating: number | null; reviewCount: number };
  }>(`/api/albums/${encodeURIComponent(albumId)}/rating`);
}

export async function fetchMyReviews<T = unknown>() {
  return fetchJson<{ ok: true; data: T }>("/api/reviews");
}

export async function fetchReviewDetail<T = unknown>(reviewId: string) {
  return fetchJson<{ ok: true; data: T }>(
    `/api/reviews/${encodeURIComponent(reviewId)}`
  );
}

export async function deleteReviewApi(reviewId: string) {
  return fetchJson<{ ok: true }>(
    `/api/reviews/${encodeURIComponent(reviewId)}`,
    { method: "DELETE" }
  );
}

export type ReviewListSort = "latest" | "likes" | "comments";
export type ReviewListSearchField = "artist" | "album" | "author";

export interface ReviewListItemDto {
  id: string;
  content: string;
  rating: number;
  albumId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  } | null;
  user: { id: string; nickname: string } | null;
}

export async function fetchReviewList(
  params: {
    sort?: ReviewListSort | string;
    page?: number;
    searchField?: ReviewListSearchField | string;
    q?: string;
  },
  signal?: AbortSignal
) {
  const search = new URLSearchParams({
    sort: params.sort ?? "latest",
    page: String(Math.max(1, params.page ?? 1)),
    searchField: params.searchField ?? "artist",
    q: params.q ?? "",
  });

  return fetchJson<{
    ok: true;
    reviews: ReviewListItemDto[];
    page: number;
    totalPages: number;
  }>(`/api/reviews/list?${search}`, { signal });
}
