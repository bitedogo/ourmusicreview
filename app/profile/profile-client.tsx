"use client";
/** 마이페이지 클라이언트(프로필·공개설정) */

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import { MyPicksSection } from "./my-picks-section";
import { ProfilePageContent } from "@/src/components/profile/profile-page-content";
import {
  ProfileFavoriteItem,
  ProfilePlaylistItem,
  ProfilePrivacySettings,
  ProfileReviewItem,
} from "@/src/components/profile/profile-types";

interface ProfileClientProps {
  id: string;
  nickname: string;
  name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  role: "USER" | "ADMIN";
  createdAtText: string;
  profileImage: string | null;
  initialPrivacy: ProfilePrivacySettings;
}

interface MyReviewsResponse {
  ok: boolean;
  data: {
    reviews: ProfileReviewItem[];
  };
}

interface FavoriteAlbumsResponse {
  ok: boolean;
  data: {
    favorites: ProfileFavoriteItem[];
  };
}

interface PlaylistResponse {
  ok: boolean;
  data: {
    playlists: ProfilePlaylistItem[];
  };
}

interface PrivacyResponse {
  ok: boolean;
  data: {
    privacy: ProfilePrivacySettings;
  };
}

interface ActivityStatsResponse {
  ok: boolean;
  data: {
    postCount: number;
    commentCount: number;
    likedPostCount: number;
  };
}

export function ProfileClient({
  id,
  nickname,
  name,
  gender,
  role,
  createdAtText,
  profileImage,
  initialPrivacy,
}: ProfileClientProps) {
  const [myReviews, setMyReviews] = useState<ProfileReviewItem[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [favoriteAlbums, setFavoriteAlbums] = useState<ProfileFavoriteItem[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [playlists, setPlaylists] = useState<ProfilePlaylistItem[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [privacy, setPrivacy] = useState<ProfilePrivacySettings>(initialPrivacy);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [activityStats, setActivityStats] = useState({
    postCount: 0,
    commentCount: 0,
    likedPostCount: 0,
  });

  async function fetchMyReviews() {
    try {
      setIsLoadingReviews(true);
      const data = await fetchJson<MyReviewsResponse>("/api/reviews");
      setMyReviews(data.data.reviews || []);
    } catch {
      setMyReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }

  async function fetchFavorites() {
    try {
      setIsLoadingFavorites(true);
      const data = await fetchJson<FavoriteAlbumsResponse>("/api/favorites");
      setFavoriteAlbums(data.data.favorites || []);
    } catch {
      setFavoriteAlbums([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }

  async function fetchPlaylists() {
    try {
      setIsLoadingPlaylists(true);
      const data = await fetchJson<PlaylistResponse>("/api/playlists");
      setPlaylists(data.data.playlists || []);
    } catch {
      setPlaylists([]);
    } finally {
      setIsLoadingPlaylists(false);
    }
  }

  async function fetchActivityStats() {
    try {
      const data = await fetchJson<ActivityStatsResponse>("/api/profile/activity-stats");
      setActivityStats({
        postCount: data.data.postCount ?? 0,
        commentCount: data.data.commentCount ?? 0,
        likedPostCount: data.data.likedPostCount ?? 0,
      });
    } catch {
      setActivityStats({ postCount: 0, commentCount: 0, likedPostCount: 0 });
    }
  }

  async function handlePrivacyChange(key: keyof ProfilePrivacySettings, value: boolean) {
    setIsSavingPrivacy(true);
    try {
      const data = await fetchJson<PrivacyResponse>("/api/user/profile-privacy", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
      setPrivacy(data.data.privacy);
    } catch {
      alert("공개 설정 저장에 실패했습니다.");
    } finally {
      setIsSavingPrivacy(false);
    }
  }

  useEffect(() => {
    fetchMyReviews();
    fetchFavorites();
    fetchPlaylists();
    fetchActivityStats();
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchMyReviews();
        fetchFavorites();
        fetchPlaylists();
        fetchActivityStats();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <ProfilePageContent
      mode="owner"
      pageTitle="마이페이지"
      userId={id}
      nickname={nickname}
      name={name}
      gender={gender}
      role={role}
      createdAtText={createdAtText}
      profileImage={profileImage}
      privacy={privacy}
      onPrivacyChange={handlePrivacyChange}
      isSavingPrivacy={isSavingPrivacy}
      reviews={myReviews}
      isLoadingReviews={isLoadingReviews}
      favoriteAlbums={favoriteAlbums}
      isLoadingFavorites={isLoadingFavorites}
      playlists={playlists}
      isLoadingPlaylists={isLoadingPlaylists}
      masterpieces={[]}
      isLoadingMasterpieces={false}
      masterpiecesSection={
        <MyPicksSection
          embedded
          isPublic={privacy.showMasterpiecesPublic}
          isSavingPrivacy={isSavingPrivacy}
          onPrivacyChange={(value) => handlePrivacyChange("showMasterpiecesPublic", value)}
        />
      }
      reviewsAllHref="/profile/reviews"
      favoritesAllHref="/profile/albums"
      playlistsAllHref="/profile/playlists"
      activityStats={activityStats}
    />
  );
}
