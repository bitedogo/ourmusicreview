export type BoardSlug = "domestic" | "overseas" | "market" | "workroom" | "notice";

/**
 * 페이지 경로 규칙 (URL 변경 없음)
 * - `/reviews` : 전체 승인 리뷰 목록
 * - `/review/[id]` : 리뷰 상세/수정
 * - `/review/album/[albumId]` : 앨범별 리뷰 목록
 * - `/profile/*` : 내 프로필
 * - `/users/[userId]/*` : 타인 공개 프로필
 */

export function reviewDetail(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}`;
}

export function reviewEdit(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}/edit`;
}

export function boardPath(board: BoardSlug | (string & {})): string {
  return `/boards/${board}`;
}

export function communityDetail(postId: string): string {
  return `/community/${encodeURIComponent(postId)}`;
}

export function communityEdit(postId: string): string {
  return `/community/write?edit=${encodeURIComponent(postId)}`;
}

export type ProfileSelfSubPath =
  | "edit"
  | "reviews"
  | "albums"
  | "playlists"
  | "comments"
  | "posts";

export function profileSelf(sub?: ProfileSelfSubPath): string {
  return sub ? `/profile/${sub}` : "/profile";
}

export function userProfile(userId: string): string {
  return `/users/${encodeURIComponent(userId)}`;
}

export function userProfileReviews(userId: string): string {
  return `/users/${encodeURIComponent(userId)}/reviews`;
}

export function profilePlaylist(playlistId: string): string {
  return `/profile/playlists/${encodeURIComponent(playlistId)}`;
}

/** 공개 플레이리스트 목록 */
export function playlistList(params?: {
  page?: number;
  searchField?: string;
  q?: string;
  genre?: string;
}): string {
  if (!params) return "/playlist";
  const search = new URLSearchParams();
  if (params.page && params.page > 1) {
    search.set("page", String(params.page));
  }
  const q = params.q?.trim();
  if (q) {
    search.set("searchField", params.searchField ?? "title");
    search.set("q", q);
  }
  const genre = params.genre?.trim();
  if (genre) {
    search.set("genre", genre);
  }
  const qs = search.toString();
  return qs ? `/playlist?${qs}` : "/playlist";
}

export function playlistDetail(playlistId: string): string {
  return `/playlist/${encodeURIComponent(playlistId)}`;
}
