/** 평점 숫자·별 표시 */

import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

interface RatingDisplayProps {
  rating: number | null;
  className?: string;
}

export function RatingDisplay({ rating, className = "" }: RatingDisplayProps) {
  return (
    <p
      className={`text-center text-[14px] font-bold leading-[145%] tracking-[-0.005em] ${className}`.trim()}
    >
      <span className="text-[#43A7B2]">Rating : </span>
      <span style={{ color: getRatingScoreColor(rating) }}>{formatRating(rating)}</span>
    </p>
  );
}
