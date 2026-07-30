"use client";
/** 앨범별 리뷰 목록 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { DuplicateReviewModal } from "@/src/components/common/duplicate-review-modal";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { ReviewDetailAlbumCard } from "@/src/components/reviews/ReviewDetailAlbumCard";
import { useStreamingLinks } from "@/src/hooks/use-streaming-links";
import { getHtmlPlainText } from "@/src/lib/utils/editor";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

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
  artistId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  genre: string | null;
  releaseDate: string | null;
}

export function AlbumReviewsClient({ albumId }: { albumId: string }) {
  const router = useRouter();
  const streamingLinks = useStreamingLinks(albumId);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [albumInfo, setAlbumInfo] = useState<AlbumInfo | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

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
          setReviews(reviewsData.data?.reviews || []);
          if (reviewsData.data?.album) {
            setAlbumInfo(reviewsData.data.album);
          }
        }

        if (ratingResult.status === "fulfilled") {
          const { res: ratingResponse, data: ratingData } = ratingResult.value;
          if (!isCancelled && ratingResponse.ok && ratingData?.ok) {
            setAverageRating(ratingData.data?.averageRating ?? null);
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

  const reviewWriteUrl = albumInfo
    ? `/review/write?albumId=${encodeURIComponent(albumInfo.albumId)}&title=${encodeURIComponent(albumInfo.title)}&artist=${encodeURIComponent(albumInfo.artist)}${albumInfo.imageUrl ? `&imageUrl=${encodeURIComponent(albumInfo.imageUrl)}` : ""}`
    : null;

  async function handleReviewWriteClick() {
    if (!albumInfo || isCheckingDuplicate) return;
    setIsCheckingDuplicate(true);
    try {
      const response = await fetch(
        `/api/reviews/check?albumId=${encodeURIComponent(albumInfo.albumId)}`
      );
      const data = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(`/review/album/${encodeURIComponent(albumInfo.albumId)}`)}`
        );
        return;
      }
      if (!response.ok || !data?.ok) {
        return;
      }
      if (data.data?.exists) {
        setIsDuplicateModalOpen(true);
        return;
      }
      if (reviewWriteUrl) {
        router.push(reviewWriteUrl);
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        {albumInfo ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
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
            뒤로가기
          </button>
        ) : (
          <button
            onClick={() => router.back()}
            className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
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
            뒤로가기
          </button>
        )}

        {albumInfo && (
          <div className="mb-4 w-full max-w-[800px]">
            <ReviewDetailAlbumCard
              album={{
                albumId: albumInfo.albumId,
                title: albumInfo.title,
                artist: albumInfo.artist,
                artistId: albumInfo.artistId,
                imageUrl: albumInfo.imageUrl,
                genre: albumInfo.genre,
                releaseDate: albumInfo.releaseDate,
              }}
              averageRating={averageRating}
              showMoreReview={false}
              footerAction={
                <StreamingLinkButtons links={streamingLinks} />
              }
            />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight">리뷰 목록</h1>
          {reviewWriteUrl && (
            <button
              type="button"
              onClick={handleReviewWriteClick}
              disabled={isCheckingDuplicate}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-primary-hover)]"
            >
              {isCheckingDuplicate ? "확인 중..." : "리뷰 작성하기"}
            </button>
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
            <div
              key={review.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/review/${encodeURIComponent(review.id)}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  router.push(`/review/${encodeURIComponent(review.id)}`);
              }}
              className="block cursor-pointer rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link
                    href={getUserProfilePath(review.user.id)}
                    onClick={(event) => event.stopPropagation()}
                    className="shrink-0 rounded-full"
                    aria-label={`${review.user.nickname} 프로필 보기`}
                  >
                    {review.user.profileImage ? (
                      <Image
                        src={review.user.profileImage}
                        alt=""
                        width={40}
                        height={40}
                        sizes="40px"
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">
                        {review.user.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div>
                    <Link
                      href={getUserProfilePath(review.user.id)}
                      onClick={(event) => event.stopPropagation()}
                      className="text-sm font-semibold text-zinc-900 hover:underline"
                    >
                      {review.user.nickname}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {formatDateYYYYMMDD(review.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg font-bold"
                    style={{ color: getRatingScoreColor(review.rating) }}
                  >
                    {formatRating(review.rating)}
                  </span>
                  <span className="text-sm text-zinc-500">/ 10.0</span>
                </div>
              </div>

              <p className="line-clamp-3 text-sm text-zinc-700">
                {getHtmlPlainText(review.content) || "내용 없음"}
              </p>

              {review.isApproved === "N" && (
                <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-900">
                  승인 대기 중
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isDuplicateModalOpen && (
        <DuplicateReviewModal onClose={() => setIsDuplicateModalOpen(false)} />
      )}
    </div>
  );
}
