"use client";
/** 타인 유저 프로필 뷰 - 요약 리뷰 목록(더보기 포함) 영역 */

import Link from "next/link";
import { ProfileReviewItem } from "./profile-types";
import { ProfileReviewRow } from "./ProfileReviewRow";
import { INITIAL_REVIEW_LIMIT } from "./profile-view-types";

interface UserProfileReviewsSummaryProps {
  userReviews: ProfileReviewItem[];
  totalReviewCount: number;
  isLoadingMore: boolean;
  showMoreButton: boolean;
  onOpenAllReviews: () => void;
  onReviewNavigate?: () => void;
  moreReviewsHref?: string;
}

export function UserProfileReviewsSummary({
  userReviews,
  totalReviewCount,
  isLoadingMore,
  showMoreButton,
  onOpenAllReviews,
  onReviewNavigate,
  moreReviewsHref,
}: UserProfileReviewsSummaryProps) {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-md font-semibold text-gray-800">작성 리뷰 ({totalReviewCount})</h4>
        {showMoreButton && (
          moreReviewsHref ? (
            <Link
              href={moreReviewsHref}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              더보기
            </Link>
          ) : (
            <button
              type="button"
              onClick={onOpenAllReviews}
              disabled={isLoadingMore}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingMore ? "불러오는 중..." : "더보기"}
            </button>
          )
        )}
      </div>
      {userReviews.length > 0 ? (
        <div className="space-y-2">
          {userReviews.slice(0, INITIAL_REVIEW_LIMIT).map((review) => (
            <ProfileReviewRow key={review.id} review={review} onNavigate={onReviewNavigate} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">작성한 리뷰가 없습니다.</p>
      )}
    </div>
  );
}
