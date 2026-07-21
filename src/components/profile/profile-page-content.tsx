"use client";

/** 마이페이지 프로필 헤더·활동·명반 */

import { ReactNode } from "react";
import { getUserProfilePath } from "./user-profile-view";
import {
  ProfilePrivacySettings,
  ProfileReviewItem,
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
} from "./profile-types";
import { useAverageRating } from "./ProfileRatingGauge";
import { ProfileActivitySection } from "./activity/ProfileActivitySection";
import { ProfileHeaderSection } from "./ProfileHeaderSection";
import { ProfileMasterpieceSection } from "./ProfileMasterpieceSection";

export type {
  ProfilePrivacySettings,
  ProfileReviewItem,
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
} from "./profile-types";

export interface ProfilePageContentProps {
  mode: "owner" | "viewer";
  pageTitle: string;
  headerAction?: ReactNode;
  userId: string;
  nickname: string;
  name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  role: "USER" | "ADMIN" | null;
  createdAtText: string;
  profileImage: string | null;
  privacy: ProfilePrivacySettings;
  onPrivacyChange?: (key: keyof ProfilePrivacySettings, value: boolean) => void;
  isSavingPrivacy?: boolean;
  reviews: ProfileReviewItem[];
  isLoadingReviews: boolean;
  reviewsHidden?: boolean;
  totalReviewCount?: number;
  ratingHidden?: boolean;
  averageRating?: number;
  favoriteAlbums: ProfileFavoriteItem[];
  isLoadingFavorites: boolean;
  favoritesHidden?: boolean;
  masterpieces: ProfileMasterpieceItem[];
  isLoadingMasterpieces: boolean;
  masterpiecesHidden?: boolean;
  masterpiecesSection?: ReactNode;
  reviewsAllHref?: string;
  favoritesAllHref?: string;
  activityStats?: {
    postCount: number;
    commentCount: number;
    likedPostCount: number;
  };
}

export function ProfilePageContent(props: ProfilePageContentProps) {
  const {
    mode,
    pageTitle,
    headerAction,
    userId,
    nickname,
    name,
    gender,
    role: _role,
    createdAtText,
    profileImage,
    privacy,
    onPrivacyChange,
    isSavingPrivacy = false,
    reviews,
    isLoadingReviews,
    reviewsHidden = false,
    totalReviewCount,
    ratingHidden = false,
    averageRating,
    favoriteAlbums,
    isLoadingFavorites,
    favoritesHidden = false,
    masterpieces,
    isLoadingMasterpieces,
    masterpiecesHidden = false,
    masterpiecesSection,
    reviewsAllHref,
    favoritesAllHref,
    activityStats,
  } = props;

  const isOwner = mode === "owner";
  const profilePreviewHref = isOwner ? "/profile" : getUserProfilePath(userId);
  const visibleReviews = isOwner || !reviewsHidden ? reviews : [];
  const visibleFavorites = isOwner || !favoritesHidden ? favoriteAlbums : [];
  const visibleMasterpieces = isOwner || !masterpiecesHidden ? masterpieces : [];
  const showReviewGauge = isOwner || !ratingHidden;
  const gaugeReviews = isOwner ? reviews : visibleReviews;
  const reviewCount = totalReviewCount ?? reviews.length;
  const favoriteCount = favoriteAlbums.length;
  const { displayRating, listenerLabel, hasRatingData } = useAverageRating(
    gaugeReviews,
    !isOwner ? averageRating : undefined
  );

  const reviewCovers = visibleReviews
    .map((r) => r.album?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);
  const favoriteCovers = visibleFavorites
    .map((f) => f.album?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-3 pb-6 pt-[var(--profile-menu-title-gap)] sm:px-6 sm:pb-8">
        <div className="mb-[var(--profile-title-section-gap)] flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            {pageTitle}
          </h1>
          {headerAction}
        </div>

        <div className="flex flex-col gap-[var(--profile-section-gap)]">
          <ProfileHeaderSection
            isOwner={isOwner}
            profilePreviewHref={profilePreviewHref}
            profileImage={profileImage}
            nickname={nickname}
            name={name}
            gender={gender}
            createdAtText={createdAtText}
            showReviewGauge={showReviewGauge}
            hasRatingData={hasRatingData}
            gaugeReviews={gaugeReviews}
            averageRating={averageRating}
            displayRating={displayRating}
            listenerLabel={listenerLabel}
            showRatingPublic={privacy.showRatingPublic}
            isSavingPrivacy={isSavingPrivacy}
            onRatingPrivacyChange={
              isOwner && onPrivacyChange
                ? (value) => onPrivacyChange("showRatingPublic", value)
                : undefined
            }
          />

          <ProfileActivitySection
            isOwner={isOwner}
            reviewCount={reviewCount}
            favoriteCount={favoriteCount}
            reviewCovers={reviewCovers}
            favoriteCovers={favoriteCovers}
            reviewsAllHref={reviewsAllHref}
            favoritesAllHref={favoritesAllHref}
            isLoadingReviews={isLoadingReviews}
            isLoadingFavorites={isLoadingFavorites}
            reviewsHidden={reviewsHidden}
            favoritesHidden={favoritesHidden}
            privacy={privacy}
            isSavingPrivacy={isSavingPrivacy}
            onPrivacyChange={onPrivacyChange}
            activityStats={activityStats}
          />

          <ProfileMasterpieceSection
            isOwner={isOwner}
            masterpiecesHidden={masterpiecesHidden}
            masterpiecesSection={masterpiecesSection}
            visibleMasterpieces={visibleMasterpieces}
            isLoadingMasterpieces={isLoadingMasterpieces}
          />
        </div>
      </div>
    </div>
  );
}
