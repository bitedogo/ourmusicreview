"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type { BatchAlbumRatingsResponse } from "@/src/lib/search/types";

export type AlbumRatingInfo = {
  averageRating: number | null;
  reviewCount: number;
};

export function useBatchAlbumRatings(albumIds: string[]) {
  const [ratings, setRatings] = useState<Record<string, AlbumRatingInfo>>({});

  useEffect(() => {
    if (albumIds.length === 0) {
      setRatings({});
      return;
    }

    let isCancelled = false;

    async function fetchRatings() {
      try {
        const ratingData = await fetchJson<BatchAlbumRatingsResponse>(
          `/api/albums/ratings?ids=${encodeURIComponent(albumIds.join(","))}`
        );
        if (!isCancelled) {
          setRatings(ratingData.data.ratings ?? {});
        }
      } catch {
        if (!isCancelled) {
          setRatings({});
        }
      }
    }

    fetchRatings();

    return () => {
      isCancelled = true;
    };
  }, [albumIds]);

  return ratings;
}
