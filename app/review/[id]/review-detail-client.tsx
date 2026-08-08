"use client";
/** 리뷰 상세 클라이언트 (Figma Frame 82) */

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { InteractionButtons } from "@/src/components/interaction/InteractionButtons";
import { CommentSection } from "@/src/components/interaction/CommentSection";
import { ReviewDetailAlbumCard } from "@/src/components/reviews/ReviewDetailAlbumCard";
import { ReviewDetailBodyCard } from "@/src/components/reviews/ReviewDetailBodyCard";
import {
  BackToListIcon,
  NextReviewIcon,
} from "@/src/components/reviews/review-detail-nav-icons";
import { REVIEW_PAGE_TITLE_CLASS } from "@/src/components/reviews/review-page-styles";
import { useReviewViewIncrement } from "@/src/hooks/use-review-view-increment";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface ReviewDetail {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  rejectReason: string | null;
  userId: string;
  albumId: string;
  views: number;
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
    artistId: string | null;
    imageUrl: string | null;
    genre: string | null;
    releaseDate: string | null;
  };
}

interface ReviewDetailResponse {
  ok: boolean;
  data: {
    review: ReviewDetail;
    nextReviewId: string | null;
  };
}

interface AlbumRatingResponse {
  ok: boolean;
  data: {
    averageRating: number | null;
  };
}

export function ReviewDetailClient({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const fromReviews = from === "reviews";
  const fromMyReviews = from === "my-reviews";
  const backSort = searchParams.get("sort") || "latest";
  const backPage = searchParams.get("page") || "1";
  const { data: session } = useSession();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [nextReviewId, setNextReviewId] = useState<string | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const displayedViews = useReviewViewIncrement(reviewId, review?.views ?? 0);

  const isOwner =
    session?.user?.id === review?.userId ||
    (session?.user as { role?: string })?.role === "ADMIN";

  function getBackHref() {
    if (fromReviews) {
      return `/reviews?sort=${encodeURIComponent(backSort)}&page=${encodeURIComponent(backPage)}`;
    }
    if (fromMyReviews) {
      return "/profile/reviews";
    }
    return null;
  }

  function getNextReviewHref(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    const qs = params.toString();
    return qs
      ? `/review/${encodeURIComponent(id)}?${qs}`
      : `/review/${encodeURIComponent(id)}`;
  }

  function handleGoBack() {
    const href = getBackHref();
    if (href) {
      router.push(href);
      return;
    }
    router.back();
  }

  const handleDelete = async () => {
    if (!confirm("정말로 이 리뷰를 삭제하시겠습니까?")) return;
    if (!review) return;

    const redirectPath =
      getBackHref() ?? `/review/album/${encodeURIComponent(review.albumId)}`;

    try {
      await fetchJson<{ ok: boolean }>(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      alert("리뷰가 삭제되었습니다.");
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      alert(getApiErrorMessage(err, "삭제 중 오류가 발생했습니다."));
    }
  };

  useEffect(() => {
    async function fetchReview() {
      try {
        const detailData = await fetchJson<ReviewDetailResponse>(
          `/api/reviews/${encodeURIComponent(reviewId)}`,
        );
        setReview(detailData.data.review);
        setNextReviewId(detailData.data.nextReviewId ?? null);

        try {
          const ratingData = await fetchJson<AlbumRatingResponse>(
            `/api/albums/${encodeURIComponent(detailData.data.review.albumId)}/rating`,
          );
          setAverageRating(ratingData.data.averageRating ?? null);
        } catch {
          setAverageRating(null);
        }
      } catch (err) {
        setError(
          getApiErrorMessage(err, "리뷰를 불러오는 중 오류가 발생했습니다."),
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchReview();
  }, [reviewId]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col gap-6 px-4 py-10 sm:w-[800px] sm:max-w-none sm:px-0">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">리뷰를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col gap-6 px-4 py-10 sm:w-[800px] sm:max-w-none sm:px-0">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "리뷰를 찾을 수 없습니다."}
        </div>
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex shrink-0 transition hover:opacity-80"
          aria-label="Back to List"
        >
          <BackToListIcon />
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[800px] flex-col px-4 pb-16 pt-[61px] sm:w-[800px] sm:max-w-none sm:px-0">
      <h1 className={`mb-[28px] w-full ${REVIEW_PAGE_TITLE_CLASS}`}>
        리뷰 상세
      </h1>

      <div className="mb-[20px] flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleGoBack}
          className="inline-flex shrink-0 transition hover:opacity-80"
          aria-label="Back to List"
        >
          <BackToListIcon />
        </button>
        {nextReviewId ? (
          <Link
            href={getNextReviewHref(nextReviewId)}
            className="inline-flex shrink-0 transition hover:opacity-80"
            aria-label="Next Review"
          >
            <NextReviewIcon />
          </Link>
        ) : null}
      </div>

      <ReviewDetailAlbumCard
        album={review.album}
        averageRating={averageRating}
      />

      <ReviewDetailBodyCard
        reviewId={reviewId}
        content={review.content}
        rating={review.rating}
        createdAt={review.createdAt}
        views={displayedViews}
        rejectReason={review.rejectReason}
        user={review.user}
        isOwner={isOwner}
        onDelete={handleDelete}
      />

      <div className="pt-4 pb-[30px] sm:pt-[18px] sm:pb-[30px]">
        <InteractionButtons
          reviewId={reviewId}
          authorUserId={review.userId}
          variant="circle"
        />
      </div>

      <CommentSection reviewId={reviewId} variant="detail" />
    </div>
  );
}
