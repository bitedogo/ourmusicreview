"use client";
/** 신고 모달 공통 UI */

import { REPORT_REASONS } from "@/src/components/interaction/report-constants";

interface ReportModalProps {
  title?: string;
  reportReason: string;
  reportDetail: string;
  isSubmitting: boolean;
  onReasonChange: (value: string) => void;
  onDetailChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function ReportModal({
  title = "신고하기",
  reportReason,
  reportDetail,
  isSubmitting,
  onReasonChange,
  onDetailChange,
  onClose,
  onSubmit,
}: ReportModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              신고 사유
            </label>
            <select
              value={reportReason}
              onChange={(e) => onReasonChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            >
              <option value="">사유를 선택하세요</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              상세 내용 (선택)
            </label>
            <textarea
              value={reportDetail}
              onChange={(e) => onDetailChange(e.target.value)}
              rows={4}
              placeholder="추가로 설명할 내용이 있으면 입력해주세요."
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
