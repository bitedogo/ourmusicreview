"use client";
/** 관리자 리뷰 승인 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import {
  REVIEW_REJECTION_REASONS,
  ReviewRejectionReason,
} from "@/src/lib/review/rejection-reasons";

interface Review {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  userId: string;
  albumId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  };
}

interface ReviewListResponse {
  ok: boolean;
  data: {
    reviews: Review[];
  };
}

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

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
                    <tr
                      key={review.id}
                      className="hover:bg-zinc-50"
                    >
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
                          {formatDate(review.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        <button
                          type="button"
                          onClick={() => setViewingReview(review)}
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
                            if (value === "approve") handleApprove(review.id);
                            else if (value === "reject") {
                              setSelectedRejectReason(REVIEW_REJECTION_REASONS[0]);
                              setRejectingReview(review);
                            }
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
      )}

      {viewingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewingReview(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-zinc-900">
                  {viewingReview.album.title} — {viewingReview.album.artist}
                </h2>
                <p className="text-xs text-zinc-500">
                  {viewingReview.user.nickname} ·{" "}
                  <span className={viewingReview.rating >= 9 ? "font-semibold text-red-600" : ""}>
                    {viewingReview.rating.toFixed(1)}점
                  </span>
                  {" · "}
                  {formatDate(viewingReview.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReview(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
              >
                닫기
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <HtmlRenderer html={viewingReview.content} className="text-sm" />
            </div>
          </div>
        </div>
      )}

      {rejectingReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setRejectingReview(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-900">리뷰 반려</h3>
            <p className="mt-1 text-xs text-zinc-500">
              반려 사유를 선택하면 작성자 마이페이지에 표시됩니다.
            </p>

            <div className="mt-4 space-y-2">
              {REVIEW_REJECTION_REASONS.map((reason) => (
                <label key={reason} className="flex items-start gap-2 text-sm text-zinc-700">
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedRejectReason === reason}
                    onChange={() => setSelectedRejectReason(reason)}
                    className="mt-0.5 h-4 w-4 border-zinc-300"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingReview(null)}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => handleReject(rejectingReview.id, selectedRejectReason)}
                disabled={processingIds.has(rejectingReview.id)}
                className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {processingIds.has(rejectingReview.id) ? "처리 중..." : "반려"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
