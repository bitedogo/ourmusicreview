"use client";
/** 댓글 목록 */

import { CommentItem } from "@/src/components/interaction/CommentItem";
import type { CommentItemData } from "@/src/components/interaction/comment-types";

interface CommentListProps {
  comments: CommentItemData[];
  isLoading: boolean;
  variant: "default" | "detail";
  currentUserId?: string;
  isAdmin?: boolean;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
}

export function CommentList({
  comments,
  isLoading,
  variant,
  currentUserId,
  isAdmin,
  onDelete,
  onReport,
}: CommentListProps) {
  const emptyClass =
    variant === "detail"
      ? "py-6 text-center text-sm text-zinc-400"
      : "py-10 text-center text-xs text-zinc-400";
  const loadingClass =
    variant === "detail"
      ? "py-6 text-center text-sm text-zinc-400"
      : "text-center text-xs text-zinc-400";
  const listClass =
    variant === "detail" ? "space-y-8 px-4 pt-[37px] sm:px-[44px]" : "space-y-6";

  if (isLoading) {
    return (
      <div className={variant === "detail" ? listClass : undefined}>
        <p className={loadingClass}>불러오는 중...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={variant === "detail" ? listClass : undefined}>
        <p className={emptyClass}>첫 번째 댓글을 남겨보세요.</p>
      </div>
    );
  }

  return (
    <div className={listClass}>
      {comments.map((comment) => {
        const canModerate =
          currentUserId === comment.user.id || Boolean(isAdmin);
        return (
          <CommentItem
            key={comment.id}
            comment={comment}
            variant={variant}
            canModerate={canModerate}
            onDelete={onDelete}
            onReport={onReport}
          />
        );
      })}
    </div>
  );
}
