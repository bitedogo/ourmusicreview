"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

interface AlbumInfo {
  albumId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
}

export function AlbumReviewsClient({ albumId }: { albumId: string }) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // 리뷰 목록 조회
        const reviewsResponse = await fetch(
          `/api/reviews/album/${encodeURIComponent(albumId)}`
        );
        const reviewsData = await reviewsResponse.json();

        if (!reviewsResponse.ok || !reviewsData?.ok) {
          setError(reviewsData?.error ?? "리뷰를 불러올 수 없습니다.");
          return;
        }

        setReviews(reviewsData.reviews || []);

        // 평균 평점 조회
        const ratingResponse = await fetch(
          `/api/albums/${encodeURIComponent(albumId)}/rating`
        );
        const ratingData = await ratingResponse.json();

        if (ratingResponse.ok && ratingData?.ok) {
          setAverageRating(ratingData.averageRating);
          setReviewCount(ratingData.reviewCount);
        }

        // 앨범 정보 설정
        if (reviewsData.album) {
          setAlbumInfo(reviewsData.album);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "리뷰를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [albumId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">리뷰를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
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
        <button
          onClick={() => router.back()}
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
          뒤로 가기
        </button>
        {albumInfo && (
          <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              {albumInfo.imageUrl && (
                <div className="shrink-0">
                  <img
                    src={albumInfo.imageUrl}
                    alt={albumInfo.title}
                    className="h-20 w-20 rounded-xl object-contain"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-zinc-900 truncate">
                  {albumInfo.title}
                </h2>
                <p className="mt-1 text-sm text-zinc-600 truncate">
                  {albumInfo.artist}
                </p>
                {averageRating !== null && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-base font-bold text-zinc-900">
                      ⭐ {averageRating.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500">
                      ({reviewCount}개의 리뷰)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <h1 className="text-xl font-semibold tracking-tight">리뷰 목록</h1>
      </section>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          아직 등록된 리뷰가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/review/${encodeURIComponent(review.id)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
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

              <p className="line-clamp-3 text-sm text-zinc-700">
                {/* HTML 태그를 제거하여 텍스트만 표시 (미리보기용) */}
                {review.content.replace(/<[^>]*>/g, "").trim() || "내용 없음"}
              </p>

              {review.isApproved === "N" && (
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-900">
                  승인 대기 중
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
