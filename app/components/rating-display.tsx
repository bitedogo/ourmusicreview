import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

interface RatingDisplayProps {
  rating: number | null;
  className?: string;
}

export function RatingDisplay({ rating, className = "" }: RatingDisplayProps) {
  return (
    <p
      className={`text-center text-[length:var(--text-featured-rating)] font-bold leading-normal ${className}`.trim()}
    >
      <span className="text-[var(--color-rating-label)]">Rating : </span>
      <span style={{ color: getRatingScoreColor(rating) }}>{formatRating(rating)}</span>
    </p>
  );
}
