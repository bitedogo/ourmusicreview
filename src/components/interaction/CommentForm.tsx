"use client";
/** 댓글 작성 폼 — detail / default */

import { CommentDetailComposeBox } from "@/src/components/interaction/comment-detail-compose-box";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";

interface CommentFormProps {
  variant: "default" | "detail";
  content: string;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CommentForm({
  variant,
  content,
  isSubmitting,
  isLoggedIn,
  onContentChange,
  onSubmit,
}: CommentFormProps) {
  if (variant === "detail") {
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
          onContentChange={onContentChange}
        />
      </form>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
        <p className="text-xs text-[var(--color-text-secondary)]">로그인 후 댓글을 남길 수 있습니다.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 border-t border-zinc-50 pt-6">
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="댓글을 남겨보세요..."
        className="min-h-[80px] w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-zinc-400"
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="rounded-full bg-[var(--color-brand-primary)] px-5 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:bg-zinc-200"
        >
          {isSubmitting ? "작성 중..." : "등록"}
        </button>
      </div>
    </form>
  );
}
