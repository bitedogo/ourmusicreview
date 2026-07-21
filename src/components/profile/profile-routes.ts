/** 본인 프로필 URL(/users/:id) → 마이페이지 리다이렉트 경로 */

export function getOwnerProfileRedirectPath(showAllReviews = false) {
  return showAllReviews ? "/profile/reviews" : "/profile";
}
