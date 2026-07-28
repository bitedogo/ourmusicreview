/**
 * Canonical internal path builders (Phase 7 dual-route audit).
 *
 * Use these helpers instead of hardcoding path strings so link shapes only
 * need to change in one place. This file is also the record of the dual
 * "list vs action" route audit below — read it before adding a redirect for
 * any of these three pairs.
 *
 * ## Audit findings — no true duplicates, no redirects added
 *
 * 1. `/reviews` (list) vs `/review/*` (write / detail / edit / per-album list)
 *    - `/reviews` — `app/reviews/page.tsx` → paginated, sortable, searchable
 *      list of all approved reviews.
 *    - `/review/write` — `app/review/write/page.tsx` → new review form.
 *    - `/review/[id]` — `app/review/[id]/page.tsx` → single review detail.
 *    - `/review/[id]/edit` — `app/review/[id]/edit/page.tsx` → edit form.
 *    - `/review/album/[albumId]` — `app/review/album/[albumId]/page.tsx` →
 *      all reviews for one album.
 *    These are a singular/plural "list vs. item action" split by design,
 *    not duplicate content. **No redirect needed.**
 *
 * 2. `/boards/[board]` (listing) vs `/community/*` (write / detail)
 *    - `/boards/[board]` — `app/boards/[board]/page.tsx` → per-category post
 *      listing + search/pagination, where `board` is one of `domestic`,
 *      `overseas`, `market`, `workroom`, `notice`.
 *    - `/community/write` — `app/community/write/page.tsx` → write form
 *      (also used for edit via `?edit=<postId>`).
 *    - `/community/[id]` — `app/community/[id]/page.tsx` → post detail.
 *    Boards is the listing surface, community is the content surface for
 *    posts that live inside a board. **No redirect needed.**
 *
 * 3. `/profile` (self) vs `/users/[userId]` (other)
 *    - `/profile` (+ `/profile/edit`, `/profile/reviews`, `/profile/albums`,
 *      `/profile/comments`, `/profile/posts`) — `app/profile/**` → the
 *      signed-in user's own mypage, session-gated server-side.
 *    - `/users/[userId]` — `app/users/[userId]/page.tsx` → any user's public
 *      profile as seen by others. When a signed-in user opens their own
 *      `/users/:id`, the client redirects them to `/profile` (see
 *      `getOwnerProfileRedirectPath` in
 *      `src/components/profile/profile-routes.ts`), so the "self" case
 *      never renders the public view.
 *    Self vs. other, not duplicate content. **No redirect needed.**
 *
 * Conclusion: `next.config.ts` has no redirects for these pairs because no
 * legacy/duplicate route was found — both sides of each pair are reachable,
 * intentional, and serve different purposes. If a route is ever renamed or
 * merged in the future, add the old→new mapping to the `redirects()`
 * function in `next.config.ts` and update this comment.
 */

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

export type ProfileSelfSubPath = "edit" | "reviews" | "albums" | "comments" | "posts";

export function profileSelf(sub?: ProfileSelfSubPath): string {
  return sub ? `/profile/${sub}` : "/profile";
}

export function userProfile(userId: string): string {
  return `/users/${encodeURIComponent(userId)}`;
}

export function userProfileReviews(userId: string): string {
  return `/users/${encodeURIComponent(userId)}/reviews`;
}
