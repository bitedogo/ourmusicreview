"use client";
/** 리뷰 승인 대기 목록 테이블 */

import { formatReviewDate } from "./format";
import type { Review } from "./types";

interface ReviewTableProps {
  reviews: Review[];
  processingIds: Set<string>;
  onView: (review: Review) => void;
  onApprove: (id: string) => void;
  onReject: (review: Review) => void;
}

export function ReviewTable({ reviews, processingIds, onView, onApprove, onReject }: ReviewTableProps) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 text-[11px] font-semibold text-zinc-500">
              <th className="px-3 py-2 text-left">앨범</th>
              <th className="px-3 py-2 text-left">작성자</th>
              <th className="px-3 py-2 text-center">평점</th>
              <th className="px-3 py-2 text-left">작성일</th>
              <th className="px-3 py-2 text-left">원문</th>
              <th className="px-3 py-2 text-left">처리</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => {
              const isProcessing = processingIds.has(review.id);
              return (
                <tr key={review.id} className="hover:bg-zinc-50">
                  <td className="max-w-[220px] px-3 py-2 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <span className="truncate text-xs font-semibold text-zinc-900">
                        {review.album.title}
                      </span>
                      <span className="truncate text-[11px] text-zinc-500">
                        {review.album.artist}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-middle">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-xs font-semibold text-zinc-900">
                        {review.user.nickname}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {review.user.id}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center align-middle">
                    <span
                      className={`text-xs font-bold ${review.rating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                    >
                      {review.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-left align-middle">
                    <span className="text-[11px] text-zinc-500">
                      {formatReviewDate(review.createdAt)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-left align-middle">
                    <button
                      type="button"
                      onClick={() => onView(review)}
                      className="text-[11px] font-medium text-zinc-700 underline underline-offset-2 hover:text-[var(--color-brand-primary)]"
                    >
                      보기
                    </button>
                  </td>
                  <td className="px-3 py-2 text-left align-middle">
                    <select
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;
                        if (value === "approve") onApprove(review.id);
                        else if (value === "reject") onReject(review);
                        e.target.value = "";
                      }}
                      disabled={isProcessing}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">처리 선택</option>
                      <option value="approve">승인</option>
                      <option value="reject">반려</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
