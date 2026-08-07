"use client";
/** 댓글 답글 작성 폼 — detail / default */

import { CommentDetailComposeBox } from "@/src/components/interaction/comment-detail-compose-box";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";

interface CommentReplyFormProps {
  variant: "default" | "detail";
  content: string;
  isSubmitting: boolean;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CommentReplyForm({
  variant,
  content,
  isSubmitting,
  onContentChange,
  onSubmit,
}: CommentReplyFormProps) {
  if (variant === "detail") {
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

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="답글을 남겨보세요..."
        rows={2}
        className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-400"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-full bg-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-bold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:bg-zinc-200"
        >
          {isSubmitting ? "작성 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
