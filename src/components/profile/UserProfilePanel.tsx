"use client";
/** 타인 유저 프로필 뷰 - 프로필 패널(헤더 + 리뷰 섹션) 조합 */

import { ProfileReviewItem } from "./profile-types";
import { UserProfile } from "./profile-view-types";
import { UserProfileHeader } from "./UserProfileHeader";
import { UserProfileReviewsSummary } from "./UserProfileReviewsSummary";
import { UserProfileAllReviews } from "./UserProfileAllReviews";

interface UserProfilePanelProps {
  userProfile: UserProfile;
  userReviews: ProfileReviewItem[];
  totalReviewCount: number;
  isAllReviewsView: boolean;
  isLoadingMore: boolean;
  showMoreButton: boolean;
  onOpenAllReviews: () => void;
  onBackToProfile: () => void;
  onReviewNavigate?: () => void;
  moreReviewsHref?: string;
  backToProfileHref?: string;
  reviewsHidden?: boolean;
  ratingHidden?: boolean;
}

export function UserProfilePanel({
  userProfile,
  userReviews,
  totalReviewCount,
  isAllReviewsView,
  isLoadingMore,
  showMoreButton,
  onOpenAllReviews,
  onBackToProfile,
  onReviewNavigate,
  moreReviewsHref,
  backToProfileHref,
  reviewsHidden = false,
  ratingHidden = false,
}: UserProfilePanelProps) {
  if (reviewsHidden) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
        비공개로 설정된 프로필입니다.
      </p>
    );
  }

  return (
    <>
      {!isAllReviewsView && (
        <div>
          <UserProfileHeader userProfile={userProfile} userReviews={userReviews} ratingHidden={ratingHidden} />
          <UserProfileReviewsSummary
            userReviews={userReviews}
            totalReviewCount={totalReviewCount}
            isLoadingMore={isLoadingMore}
            showMoreButton={showMoreButton}
            onOpenAllReviews={onOpenAllReviews}
            onReviewNavigate={onReviewNavigate}
            moreReviewsHref={moreReviewsHref}
          />
        </div>
      )}

      {isAllReviewsView && (
        <UserProfileAllReviews
          userReviews={userReviews}
          totalReviewCount={totalReviewCount}
          onBackToProfile={onBackToProfile}
          onReviewNavigate={onReviewNavigate}
          backToProfileHref={backToProfileHref}
        />
      )}
    </>
  );
}
