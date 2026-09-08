/** 평점 표시·집계 유틸 */

export const RATING_COLORS = {
  high: "var(--color-rating-score-high)",
  midHigh: "var(--color-rating-score-mid-high)",
  mid: "var(--color-rating-score-mid)",
  low: "var(--color-rating-score-low)",
} as const;

export const EMPTY_RATING_COLOR = "var(--color-text-muted)";

export const RATING_MIN = 0;
export const RATING_MAX = 10;

/** 슬라이더 부동소수를 0.0–10.0 한 자리로 맞춘다. */
export function normalizeReviewRating(value: unknown): number | undefined {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < RATING_MIN ||
    value > RATING_MAX
  ) {
    return undefined;
  }
  return Number((Math.round(value * 10) / 10).toFixed(1));
}

/** pg numeric / JSON 문자열이 `+`에서 이어 붙여지지 않게 숫자로 바꾼다. */
export function toRatingNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** 평점 배열 평균. 소수 둘째 자리에서 버린다 (3.55 → 3.5). */
export function averageFromRatings(values: readonly unknown[]): number | null {
  let sum = 0;
  let count = 0;
  for (const value of values) {
    const n = toRatingNumber(value);
    if (n == null) continue;
    sum += n;
    count += 1;
  }
  if (count === 0) return null;
  return Math.trunc((sum / count) * 10) / 10;
}

/** 10.0 → "10", 그 외는 소수 한 자리 유지 (8.0 → "8.0") */
export function formatRating(rating: number | null | undefined): string {
  const value = toRatingNumber(rating);
  if (value == null) return "N/A";
  if (value === 10) return "10";
  return value.toFixed(1);
}

export function getRatingScoreColor(rating: number | null): string {
  if (rating == null) return EMPTY_RATING_COLOR;
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
  return "N/A";
}

export function getDisplayRatingColor(
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined
): string {
  if (reviewCount && averageRating != null) {
    return getRatingScoreColor(averageRating);
  }
  return EMPTY_RATING_COLOR;
}
