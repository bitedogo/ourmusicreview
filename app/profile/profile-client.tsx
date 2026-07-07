"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import { MyPicksSection } from "./my-picks-section";
import { ProfilePageContent } from "@/src/components/profile/profile-page-content";
import {
  ProfileFavoriteItem,
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

interface PrivacyResponse {
  ok: boolean;
  data: {
    privacy: ProfilePrivacySettings;
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
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [privacy, setPrivacy] = useState<ProfilePrivacySettings>(initialPrivacy);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  async function handleDeleteAccount() {
    if (!confirm("정말로 계정을 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없으며, 작성한 리뷰·댓글 등 모든 데이터가 삭제됩니다.")) {
      return;
    }
    if (!confirm("한 번 더 확인합니다. 계정을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/user/account", { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "계정 삭제에 실패했습니다.");
        return;
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      alert("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

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
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchMyReviews();
        fetchFavorites();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <ProfilePageContent
      mode="owner"
      pageTitle="마이페이지"
      headerAction={
        role !== "ADMIN" ? (
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeletingAccount}
            className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            {isDeletingAccount ? "처리 중..." : "계정삭제"}
          </button>
        ) : null
      }
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
      masterpieces={[]}
      isLoadingMasterpieces={false}
      masterpiecesSection={<MyPicksSection embedded />}
      reviewsAllHref="/profile/reviews"
      favoritesAllHref="/profile/albums"
    />
  );
}
