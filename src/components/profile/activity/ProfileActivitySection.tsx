/** 나의 활동 섹션 (본인 / 타유저) */

import { ActivityInfoTip } from "../ProfileInfoTips";
import { ProfileSectionHeader } from "../ProfileSectionHeader";
import type { ProfilePrivacySettings } from "../profile-types";
import {
  PROFILE_OWNER_ACTIVITY_SECTION_CLASS,
  PROFILE_SECTION_CARD,
  PROFILE_SECTION_INSET,
} from "../profile-section-styles";
import { ActivityCollectionCard } from "./ActivityCollectionCard";
import { ActivityPrivatePlaceholder } from "./ActivityPrivatePlaceholder";
import { ActivityStatBox } from "./ActivityStatBox";
import {
  ACTIVITY_COLLECTION_GRID_CLASS,
  ACTIVITY_OWNER_COLLECTION_GRID_CLASS,
  ACTIVITY_STATS_GRID_CLASS,
} from "./activity-folder-styles";

interface ProfileActivitySectionProps {
  isOwner: boolean;
  reviewCount: number;
  favoriteCount: number;
  reviewCovers: string[];
  favoriteCovers: string[];
  reviewsAllHref?: string;
  favoritesAllHref?: string;
  isLoadingReviews: boolean;
  isLoadingFavorites: boolean;
  reviewsHidden?: boolean;
  favoritesHidden?: boolean;
  privacy: ProfilePrivacySettings;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (key: keyof ProfilePrivacySettings, value: boolean) => void;
  activityStats?: {
    postCount: number;
    commentCount: number;
    likedPostCount: number;
  };
}

export function ProfileActivitySection({
  isOwner,
  reviewCount,
  favoriteCount,
  reviewCovers,
  favoriteCovers,
  reviewsAllHref,
  favoritesAllHref,
  isLoadingReviews,
  isLoadingFavorites,
  reviewsHidden = false,
  favoritesHidden = false,
  privacy,
  isSavingPrivacy = false,
  onPrivacyChange,
  activityStats,
}: ProfileActivitySectionProps) {
  if (isOwner) {
    return (
      <section className={PROFILE_OWNER_ACTIVITY_SECTION_CLASS}>
        <ProfileSectionHeader title="나의 활동" tip={<ActivityInfoTip />} />

        <div className={ACTIVITY_OWNER_COLLECTION_GRID_CLASS}>
          <ActivityCollectionCard
            title="My Reviews"
            count={reviewCount}
            covers={reviewCovers}
            href={reviewsAllHref ?? "/profile/reviews"}
            isLoading={isLoadingReviews}
            isOwner
            isPublic={privacy.showReviewsPublic}
            isSavingPrivacy={isSavingPrivacy}
            onPrivacyChange={
              onPrivacyChange
                ? (value) => onPrivacyChange("showReviewsPublic", value)
                : undefined
            }
          />
          <ActivityCollectionCard
            title="My Favorite"
            count={favoriteCount}
            covers={favoriteCovers}
            href={favoritesAllHref ?? "/profile/albums"}
            isLoading={isLoadingFavorites}
            isOwner
            isPublic={privacy.showFavoritesPublic}
            isSavingPrivacy={isSavingPrivacy}
            onPrivacyChange={
              onPrivacyChange
                ? (value) => onPrivacyChange("showFavoritesPublic", value)
                : undefined
            }
          />
        </div>

        <div className={ACTIVITY_STATS_GRID_CLASS}>
          <ActivityStatBox
            label="작성한 게시글"
            count={activityStats?.postCount ?? 0}
            href="/profile/posts"
          />
          <ActivityStatBox
            label="작성한 댓글"
            count={activityStats?.commentCount ?? 0}
            href="/profile/comments"
          />
          <ActivityStatBox
            label="추천한 글"
            count={activityStats?.likedPostCount ?? 0}
          />
        </div>
      </section>
    );
  }

  return (
    <section className={`${PROFILE_SECTION_CARD} py-10 ${PROFILE_SECTION_INSET}`}>
      <ProfileSectionHeader title="나의 활동" />
      <div className={ACTIVITY_COLLECTION_GRID_CLASS}>
        {reviewsHidden ? (
          <ActivityPrivatePlaceholder />
        ) : (
          <ActivityCollectionCard
            title="My Reviews"
            count={reviewCount}
            covers={reviewCovers}
            href={reviewsAllHref}
            isLoading={isLoadingReviews}
            isOwner={false}
            isPublic
          />
        )}
        {favoritesHidden ? (
          <ActivityPrivatePlaceholder />
        ) : (
          <ActivityCollectionCard
            title="My Favorite"
            count={favoriteCount}
            covers={favoriteCovers}
            href={favoritesAllHref}
            isLoading={isLoadingFavorites}
            isOwner={false}
            isPublic
          />
        )}
      </div>
    </section>
  );
}
