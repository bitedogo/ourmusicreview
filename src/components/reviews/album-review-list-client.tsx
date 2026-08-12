"use client";
/** 앨범별 리뷰 목록 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DuplicateReviewModal } from "@/src/components/common/duplicate-review-modal";
import { AlbumReviewListItem } from "@/src/components/reviews/album-review-list-item";
import { ReviewDetailAlbumCard } from "@/src/components/reviews/ReviewDetailAlbumCard";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { useStreamingLinks } from "@/src/hooks/use-streaming-links";
import { ApiClientError, getApiErrorMessage } from "@/src/lib/http/client";
import {
  checkReviewExists,
  fetchAlbumRating,
  fetchAlbumReviews,
} from "@/src/lib/reviews/client-api";
import { buildReviewWritePath } from "@/src/lib/utils/album";

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

export function AlbumReviewListClient({ albumId }: { albumId: string }) {
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

        const reviewsData = await fetchAlbumReviews<{
          reviews: Review[];
          album?: AlbumInfo;
        }>(albumId);

        if (!isCancelled) {
          setReviews(reviewsData.data.reviews || []);
          if (reviewsData.data.album) {
            setAlbumInfo(reviewsData.data.album);
          }
        }

        try {
          const ratingData = await fetchAlbumRating(albumId);
          if (!isCancelled) {
            setAverageRating(ratingData.data.averageRating ?? null);
          }
        } catch {
          /* rating optional */
        }
      } catch (err) {
        if (!isCancelled) {
          setError(
            getApiErrorMessage(err, "리뷰를 불러오는 중 오류가 발생했습니다.")
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      isCancelled = true;
    };
  }, [albumId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-[var(--color-text-secondary)]">
            리뷰를 불러오는 중...
          </div>
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
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const reviewWriteUrl = albumInfo
    ? buildReviewWritePath({
        albumId: albumInfo.albumId,
        title: albumInfo.title,
        artist: albumInfo.artist,
        imageUrl: albumInfo.imageUrl,
      })
    : null;

  async function handleReviewWriteClick() {
    if (!albumInfo || isCheckingDuplicate) return;
    setIsCheckingDuplicate(true);
    try {
      const data = await checkReviewExists(albumInfo.albumId);
      if (data.data.exists) {
        setIsDuplicateModalOpen(true);
        return;
      }
      if (reviewWriteUrl) {
        router.push(reviewWriteUrl);
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(`/review/album/${encodeURIComponent(albumInfo.albumId)}`)}`
        );
      }
    } finally {
      setIsCheckingDuplicate(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 flex w-fit items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
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
              footerAction={<StreamingLinkButtons links={streamingLinks} />}
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
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            이 앨범에 대한 리뷰가 아직 없습니다.
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            첫 리뷰를 작성해 주세요.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <AlbumReviewListItem key={review.id} review={review} />
          ))}
        </div>
      )}

      {isDuplicateModalOpen && (
        <DuplicateReviewModal onClose={() => setIsDuplicateModalOpen(false)} />
      )}
    </div>
  );
}
