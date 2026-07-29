export type BoardSlug = "domestic" | "overseas" | "market" | "workroom" | "notice";

export function reviewsList(): string {
  return "/reviews";
}

export function reviewDetail(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}`;
}

export function reviewEdit(reviewId: string): string {
  return `/review/${encodeURIComponent(reviewId)}/edit`;
}

export interface ReviewWriteParams {
  albumId?: string;
  title?: string;
  artist?: string;
  imageUrl?: string;
}

export function reviewWrite(params?: ReviewWriteParams): string {
  if (!params) return "/review/write";

  const search = new URLSearchParams();
  if (params.albumId) search.set("albumId", params.albumId);
  if (params.title) search.set("title", params.title);
  if (params.artist) search.set("artist", params.artist);
  if (params.imageUrl) search.set("imageUrl", params.imageUrl);

  const qs = search.toString();
  return qs ? `/review/write?${qs}` : "/review/write";
}

export function reviewAlbum(albumId: string): string {
  return `/review/album/${encodeURIComponent(albumId)}`;
}

export function boardPath(board: BoardSlug | (string & {})): string {
  return `/boards/${board}`;
}

export function communityPost(postId: string): string {
  return `/community/${encodeURIComponent(postId)}`;
}

export function communityWrite(category?: string): string {
  return category ? `/community/write?category=${encodeURIComponent(category)}` : "/community/write";
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

export function userProfilePlaylists(userId: string): string {
  return `/users/${encodeURIComponent(userId)}/playlists`;
}

export function profilePlaylist(playlistId: string): string {
  return `/profile/playlists/${encodeURIComponent(playlistId)}`;
}
