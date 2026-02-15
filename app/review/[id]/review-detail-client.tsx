"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { InteractionButtons } from "@/src/components/interaction/InteractionButtons";
import { CommentSection } from "@/src/components/interaction/CommentSection";

interface ReviewDetail {
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

export function ReviewDetailClient({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromReviews = searchParams.get("from") === "reviews";
  const backSort = searchParams.get("sort") || "latest";
  const backPage = searchParams.get("page") || "1";
  const { data: session } = useSession();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = session?.user?.id === review?.userId || (session?.user as { role?: string })?.role === "ADMIN";

  const handleDelete = async () => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.ok) {
        alert("리뷰가 삭제되었습니다.");
        router.push("/");
        router.refresh();
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(`/api/reviews/${encodeURIComponent(reviewId)}`);
        const data = await response.json();

        if (!response.ok || !data?.ok) {
          setError(data?.error ?? "리뷰를 불러올 수 없습니다.");
          return;
        }

        setReview(data.review);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "리뷰를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchReview();
  }, [reviewId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">리뷰를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "리뷰를 찾을 수 없습니다."}
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <Link
          href={
            fromReviews
              ? `/reviews?sort=${encodeURIComponent(backSort)}&page=${encodeURIComponent(backPage)}`
              : `/review/album/${encodeURIComponent(review.albumId)}`
          }
          className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {fromReviews ? "앨범 리뷰로" : "뒤로가기"}
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">리뷰 상세</h1>
      </section>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          {review.album.imageUrl && (
            <div className="shrink-0">
              <img
                src={review.album.imageUrl}
                alt={review.album.title}
                className="h-24 w-24 rounded-xl object-contain"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 truncate">
              {review.album.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 truncate">
              {review.album.artist}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {review.user.profileImage ? (
              <img
                src={review.user.profileImage}
                alt={review.user.nickname}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                {review.user.nickname.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {review.user.nickname}
              </p>
              <p className="text-xs text-zinc-500">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-zinc-900">
              {review.rating.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-500">/ 10.0</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-zinc-700">
          <HtmlRenderer html={review.content} />
        </div>

        {isOwner && (
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-zinc-50">
            <button
              onClick={handleDelete}
              className="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors"
            >
              삭제
            </button>
          </div>
        )}

        {review.isApproved === "N" && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-900">
            이 리뷰는 아직 승인 대기 중입니다.
          </div>
        )}
      </div>

      <InteractionButtons reviewId={reviewId} authorUserId={review.userId} />
      <CommentSection reviewId={reviewId} />

      <div className="flex justify-center">
        <button
          onClick={() => router.push(`/review/album/${encodeURIComponent(review.albumId)}`)}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          이 앨범의 다른 리뷰 보기
        </button>
      </div>
    </div>
  );
}
