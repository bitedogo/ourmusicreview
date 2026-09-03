/** Masterpiece 카드 하단 평점·CTA */

import { RatingDisplay } from "@/src/components/app/rating-display";

interface MasterpieceRatingFooterProps {
  rating?: number | null;
}

export function MasterpieceRatingFooter({ rating = null }: MasterpieceRatingFooterProps) {
  return (
    <RatingDisplay
      rating={rating}
      size="compact"
      emptyMode="cta"
      className="text-[9px] lg:text-[10px]"
    />
  );
}
