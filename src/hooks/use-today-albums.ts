"use client";

import { useCallback, useEffect, useState } from "react";
import type { TodayAlbumsResponse, TodayAlbumTab } from "@/src/lib/today-album/types";

const INITIAL_IMAGE_ERRORS: Record<TodayAlbumTab, boolean> = {
  today: false,
  yesterday: false,
  previous: false,
};

export function useTodayAlbums() {
  const [albums, setAlbums] = useState<TodayAlbumsResponse["albums"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] =
    useState<Record<TodayAlbumTab, boolean>>(INITIAL_IMAGE_ERRORS);

  useEffect(() => {
    let isCancelled = false;

    async function fetchAlbums() {
      try {
        const response = await fetch("/api/today-album");
        const data = (await response.json().catch(() => null)) as
          | TodayAlbumsResponse
          | null;
        if (!isCancelled && data?.ok) {
          setAlbums(data.albums);
        }
      } catch {
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
  }, []);

  useEffect(() => {
    setImageErrors(INITIAL_IMAGE_ERRORS);
  }, [albums]);

  const markImageError = useCallback((tab: TodayAlbumTab) => {
    setImageErrors((previous) => ({ ...previous, [tab]: true }));
  }, []);

  return {
    albums,
    isLoading,
    imageErrors,
    markImageError,
  };
}
