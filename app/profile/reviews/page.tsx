"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MyReview {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  albumId: string;
  createdAt: string;
  updatedAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  } | null;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/reviews");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          if (response.status === 401) {
            router.push("/auth/signin?callbackUrl=/profile/reviews");
            return;
          }
          setError(data?.error ?? "리뷰를 불러오지 못했습니다.");
          return;
        }

        setReviews(data.reviews || []);
      } catch {
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          onClick={() => router.push("/profile")}
          className="mb-4 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
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
          마이페이지로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">나의 리뷰 전체보기</h1>
        <p className="text-xs text-zinc-500">내가 작성한 모든 리뷰 목록입니다.</p>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">리뷰를 불러오는 중...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 작성한 리뷰가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/review/${encodeURIComponent(review.id)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {review.album?.imageUrl && (
                  <div className="shrink-0 h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      src={review.album.imageUrl}
                      alt={review.album.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {review.album?.artist}
                      </p>
                      <h3 className="line-clamp-1 text-sm font-bold text-zinc-900">
                        {review.album?.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-900">
                        {review.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-zinc-500 ml-1">/ 10.0</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {review.isApproved === "N" && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800">
                        승인 대기중
                      </span>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                    {review.content.replace(/<[^>]*>/g, "").trim() || "내용 없음"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
