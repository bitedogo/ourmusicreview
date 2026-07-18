"use client";
/** Featured 앨범 슬라이드 훅 */

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type {
  FeaturedAlbumCardData,
  FeaturedAlbumsApiResponse,
} from "@/src/lib/featured-albums/types";

export function useFeaturedAlbums(
  sessionStatus: "loading" | "authenticated" | "unauthenticated",
  userId: string | undefined,
  showAdminSlide: boolean
) {
  const [albums, setAlbums] = useState<FeaturedAlbumCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    let isCancelled = false;
    setIsLoading(true);

    async function fetchAlbums() {
      try {
        const url = showAdminSlide
          ? "/api/featured-albums?source=admin"
          : "/api/featured-albums";
        const data = await fetchJson<FeaturedAlbumsApiResponse>(url, {
          credentials: "include",
          cache: "no-store",
        });

        if (!isCancelled) {
          setAlbums(data.data?.albums ?? []);
        }
      } catch {
        if (!isCancelled) {
          setAlbums([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchAlbums();

    return () => {
      isCancelled = true;
    };
  }, [sessionStatus, userId, showAdminSlide]);

  return { albums, isLoading };
}
