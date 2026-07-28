"use client";
/** 관리자 리뷰 승인 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import {
  REVIEW_REJECTION_REASONS,
  ReviewRejectionReason,
} from "@/src/lib/review/rejection-reasons";
import { ReviewTable } from "./review-table";
import { ReviewDetailModal } from "./review-detail-modal";
import { ReviewRejectModal } from "./review-reject-modal";
import type { Review, ReviewListResponse } from "./types";

export function ReviewApprovalClient() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [viewingReview, setViewingReview] = useState<Review | null>(null);
  const [rejectingReview, setRejectingReview] = useState<Review | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] =
    useState<ReviewRejectionReason>(REVIEW_REJECTION_REASONS[0]);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<ReviewListResponse>("/api/admin/reviews");
      setReviews(data.data.reviews || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "리뷰 목록을 불러오는 중 오류가 발생했습니다."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(reviewId: string) {
    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      await fetchJson<{ ok: boolean }>(
        `/api/admin/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        }
      );

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(getApiErrorMessage(err, "리뷰 승인 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  }

  async function handleReject(reviewId: string, rejectReason: ReviewRejectionReason) {
    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      await fetchJson<{ ok: boolean }>(
        `/api/admin/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", rejectReason }),
        }
      );

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      setRejectingReview(null);
    } catch (err) {
      alert(getApiErrorMessage(err, "리뷰 반려 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">리뷰 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">리뷰 승인 관리</h1>
      </section>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          승인 대기 중인 리뷰가 없습니다.
        </div>
      ) : (
        <ReviewTable
          reviews={reviews}
          processingIds={processingIds}
          onView={setViewingReview}
          onApprove={handleApprove}
          onReject={(review) => {
            setSelectedRejectReason(REVIEW_REJECTION_REASONS[0]);
            setRejectingReview(review);
          }}
        />
      )}

      {viewingReview && (
        <ReviewDetailModal
          review={viewingReview}
          onClose={() => setViewingReview(null)}
        />
      )}

      {rejectingReview && (
        <ReviewRejectModal
          review={rejectingReview}
          selectedReason={selectedRejectReason}
          isProcessing={processingIds.has(rejectingReview.id)}
          onSelectReason={setSelectedRejectReason}
          onCancel={() => setRejectingReview(null)}
          onConfirm={() => handleReject(rejectingReview.id, selectedRejectReason)}
        />
      )}
    </div>
  );
}
