"use client";

import { useEffect, useState } from "react";

/** 리뷰 상세 진입 시 조회수 1회 증가 (본인 리뷰 제외) */

export function useReviewViewIncrement(reviewId: string, initialViews: number) {
  const [displayedViews, setDisplayedViews] = useState(initialViews);

  useEffect(() => {
    setDisplayedViews(initialViews);
  }, [initialViews]);

  useEffect(() => {
    const storageKey = `review-${reviewId}-view-incremented`;
    if (sessionStorage.getItem(storageKey)) return;

    sessionStorage.setItem(storageKey, "true");

    fetch(`/api/reviews/${encodeURIComponent(reviewId)}/view`, {
      method: "POST",
    })
      .then(async (response) => {
        if (!response.ok) return;

        const payload = (await response.json()) as {
          ok?: boolean;
          data?: { skipped?: boolean };
        };

        if (payload.data?.skipped) return;
        setDisplayedViews((prev) => prev + 1);
      })
      .catch(() => {});
  }, [reviewId]);

  return displayedViews;
}
