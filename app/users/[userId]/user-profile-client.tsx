"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import { ProfilePageContent } from "@/components/profile-page-content";
import {
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
  ProfilePrivacySettings,
  ProfileReviewItem,
} from "@/components/profile/profile-types";
import { getUserProfilePath, getUserProfileReviewsPath } from "@/components/user-profile-view";

interface UserProfileClientProps {
  userId: string;
  showAllReviews?: boolean;
}

interface PublicProfileApiData {
  isOwner: boolean;
  privacy: ProfilePrivacySettings;
  profile: {
    id: string;
    nickname: string;
    name: string | null;
    email: string | null;
    profileImage: string | null;
    gender: "MALE" | "FEMALE" | "NONE" | null;
    role: "USER" | "ADMIN" | null;
    createdAt: string;
    createdAtText: string;
    averageRating: number;
  };
  totalReviewCount: number;
  reviewsHidden: boolean;
  favoritesHidden: boolean;
  masterpiecesHidden: boolean;
  ratingHidden: boolean;
  reviews: ProfileReviewItem[];
  favorites: ProfileFavoriteItem[];
  masterpieces: ProfileMasterpieceItem[];
}

export function UserProfileClient({ userId, showAllReviews = false }: UserProfileClientProps) {
  const router = useRouter();
  const [data, setData] = useState<PublicProfileApiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const limit = showAllReviews ? 500 : 5;
        const response = await fetchJson<{ ok: boolean; data: PublicProfileApiData }>(
          `/api/profile/${userId}?offset=0&limit=${limit}`,
        );
        if (cancelled) return;
        if (response.ok && response.data) {
          setData(response.data);
        } else {
          setError("프로필 정보를 가져오는 데 실패했습니다.");
        }
      } catch {
        if (!cancelled) {
          setError("프로필 정보를 가져오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId, showAllReviews]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">프로필을 불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-4 px-6 py-10">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
        >
          이전으로
        </button>
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "프로필을 찾을 수 없습니다."}
        </div>
      </div>
    );
  }

  if (showAllReviews) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <section className="space-y-2">
          <Link
            href={getUserProfilePath(userId)}
            className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
          >
            프로필로
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">
            {data.profile.nickname}님의 리뷰 전체
          </h1>
        </section>

        {data.reviewsHidden ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
            비공개로 설정된 정보입니다.
          </div>
        ) : data.reviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
            작성한 리뷰가 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {data.reviews.map((review) => (
              <Link
                key={review.id}
                href={`/review/${encodeURIComponent(review.id)}`}
                className="block rounded-xl border border-zinc-100 bg-white p-4 transition hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-medium uppercase text-zinc-500">
                      {review.album?.artist}
                    </p>
                    <p className="truncate text-sm font-semibold text-zinc-900">{review.album?.title}</p>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-bold ${review.rating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                  >
                    {review.rating.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <ProfilePageContent
      mode="viewer"
      pageTitle={`${data.profile.nickname}님의 프로필`}
      headerAction={
        !data.isOwner ? (
          <button
            type="button"
            onClick={() => router.back()}
            className="text-xs font-medium text-zinc-600 hover:text-[var(--color-brand-primary)]"
          >
            이전으로
          </button>
        ) : (
          <Link
            href="/profile"
            className="text-xs font-medium text-zinc-600 hover:text-[var(--color-brand-primary)]"
          >
            마이페이지로
          </Link>
        )
      }
      userId={data.profile.id}
      nickname={data.profile.nickname}
      name={data.profile.name}
      gender={data.profile.gender}
      role={data.profile.role}
      createdAtText={data.profile.createdAtText}
      profileImage={data.profile.profileImage}
      privacy={data.privacy}
      reviews={data.reviews}
      isLoadingReviews={false}
      reviewsHidden={data.reviewsHidden}
      totalReviewCount={data.totalReviewCount}
      ratingHidden={data.ratingHidden}
      averageRating={data.profile.averageRating}
      favoriteAlbums={data.favorites}
      isLoadingFavorites={false}
      favoritesHidden={data.favoritesHidden}
      masterpieces={data.masterpieces}
      isLoadingMasterpieces={false}
      masterpiecesHidden={data.masterpiecesHidden}
      reviewsAllHref={data.reviewsHidden ? undefined : getUserProfileReviewsPath(userId)}
      favoritesAllHref={undefined}
    />
  );
}
