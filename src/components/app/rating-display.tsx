/** 평점 숫자·별 표시 */

import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

interface RatingDisplayProps {
  rating: number | null;
  emptyMode?: "dash" | "na" | "cta";
  size?: "default" | "compact";
  className?: string;
}

export function RatingDisplay({
  rating,
  emptyMode = "na",
  size = "default",
  className = "",
}: RatingDisplayProps) {
  const textSize =
    size === "compact"
      ? "text-center text-[9px] font-bold leading-snug tracking-[-0.005em] lg:text-[10px]"
      : "text-center text-[14px] font-bold leading-[145%] tracking-[-0.005em]";

  if (rating == null) {
    if (emptyMode === "cta") {
      return (
        <p className={`${textSize} text-[#43A7B2] ${className}`.trim()}>
          첫 평가 남기기
        </p>
      );
    }

    const emptyLabel = emptyMode === "na" ? "N/A" : "-";
    return (
      <p className={`${textSize} ${className}`.trim()}>
        <span className="text-[#43A7B2]">Rating : </span>
        <span className="text-[var(--color-text-muted)]">{emptyLabel}</span>
      </p>
    );
  }

  return (
    <p className={`${textSize} ${className}`.trim()}>
      <span className="text-[#43A7B2]">Rating : </span>
      <span style={{ color: getRatingScoreColor(rating) }}>{formatRating(rating)}</span>
    </p>
  );
}
