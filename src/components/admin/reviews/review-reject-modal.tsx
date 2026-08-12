"use client";
/** 리뷰 반려 사유 선택 모달 */

import {
  REVIEW_REJECTION_REASONS,
  ReviewRejectionReason,
} from "@/src/lib/reviews/rejection-reasons";
import type { Review } from "./types";

interface ReviewRejectModalProps {
  review: Review;
  selectedReason: ReviewRejectionReason;
  isProcessing: boolean;
  onSelectReason: (reason: ReviewRejectionReason) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ReviewRejectModal({
  review,
  selectedReason,
  isProcessing,
  onSelectReason,
  onCancel,
  onConfirm,
}: ReviewRejectModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">리뷰 반려</h3>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          반려 사유를 선택하면 작성자 마이페이지에 표시됩니다.
        </p>

        <div className="mt-4 space-y-2">
          {REVIEW_REJECTION_REASONS.map((reason) => (
            <label key={reason} className="flex items-start gap-2 text-sm text-[var(--color-text-primary)]">
              <input
                type="radio"
                name="rejectReason"
                checked={selectedReason === reason}
                onChange={() => onSelectReason(reason)}
                className="mt-0.5 h-4 w-4 border-zinc-300"
              />
              <span>{reason}</span>
            </label>
          ))}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-zinc-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {isProcessing ? "처리 중..." : "반려"}
          </button>
        </div>
      </div>
    </div>
  );
}
