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

type ActivityStatKey = keyof NonNullable<
  ProfileActivitySectionProps["activityStats"]
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
}

const OWNER_STATS: { label: string; href: string; countKey: ActivityStatKey }[] =
  [
    { label: "작성한 게시글", href: "/profile/posts", countKey: "postCount" },
    { label: "작성한 댓글", href: "/profile/comments", countKey: "commentCount" },
    {
      label: "추천한 글",
      href: "/profile/liked-posts",
      countKey: "likedPostCount",
    },
  ];

function resolveCollectionHref(
  isOwner: boolean,
  href: string | undefined,
  ownerFallback: string,
) {
  return isOwner ? (href ?? ownerFallback) : href;
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
      href: resolveCollectionHref(isOwner, reviewsAllHref, "/profile/reviews"),
      isLoading: isLoadingReviews,
      hidden: reviewsHidden,
      privacyKey: "showReviewsPublic",
    },
    {
      key: "favorites",
      title: "My Favorite",
      count: favoriteCount,
      covers: favoriteCovers,
      href: resolveCollectionHref(isOwner, favoritesAllHref, "/profile/albums"),
      isLoading: isLoadingFavorites,
      hidden: favoritesHidden,
      privacyKey: "showFavoritesPublic",
    },
    {
      key: "playlists",
      title: "My Playlist",
      count: playlistCount,
      covers: playlistCovers,
      href: resolveCollectionHref(
        isOwner,
        playlistsAllHref,
        "/profile/playlists",
      ),
      isLoading: isLoadingPlaylists,
      hidden: playlistsHidden,
      privacyKey: "showPlaylistsPublic",
    },
  ];

  function renderCollection(item: ActivityCollectionConfig) {
    if (!isOwner && item.hidden) {
      return <ActivityPrivatePlaceholder key={item.key} />;
    }

    const { privacyKey } = item;

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
          isOwner && privacyKey ? privacy[privacyKey] : true
        }
        isSavingPrivacy={isOwner && isSavingPrivacy}
        onPrivacyChange={
          isOwner && privacyKey && onPrivacyChange
            ? (value) => onPrivacyChange(privacyKey, value)
            : undefined
        }
      />
    );
  }

  const collectionGrid = collections.map(renderCollection);

  if (isOwner) {
    return (
      <section className={PROFILE_OWNER_ACTIVITY_SECTION_CLASS}>
        <ProfileSectionHeader title="나의 활동" tip={<ActivityInfoTip />} />

        <div className={ACTIVITY_OWNER_COLLECTION_GRID_CLASS}>
          {collectionGrid}
        </div>

        <div className={ACTIVITY_STATS_GRID_CLASS}>
          {OWNER_STATS.map((stat) => (
            <ActivityStatBox
              key={stat.href}
              label={stat.label}
              count={activityStats?.[stat.countKey] ?? 0}
              href={stat.href}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`${PROFILE_SECTION_CARD} py-10 ${PROFILE_SECTION_INSET}`}>
      <ProfileSectionHeader title="나의 활동" />
      <div className={ACTIVITY_COLLECTION_GRID_CLASS}>{collectionGrid}</div>
    </section>
  );
}
