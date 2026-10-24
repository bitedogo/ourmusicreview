"use client";
/** 댓글 작성 폼 */

import { CommentDetailComposeBox } from "@/src/components/interaction/comment-detail-compose-box";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";

interface CommentFormProps {
  content: string;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  track: CommentTrackData | null;
  onContentChange: (value: string) => void;
  onTrackChange: (track: CommentTrackData | null) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CommentForm({
  content,
  isSubmitting,
  isLoggedIn,
  track,
  onContentChange,
  onTrackChange,
  onSubmit,
}: CommentFormProps) {
  if (!isLoggedIn) {
    return (
      <div className={form.wrap}>
        <CommentDetailComposeBox
          content=""
          isSubmitting={false}
          placeholder=""
          onContentChange={() => {}}
          message="로그인 후 댓글을 남길 수 있습니다."
        />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={form.wrap}>
      <CommentDetailComposeBox
        content={content}
        isSubmitting={isSubmitting}
        placeholder="댓글을 남겨보세요..."
        track={track}
        onContentChange={onContentChange}
        onTrackChange={onTrackChange}
      />
    </form>
  );
}
