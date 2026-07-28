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

export function CommentForm({
  variant,
  content,
  isSubmitting,
  isLoggedIn,
  onContentChange,
  onSubmit,
}: CommentFormProps) {
  if (!isLoggedIn) {
    if (variant === "detail") {
      return (
        <div className="py-6 text-center">
          <p className="text-sm text-zinc-500">
            로그인 후 댓글을 남길 수 있습니다.
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
        <p className="text-xs text-zinc-500">로그인 후 댓글을 남길 수 있습니다.</p>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-[711px]">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="멋있는 댓글을 달 수 있는 문화를 만들어 봅시다."
            rows={4}
            className="block h-[120px] w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-6 py-5 pb-12 text-[14px] leading-[200%] text-black outline-none placeholder:text-[#D9D9D9] focus:border-zinc-400"
          />
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="absolute bottom-[8px] right-[8px] flex h-[30px] w-[86px] items-center justify-center rounded-[5px] bg-[#D9D9D9] text-[14px] font-normal text-white transition hover:bg-[#c8c8c8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "..." : "등록"}
          </button>
        </div>
      </form>
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
