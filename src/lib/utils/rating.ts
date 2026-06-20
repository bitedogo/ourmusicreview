export const RATING_COLORS = {
  label: "var(--color-rating-label)",
  high: "var(--color-rating-score-high)",
  midHigh: "var(--color-rating-score-mid-high)",
  mid: "var(--color-rating-score-mid)",
  low: "var(--color-rating-score-low)",
} as const;

export function formatRating(rating: number | null): string {
  return rating != null ? rating.toFixed(1) : "-";
}

export function getRatingScoreColor(rating: number | null): string {
  if (rating == null) return RATING_COLORS.low;
  if (rating >= 9) return RATING_COLORS.high;
  if (rating >= 6) return RATING_COLORS.midHigh;
  if (rating >= 3) return RATING_COLORS.mid;
  return RATING_COLORS.low;
}

export function isHighRating(
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined
): boolean {
  return (
    reviewCount != null &&
    reviewCount > 0 &&
    averageRating != null &&
    averageRating >= 9
  );
}

export function getRatingTextClassName(
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined
): string {
  return isHighRating(averageRating, reviewCount)
    ? "text-red-600"
    : "text-zinc-900";
}

export function getDisplayRating(
  averageRating: number | null | undefined,
  reviewCount: number | null | undefined
): string {
  if (reviewCount && averageRating != null) {
    return averageRating.toFixed(1);
  }
  return "-";
}
