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
