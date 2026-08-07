"use client";
/** 댓글 목록 */

import { CommentItem } from "@/src/components/interaction/CommentItem";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import type { CommentItemData } from "@/src/components/interaction/comment-types";

interface CommentListProps {
  comments: CommentItemData[];
  isLoading: boolean;
  variant: "default" | "detail";
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
  variant,
  currentUserId,
  isAdmin,
  isLoggedIn,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: CommentListProps) {
  const isDetail = variant === "detail";
  const statusClass = isDetail
    ? styles.empty
    : "py-10 text-center text-xs text-zinc-400";
  const loadingClass = isDetail
    ? styles.empty
    : "text-center text-xs text-zinc-400";

  if (isLoading) {
    return (
      <div className={isDetail ? styles.listOffset : undefined}>
        <p className={loadingClass}>불러오는 중...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={isDetail ? styles.listOffset : undefined}>
        <p className={statusClass}>첫 번째 댓글을 남겨보세요.</p>
      </div>
    );
  }

  return (
    <div className={isDetail ? styles.list : "space-y-6"}>
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          variant={variant}
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
