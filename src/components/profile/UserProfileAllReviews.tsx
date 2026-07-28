"use client";
/** 타인 유저 프로필 뷰 - 전체 리뷰 목록 영역 */

import Link from "next/link";
import { ProfileReviewItem } from "./profile-types";
import { ProfileReviewRow } from "./ProfileReviewRow";

interface UserProfileAllReviewsProps {
  userReviews: ProfileReviewItem[];
  totalReviewCount: number;
  onBackToProfile: () => void;
  onReviewNavigate?: () => void;
  backToProfileHref?: string;
}

export function UserProfileAllReviews({
  userReviews,
  totalReviewCount,
  onBackToProfile,
  onReviewNavigate,
  backToProfileHref,
}: UserProfileAllReviewsProps) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-3">
        <h4 className="text-md font-semibold text-gray-800">작성 리뷰 전체 ({totalReviewCount})</h4>
        {backToProfileHref ? (
          <Link
            href={backToProfileHref}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            프로필로
          </Link>
        ) : (
          <button
            type="button"
            onClick={onBackToProfile}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            프로필로
          </button>
        )}
      </div>
      {userReviews.length > 0 ? (
        <div className="space-y-2 sm:max-h-[420px] sm:overflow-y-auto sm:pr-1">
          {userReviews.map((review) => (
            <ProfileReviewRow key={review.id} review={review} onNavigate={onReviewNavigate} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">작성한 리뷰가 없습니다.</p>
      )}
    </div>
  );
}
