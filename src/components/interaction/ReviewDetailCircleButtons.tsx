"use client";
/** 리뷰 상세 — 추천·공유·신고 pill 버튼 UI */

import {
  ReviewDetailRecommendIcon,
  ReviewDetailReportIcon,
  ReviewDetailShareIcon,
} from "@/src/components/interaction/interaction-icons";
import { REVIEW_DETAIL_INTERACTION_CLASS as styles } from "@/src/components/interaction/review-detail-interaction-styles";

interface ReviewDetailCircleButtonsProps {
  liked: boolean;
  likeCount: number;
  showReport: boolean;
  onLike: () => void;
  onShare: () => void;
  onReport: () => void;
}

export function ReviewDetailCircleButtons({
  liked,
  likeCount,
  showReport,
  onLike,
  onShare,
  onReport,
}: ReviewDetailCircleButtonsProps) {
  const { pill, label, row, likeRow, shareRow, reportRow } = styles;

  return (
    <div className={styles.root}>
      <button
        type="button"
        onClick={onLike}
        aria-label={liked ? "추천 취소" : "추천"}
        className={`${pill} ${styles.likeButton}`}
      >
        <span className={`${row} ${likeRow}`}>
          <ReviewDetailRecommendIcon liked={liked} />
          <span className={label}>추천</span>
          <span className={label}>{likeCount}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={onShare}
        aria-label="공유"
        className={`${pill} ${styles.shareButton}`}
      >
        <span className={`${row} ${shareRow}`}>
          <ReviewDetailShareIcon />
          <span className={label}>공유</span>
        </span>
      </button>

      {showReport ? (
        <button
          type="button"
          onClick={onReport}
          aria-label="신고"
          className={`${pill} ${styles.reportButton}`}
        >
          <span className={`${row} ${reportRow}`}>
            <ReviewDetailReportIcon className={styles.reportIcon} />
            <span className={label}>신고</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}
