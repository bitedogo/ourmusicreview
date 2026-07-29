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
  playlistCount: number;
  reviewCovers: string[];
  favoriteCovers: string[];
  playlistCovers: string[];
  reviewsAllHref?: string;
  favoritesAllHref?: string;
  playlistsAllHref?: string;
  isLoadingReviews: boolean;
  isLoadingFavorites: boolean;
  isLoadingPlaylists: boolean;
  reviewsHidden?: boolean;
  favoritesHidden?: boolean;
  playlistsHidden?: boolean;
  privacy: ProfilePrivacySettings;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (key: keyof ProfilePrivacySettings, value: boolean) => void;
  activityStats?: {
    postCount: number;
    commentCount: number;
    likedPostCount: number;
  };
}

type PrivacyToggleKey = Extract<
  keyof ProfilePrivacySettings,
  "showReviewsPublic" | "showFavoritesPublic" | "showPlaylistsPublic"
>;

interface ActivityCollectionConfig {
  key: string;
  title: string;
  count: number;
  covers: string[];
  href?: string;
  isLoading: boolean;
  hidden: boolean;
  privacyKey?: PrivacyToggleKey;
  ownerFallbackHref?: string;
}

export function ProfileActivitySection({
  isOwner,
  reviewCount,
  favoriteCount,
  playlistCount,
  reviewCovers,
  favoriteCovers,
  playlistCovers,
  reviewsAllHref,
  favoritesAllHref,
  playlistsAllHref,
  isLoadingReviews,
  isLoadingFavorites,
  isLoadingPlaylists,
  reviewsHidden = false,
  favoritesHidden = false,
  playlistsHidden = false,
  privacy,
  isSavingPrivacy = false,
  onPrivacyChange,
  activityStats,
}: ProfileActivitySectionProps) {
  const collections: ActivityCollectionConfig[] = [
    {
      key: "reviews",
      title: "My Reviews",
      count: reviewCount,
      covers: reviewCovers,
      href: isOwner ? (reviewsAllHref ?? "/profile/reviews") : reviewsAllHref,
      isLoading: isLoadingReviews,
      hidden: reviewsHidden,
      privacyKey: "showReviewsPublic",
    },
    {
      key: "favorites",
      title: "My Favorite",
      count: favoriteCount,
      covers: favoriteCovers,
      href: isOwner ? (favoritesAllHref ?? "/profile/albums") : favoritesAllHref,
      isLoading: isLoadingFavorites,
      hidden: favoritesHidden,
      privacyKey: "showFavoritesPublic",
    },
    {
      key: "playlists",
      title: "My Playlist",
      count: playlistCount,
      covers: playlistCovers,
      href: isOwner
        ? (playlistsAllHref ?? "/profile/playlists")
        : playlistsAllHref,
      isLoading: isLoadingPlaylists,
      hidden: playlistsHidden,
      privacyKey: "showPlaylistsPublic",
    },
  ];

  function renderCollection(item: ActivityCollectionConfig) {
    if (!isOwner && item.hidden) {
      return <ActivityPrivatePlaceholder key={item.key} />;
    }

    return (
      <ActivityCollectionCard
        key={item.key}
        title={item.title}
        count={item.count}
        covers={item.covers}
        href={item.href}
        isLoading={item.isLoading}
        isOwner={isOwner}
        isPublic={
          isOwner && item.privacyKey ? privacy[item.privacyKey] : true
        }
        isSavingPrivacy={isOwner ? isSavingPrivacy : false}
        onPrivacyChange={
          isOwner && item.privacyKey && onPrivacyChange
            ? (value) => onPrivacyChange(item.privacyKey!, value)
            : undefined
        }
      />
    );
  }

  if (isOwner) {
    return (
      <section className={PROFILE_OWNER_ACTIVITY_SECTION_CLASS}>
        <ProfileSectionHeader title="나의 활동" tip={<ActivityInfoTip />} />

        <div className={ACTIVITY_OWNER_COLLECTION_GRID_CLASS}>
          {collections.map(renderCollection)}
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
        {collections.map(renderCollection)}
      </div>
    </section>
  );
}
