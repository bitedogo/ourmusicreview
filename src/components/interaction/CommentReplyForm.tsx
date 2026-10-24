"use client";
/** 댓글 답글 작성 폼 */

import { CommentDetailComposeBox } from "@/src/components/interaction/comment-detail-compose-box";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";

interface CommentReplyFormProps {
  content: string;
  isSubmitting: boolean;
  track: CommentTrackData | null;
  onContentChange: (value: string) => void;
  onTrackChange: (track: CommentTrackData | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CommentReplyForm({
  content,
  isSubmitting,
  track,
  onContentChange,
  onTrackChange,
  onSubmit,
}: CommentReplyFormProps) {
  return (
    <form onSubmit={onSubmit} className={form.replyWrap}>
      <CommentDetailComposeBox
        content={content}
        isSubmitting={isSubmitting}
        placeholder="답글을 남겨보세요..."
        track={track}
        onContentChange={onContentChange}
        onTrackChange={onTrackChange}
      />
    </form>
  );
}
