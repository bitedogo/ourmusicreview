/** 타인 유저 프로필 뷰 - 타입 및 경로 헬퍼 */

import { userProfile, userProfileReviews } from "@/src/lib/navigation/routes";
import { ProfileReviewItem } from "./profile-types";

export interface UserProfile {
  id: string;
  nickname: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  createdAt: string;
  averageRating: number;
}

export interface ProfileApiData {
  profile: UserProfile;
  totalReviewCount: number;
  reviews: ProfileReviewItem[];
  reviewsHidden?: boolean;
  favoritesHidden?: boolean;
  masterpiecesHidden?: boolean;
  ratingHidden?: boolean;
}

export const INITIAL_REVIEW_LIMIT = 5;

export function getUserProfilePath(userId: string) {
  return userProfile(userId);
}

export function getUserProfileReviewsPath(userId: string) {
  return userProfileReviews(userId);
}
