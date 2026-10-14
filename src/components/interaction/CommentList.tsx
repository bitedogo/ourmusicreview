"use client";
/** 댓글 목록 */

import { CommentDetailItem } from "@/src/components/interaction/CommentDetailItem";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import type { CommentItemData } from "@/src/components/interaction/comment-types";

interface CommentListProps {
  comments: CommentItemData[];
  isLoading: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
}

export function CommentList({
  comments,
  isLoading,
  currentUserId,
  isAdmin,
  isLoggedIn,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className={styles.listOffset}>
        <p className={styles.empty}>불러오는 중...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={styles.listOffset}>
        <p className={styles.empty}>첫 번째 댓글을 남겨보세요.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {comments.map((comment) => (
        <CommentDetailItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onDelete={onDelete}
          onEdit={onEdit}
          onLike={onLike}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
