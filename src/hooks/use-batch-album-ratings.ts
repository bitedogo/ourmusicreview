"use client";
/** 앨범 평점 일괄 조회 훅 */

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type { BatchAlbumRatingsResponse } from "@/src/lib/search/types";

export type AlbumRatingInfo = {
  averageRating: number | null;
  reviewCount: number;
};

export function useBatchAlbumRatings(albumIdsKey: string) {
  const [ratings, setRatings] = useState<Record<string, AlbumRatingInfo>>({});

  useEffect(() => {
    let isCancelled = false;

    async function fetchRatings() {
      if (!albumIdsKey) {
        if (!isCancelled) setRatings({});
        return;
      }

      try {
        const ratingData = await fetchJson<BatchAlbumRatingsResponse>(
          `/api/albums/ratings?ids=${encodeURIComponent(albumIdsKey)}`
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
  }, [albumIdsKey]);

  return ratings;
}
