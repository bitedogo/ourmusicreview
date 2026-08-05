"use client";
/** 댓글 작성 폼 */

interface CommentFormProps {
  variant: "default" | "detail";
  content: string;
  isSubmitting: boolean;
  isLoggedIn: boolean;
  onContentChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const DETAIL_FORM_BOX_CLASS =
  "relative box-border h-[62px] w-full rounded-[10px] border-[1.75px] border-[#D9D9D9] bg-white";

const DETAIL_FORM_TEXT_CLASS =
  "absolute left-[21px] top-[6px] h-[28px] w-[575px] max-w-[calc(100%-136px)] resize-none overflow-hidden border-0 bg-transparent p-0 text-[14px] font-normal leading-[200%] text-[#505050] outline-none placeholder:text-[#D9D9D9] focus:ring-0";

const DETAIL_SUBMIT_BUTTON_CLASS =
  "absolute bottom-[5px] right-[5px] flex h-[30px] w-[86px] items-center justify-center rounded-[5px] bg-[#D9D9D9] text-[14px] font-normal leading-[200%] text-white transition hover:bg-[#c8c8c8] disabled:cursor-not-allowed disabled:opacity-60";

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
        <div className="mt-[18px]">
          <div className={DETAIL_FORM_BOX_CLASS}>
            <p className={`${DETAIL_FORM_TEXT_CLASS} flex items-center text-[#D9D9D9]`}>
              로그인 후 댓글을 남길 수 있습니다.
            </p>
          </div>
        </div>
      );
    }

    return (
      <form onSubmit={onSubmit} className="mt-[18px]">
        <div className={DETAIL_FORM_BOX_CLASS}>
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="댓글을 남겨보세요..."
            rows={1}
            className={DETAIL_FORM_TEXT_CLASS}
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={DETAIL_SUBMIT_BUTTON_CLASS}
          >
            {isSubmitting ? "..." : "등록"}
          </button>
        </div>
      </form>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
        <p className="text-xs text-zinc-500">로그인 후 댓글을 남길 수 있습니다.</p>
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
