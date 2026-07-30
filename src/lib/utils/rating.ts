/** 평점 표시·집계 유틸 */

export const RATING_COLORS = {
  high: "var(--color-rating-score-high)",
  midHigh: "var(--color-rating-score-mid-high)",
  mid: "var(--color-rating-score-mid)",
  low: "var(--color-rating-score-low)",
} as const;

/** 10.0 → "10", 그 외는 소수 한 자리 유지 (8.0 → "8.0") */
export function formatRating(rating: number | null | undefined): string {
  if (rating == null) return "-";
  const value = Number(rating);
  if (value === 10) return "10";
  return value.toFixed(1);
}

export function getRatingScoreColor(rating: number | null): string {
  if (rating == null) return RATING_COLORS.low;
  if (rating >= 9) return RATING_COLORS.high;
  if (rating >= 6) return RATING_COLORS.midHigh;
  if (rating >= 3) return RATING_COLORS.mid;
  return RATING_COLORS.low;
}

export function getDisplayRating(
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined
): string {
  if (reviewCount && averageRating != null) {
    return formatRating(averageRating);
  }
  return "-";
}
