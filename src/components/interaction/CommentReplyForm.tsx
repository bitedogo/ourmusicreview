"use client";
/** 댓글 답글 작성 폼 */

import { CommentDetailComposeBox } from "@/src/components/interaction/comment-detail-compose-box";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";

interface CommentReplyFormProps {
  content: string;
  isSubmitting: boolean;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CommentReplyForm({
  content,
  isSubmitting,
  onContentChange,
  onSubmit,
}: CommentReplyFormProps) {
  return (
    <form onSubmit={onSubmit} className={form.replyWrap}>
      <CommentDetailComposeBox
        content={content}
        isSubmitting={isSubmitting}
        placeholder="답글을 남겨보세요..."
        onContentChange={onContentChange}
      />
    </form>
  );
}
