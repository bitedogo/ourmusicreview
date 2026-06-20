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
