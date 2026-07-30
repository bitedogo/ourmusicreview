/** 프로필 평균 평점 · 리스너 라벨 유틸 */

import { useMemo } from "react";
import type { ProfileReviewItem } from "./profile-types";

export function getListenerLabel(rating: number): string {
  if (rating < 3) return "Harsh listener";
  if (rating < 5) return "Critical listener";
  if (rating < 6.5) return "Balanced listener";
  if (rating < 8) return "Supportive listener";
  if (rating < 9) return "Positive listener";
  return "Enthusiastic listener";
}

export function computeRating(
  reviews: ProfileReviewItem[],
  averageRating?: number
) {
  const computed =
    averageRating ??
    (reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0);
  const clamped = Math.min(10, Math.max(0, computed));
  return {
    displayRating: clamped,
    listenerLabel: getListenerLabel(clamped),
    hasRatingData:
      reviews.length > 0 || (averageRating !== undefined && averageRating > 0),
  };
}

export function useAverageRating(
  reviews: ProfileReviewItem[],
  averageRating?: number
) {
  return useMemo(
    () => computeRating(reviews, averageRating),
    [reviews, averageRating]
  );
}
