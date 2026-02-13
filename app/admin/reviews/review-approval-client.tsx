"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";

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

export function ReviewApprovalClient() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [viewingReview, setViewingReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/reviews");
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "리뷰 목록을 불러올 수 없습니다.");
        return;
      }

      setReviews(data.reviews || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "리뷰 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(reviewId: string) {
    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      const response = await fetch(
        `/api/admin/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve" }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "리뷰 승인에 실패했습니다.");
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(
        err instanceof Error
          ? `리뷰 승인 중 오류가 발생했습니다: ${err.message}`
          : "리뷰 승인 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    }
  }

  async function handleReject(reviewId: string) {
    if (!confirm("이 리뷰를 거부하시겠습니까? 거부된 리뷰는 삭제됩니다.")) {
      return;
    }

    setProcessingIds((prev) => new Set(prev).add(reviewId));
    try {
      const response = await fetch(
        `/api/admin/reviews/${encodeURIComponent(reviewId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject" }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "리뷰 거부에 실패했습니다.");
        return;
      }

      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(
        err instanceof Error
          ? `리뷰 거부 중 오류가 발생했습니다: ${err.message}`
          : "리뷰 거부 중 알 수 없는 오류가 발생했습니다."
      );
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
                        <span className="text-xs font-bold text-zinc-900">
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
                          className="text-[11px] font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
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
                            else if (value === "reject") handleReject(review.id);
                            e.target.value = "";
                          }}
                          disabled={isProcessing}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">처리 선택</option>
                          <option value="approve">승인</option>
                          <option value="reject">거부</option>
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
                  {viewingReview.user.nickname} · {viewingReview.rating.toFixed(1)}점 ·{" "}
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
    </div>
  );
}
