/** 플레이리스트 좋아요·댓글 수 표시 */

import {
  ReviewCommentCount,
  ReviewLikeCount,
} from "@/src/components/reviews/review-card-icons";

interface PlaylistEngagementCountsProps {
  likeCount: number;
  commentCount: number;
  className?: string;
  size?: "mobile" | "desktop";
}

export function PlaylistEngagementCounts({
  likeCount,
  commentCount,
  className = "",
  size = "mobile",
}: PlaylistEngagementCountsProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <ReviewLikeCount count={likeCount} size={size} />
      <ReviewCommentCount count={commentCount} size={size} />
    </span>
  );
}
