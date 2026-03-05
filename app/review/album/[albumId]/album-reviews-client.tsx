"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const [reviewsResult, ratingResult] = await Promise.allSettled([
          fetch(`/api/reviews/album/${encodeURIComponent(albumId)}`).then((res) =>
            res.json().catch(() => null).then((data) => ({ res, data }))
          ),
          fetch(`/api/albums/${encodeURIComponent(albumId)}/rating`).then((res) =>
            res.json().catch(() => null).then((data) => ({ res, data }))
          ),
        ]);

        if (reviewsResult.status !== "fulfilled") {
          if (!isCancelled) {
            setError("리뷰를 불러오는 중 오류가 발생했습니다.");
          }
          return;
        }

        const { res: reviewsResponse, data: reviewsData } = reviewsResult.value;
        if (!reviewsResponse.ok || !reviewsData?.ok) {
          if (!isCancelled) {
            setError(reviewsData?.error ?? "리뷰를 불러올 수 없습니다.");
          }
          return;
        }

        if (!isCancelled) {
          setReviews(reviewsData.reviews || []);
          if (reviewsData.album) {
            setAlbumInfo(reviewsData.album);
          }
        }

        if (ratingResult.status === "fulfilled") {
          const { res: ratingResponse, data: ratingData } = ratingResult.value;
          if (!isCancelled && ratingResponse.ok && ratingData?.ok) {
            setAverageRating(ratingData.averageRating);
          }
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "리뷰를 불러오는 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
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

  const reviewWriteUrl = albumInfo
    ? `/review/write?albumId=${encodeURIComponent(albumInfo.albumId)}&title=${encodeURIComponent(albumInfo.title)}&artist=${encodeURIComponent(albumInfo.artist)}${albumInfo.imageUrl ? `&imageUrl=${encodeURIComponent(albumInfo.imageUrl)}` : ""}`
    : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        {albumInfo ? (
          <Link
            href={`/search?artist=${encodeURIComponent(albumInfo.artist)}`}
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
            {albumInfo.artist} 앨범 목록
          </Link>
        ) : (
          <button
            onClick={() => router.back()}
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
            뒤로 가기
          </button>
        )}

        {albumInfo && (
          <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex gap-4">
              {albumInfo.imageUrl && (
                <div className="shrink-0">
                  <Image
                    src={albumInfo.imageUrl}
                    alt={albumInfo.title}
                    width={80}
                    height={80}
                    unoptimized
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
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-zinc-600">Rating :</span>
                  <span
                    className={`text-base font-bold ${averageRating != null && averageRating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                  >
                    {averageRating !== null ? averageRating.toFixed(1) : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">리뷰 목록</h1>
          {reviewWriteUrl && (
            <Link
              href={reviewWriteUrl}
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              리뷰 작성하기
            </Link>
          )}
        </div>
      </section>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
          <p className="text-sm font-medium text-zinc-700">
            이 앨범에 대한 리뷰가 아직 없습니다.
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            첫 리뷰를 작성해 주세요.
          </p>
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
                    <Image
                      src={review.user.profileImage}
                      alt={review.user.nickname}
                      width={40}
                      height={40}
                      unoptimized
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
                  <span
                    className={`text-lg font-bold ${review.rating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                  >
                    {review.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-zinc-500">/ 10.0</span>
                </div>
              </div>

              <p className="line-clamp-3 text-sm text-zinc-700">
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
