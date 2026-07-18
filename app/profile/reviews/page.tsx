"use client";
/** 내 리뷰 목록 페이지 */

import Link from "next/link";
import Image from "next/image";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import { useAuthenticatedFetch } from "@/src/hooks/use-authenticated-fetch";
import { getHtmlPlainText } from "@/src/lib/utils/editor";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";

interface MyReview {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  rejectReason: string | null;
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

interface MyReviewsResponse {
  ok: boolean;
  data: {
    reviews: MyReview[];
  };
}

export default function MyReviewsPage() {
  const { data, isLoading, error } = useAuthenticatedFetch<MyReviewsResponse>(
    "/api/reviews",
    "/profile/reviews"
  );
  const reviews = data?.data.reviews ?? [];

  return (
    <ProfileListPageLayout
      title="나의 리뷰 전체보기"
      description="내가 작성한 모든 리뷰 목록입니다."
      isLoading={isLoading}
      error={error}
      emptyMessage="아직 작성한 리뷰가 없습니다."
      isEmpty={reviews.length === 0}
      loadingMessage="리뷰를 불러오는 중..."
    >
      <div className="space-y-4">
        {reviews.map((review) => (
          <Link
            key={review.id}
            href={`/review/${encodeURIComponent(review.id)}?from=my-reviews`}
            className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex items-start gap-4">
              {review.album?.imageUrl && (
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={review.album.imageUrl}
                    alt={review.album.title}
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      {review.album?.artist}
                    </p>
                    <h3 className="truncate text-sm font-bold text-zinc-900">
                      {review.album?.title}
                    </h3>
                  </div>
                  <div className="shrink-0 whitespace-nowrap text-right">
                    <span
                      className={`text-sm font-bold ${review.rating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                    >
                      {review.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-[10px] text-zinc-500">/ 10.0</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <span>{formatDateYYYYMMDD(review.createdAt)}</span>
                  {review.rejectReason && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 font-medium text-rose-700">
                      반려
                    </span>
                  )}
                </div>
                {review.rejectReason && (
                  <div className="mt-1 rounded-lg bg-rose-50 px-2.5 py-2 text-[11px] leading-relaxed text-rose-800">
                    반려 사유: {review.rejectReason}
                  </div>
                )}
                <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                  {getHtmlPlainText(review.content ?? "") || "내용 없음"}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ProfileListPageLayout>
  );
}
