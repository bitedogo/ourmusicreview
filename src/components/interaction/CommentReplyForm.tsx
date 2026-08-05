"use client";
/** 댓글 답글 작성 폼 */

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
      <form onSubmit={onSubmit} className="mt-3">
        <div className="relative box-border h-[62px] w-full rounded-[10px] border-[1.75px] border-[#D9D9D9] bg-white pl-[21px] pr-[92px]">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="답글을 남겨보세요..."
            rows={1}
            className="absolute left-[21px] top-[6px] h-[28px] w-[calc(100%-113px)] resize-none overflow-hidden border-0 bg-transparent p-0 text-[14px] font-normal leading-[200%] text-[#505050] outline-none placeholder:text-[#D9D9D9] focus:ring-0"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="absolute bottom-[5px] right-[5px] flex h-[30px] w-[86px] items-center justify-center rounded-[5px] bg-[#D9D9D9] text-[14px] font-normal leading-[200%] text-white transition hover:bg-[#c8c8c8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "..." : "등록"}
          </button>
        </div>
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
