export type BoardSlug = "domestic" | "overseas" | "market" | "workroom" | "notice";

export function reviewDetail(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}`;
}

export function reviewEdit(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}/edit`;
}

export function boardPath(board: BoardSlug | (string & {})): string {
  return `/boards/${board}`;
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

/** 공개 플레이리스트 목록 (내비 미노출 · URL 직접 진입) */
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
