"use client";

import { useEffect, useState } from "react";
import { incrementReviewView } from "@/src/lib/reviews/client-api";

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

    void incrementReviewView(reviewId)
      .then((payload) => {
        if (payload.data?.skipped) return;
        setDisplayedViews((prev) => prev + 1);
      })
      .catch(() => {});
  }, [reviewId]);

  return displayedViews;
}
