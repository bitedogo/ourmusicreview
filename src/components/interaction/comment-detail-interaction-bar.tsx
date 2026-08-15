"use client";
/** 리뷰 상세 댓글 — 추천·답글·신고 */

import {
  CommentDetailLikeIcon,
  CommentDetailReplyIcon,
  CommentDetailReportIcon,
} from "@/src/components/interaction/comment-detail-icons";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";

function InteractionCount({ count }: { count: number }) {
  return <span className={styles.interactionCount}>{count}</span>;
}

interface CommentDetailInteractionBarProps {
  isOwner: boolean;
  likeCount?: number;
  replyCount?: number;
  liked?: boolean;
  canReply?: boolean;
  onLikeClick?: () => void;
  onReplyClick?: () => void;
}

export function CommentDetailInteractionBar({
  isOwner,
  likeCount = 0,
  replyCount = 0,
  liked = false,
  canReply = true,
  onLikeClick,
  onReplyClick,
}: CommentDetailInteractionBarProps) {
  return (
    <div className={styles.interactionBar}>
      <button
        type="button"
        onClick={onLikeClick}
        aria-label={liked ? "추천 취소" : "추천"}
        className={styles.interactionButton}
      >
        <CommentDetailLikeIcon liked={liked} />
        <InteractionCount count={likeCount} />
      </button>

      {canReply ? (
        <button
          type="button"
          onClick={onReplyClick}
          aria-label="답글 달기"
          className={styles.interactionButton}
        >
          <CommentDetailReplyIcon />
          <InteractionCount count={replyCount} />
        </button>
      ) : (
        <span className={styles.interactionButton}>
          <CommentDetailReplyIcon />
          <InteractionCount count={replyCount} />
        </span>
      )}

      {!isOwner ? (
        <button
          type="button"
          aria-label="댓글 신고"
          onClick={() => alert("댓글 신고 기능은 준비 중입니다.")}
          className={styles.reportButton}
        >
          <CommentDetailReportIcon />
        </button>
      ) : null}
    </div>
  );
}
