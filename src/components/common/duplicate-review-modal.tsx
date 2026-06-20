"use client";

interface DuplicateReviewModalProps {
  onClose: () => void;
}

export function DuplicateReviewModal({ onClose }: DuplicateReviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-zinc-900">리뷰 작성 불가</h3>
        <p className="mt-2 text-sm text-zinc-600">
          동일한 앨범에는 리뷰를 1개만 작성할 수 있습니다.
        </p>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
