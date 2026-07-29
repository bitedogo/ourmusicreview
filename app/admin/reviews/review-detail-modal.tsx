"use client";
/** 리뷰 원문 보기 모달 */

import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { formatReviewDate } from "./format";
import type { Review } from "./types";

interface ReviewDetailModalProps {
  review: Review;
  onClose: () => void;
}

export function ReviewDetailModal({ review, onClose }: ReviewDetailModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-zinc-900">
              {review.album.title} —{" "}
              <ArtistNameLink
                name={review.album.artist}
                className="inline text-left text-base font-semibold text-zinc-900 transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
              />
            </h2>
            <p className="text-xs text-zinc-500">
              {review.user.nickname} ·{" "}
              <span className={review.rating >= 9 ? "font-semibold text-red-600" : ""}>
                {review.rating.toFixed(1)}점
              </span>
              {" · "}
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
          >
            닫기
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
          <HtmlRenderer html={review.content} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
