/** 타인 유저 프로필 경로 헬퍼 */

import { userProfile, userProfileReviews } from "@/src/lib/navigation/routes";

export function getUserProfilePath(userId: string) {
  return userProfile(userId);
}

export function getUserProfileReviewsPath(userId: string) {
  return userProfileReviews(userId);
}
