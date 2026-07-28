/** 본인 프로필 URL(/users/:id) → 마이페이지 리다이렉트 경로 */

import { profileSelf } from "@/src/lib/navigation/routes";

export function getOwnerProfileRedirectPath(showAllReviews = false) {
  return showAllReviews ? profileSelf("reviews") : profileSelf();
}
