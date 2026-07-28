"use client";
/** 타인 유저 프로필 뷰 - 데이터 로딩 훅 */

import { useCallback, useLayoutEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import { ProfileReviewItem } from "./profile-types";
import { INITIAL_REVIEW_LIMIT, ProfileApiData, UserProfile } from "./profile-view-types";

const MAX_REVIEW_FETCH_LIMIT = 500;

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
