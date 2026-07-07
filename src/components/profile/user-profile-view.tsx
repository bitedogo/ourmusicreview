"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchJson } from "@/src/lib/http/client";
import {
  ProfileReviewItem,
} from "./profile-types";
import { ProfileReviewRow } from "./ProfileReviewRow";
import { ProfileRatingGauge } from "./ProfileRatingGauge";
import { GENDER_LABEL } from "./profile-types";

export interface UserProfile {
  id: string;
  nickname: string;
  name: string | null;
  email: string | null;
  profileImage: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  createdAt: string;
  averageRating: number;
}

export interface ProfileApiData {
  profile: UserProfile;
  totalReviewCount: number;
  reviews: ProfileReviewItem[];
  reviewsHidden?: boolean;
  favoritesHidden?: boolean;
  masterpiecesHidden?: boolean;
  ratingHidden?: boolean;
}

export const INITIAL_REVIEW_LIMIT = 5;
const MAX_REVIEW_FETCH_LIMIT = 500;

export function getUserProfilePath(userId: string) {
  return `/users/${encodeURIComponent(userId)}`;
}

export function getUserProfileReviewsPath(userId: string) {
  return `/users/${encodeURIComponent(userId)}/reviews`;
}

export function useUserProfileData(
  userId: string | null,
  { enabled = true, loadAllReviews = false }: { enabled?: boolean; loadAllReviews?: boolean } = {},
) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userReviews, setUserReviews] = useState<ProfileReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalReviewCount, setTotalReviewCount] = useState(0);
  const [isAllReviewsView, setIsAllReviewsView] = useState(loadAllReviews);
  const [reviewsHidden, setReviewsHidden] = useState(false);
  const [ratingHidden, setRatingHidden] = useState(false);

  const resetState = useCallback(() => {
    setUserProfile(null);
    setUserReviews([]);
    setTotalReviewCount(0);
    setIsLoading(false);
    setIsLoadingMore(false);
    setIsAllReviewsView(loadAllReviews);
    setReviewsHidden(false);
    setRatingHidden(false);
    setError(null);
  }, [loadAllReviews]);

  useLayoutEffect(() => {
    if (!enabled || !userId) return;

    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      setError(null);
      try {
        const limit = loadAllReviews ? MAX_REVIEW_FETCH_LIMIT : INITIAL_REVIEW_LIMIT;
        const data = await fetchJson<{ ok: boolean; data: ProfileApiData }>(
          `/api/profile/${userId}?offset=0&limit=${limit}`,
        );
        if (cancelled) return;
        if (data.ok && data.data) {
          setUserProfile({
            ...data.data.profile,
            email: data.data.profile.email ?? null,
            createdAt:
              typeof data.data.profile.createdAt === "string"
                ? data.data.profile.createdAt
                : new Date(data.data.profile.createdAt).toISOString(),
          });
          setUserReviews(data.data.reviews);
          setTotalReviewCount(data.data.totalReviewCount);
          setReviewsHidden(Boolean(data.data.reviewsHidden));
          setRatingHidden(Boolean(data.data.ratingHidden));
          setIsAllReviewsView(loadAllReviews);
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

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [userId, enabled, loadAllReviews]);

  const handleOpenAllReviewsView = useCallback(async () => {
    if (!userId || isLoadingMore) return;

    if (userReviews.length >= totalReviewCount) {
      setIsAllReviewsView(true);
      return;
    }

    setIsLoadingMore(true);
    try {
      const data = await fetchJson<{ ok: boolean; data: ProfileApiData }>(
        `/api/profile/${userId}?offset=0&limit=${Math.max(totalReviewCount, INITIAL_REVIEW_LIMIT)}`,
      );
      if (data.ok && data.data) {
        setTotalReviewCount(data.data.totalReviewCount);
        setUserReviews(data.data.reviews);
        setIsAllReviewsView(true);
      }
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, isLoadingMore, userReviews.length, totalReviewCount]);

  return {
    userProfile,
    userReviews,
    isLoading,
    isLoadingMore,
    error,
    totalReviewCount,
    isAllReviewsView,
    setIsAllReviewsView,
    handleOpenAllReviewsView,
    resetState,
    showMoreButton: userReviews.length < totalReviewCount,
    reviewsHidden,
    ratingHidden,
  };
}

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
          <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200">
                <Image
                  src={userProfile.profileImage || "/default-avatar.png"}
                  alt={userProfile.nickname}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">{userProfile.nickname}</p>
                {userProfile.email && <p className="text-sm text-gray-500">{userProfile.email}</p>}
                <p className="text-xs text-gray-500">
                  가입일: {new Date(userProfile.createdAt).toLocaleDateString("ko-KR")}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  성별:{" "}
                  <span className="font-semibold text-gray-900">
                    {GENDER_LABEL[userProfile.gender || "NONE"]}
                  </span>
                </p>
              </div>
            </div>
            {!ratingHidden ? (
              <ProfileRatingGauge
                reviews={userReviews}
                nickname={userProfile.nickname}
                averageRating={userProfile.averageRating}
              />
            ) : (
              <div className="flex w-[190px] shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs text-zinc-500">평균 평점 비공개</p>
              </div>
            )}
          </div>

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
        </div>
      )}

      {isAllReviewsView && (
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
      )}
    </>
  );
}
