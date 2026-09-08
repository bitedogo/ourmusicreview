"use client";
/** 오늘의 앨범 */

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type {
  TodayAlbumArchiveItem,
  TodayAlbumsResponse,
  TodayAlbumTab,
} from "@/src/lib/today-album/types";

const INITIAL_IMAGE_ERRORS: Record<TodayAlbumTab, boolean> = {
  today: false,
  yesterday: false,
  previous: false,
};

export function useTodayAlbums(initialData?: TodayAlbumsResponse) {
  const [albums, setAlbums] = useState<TodayAlbumsResponse["albums"] | null>(
    initialData?.albums ?? null
  );
  const [archive, setArchive] = useState<TodayAlbumArchiveItem[]>(
    initialData?.archive ?? []
  );
  const [isLoading, setIsLoading] = useState(!initialData);
  const [imageErrors, setImageErrors] =
    useState<Record<TodayAlbumTab, boolean>>(INITIAL_IMAGE_ERRORS);

  useEffect(() => {
    if (initialData) return;
    let isCancelled = false;

    async function fetchAlbums() {
      try {
        const data = await fetchJson<TodayAlbumsResponse>("/api/today-album");
        if (!isCancelled && data.ok) {
          setAlbums(data.albums);
          setArchive(data.archive ?? []);
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
  }, [initialData]);

  useEffect(() => {
    setImageErrors(INITIAL_IMAGE_ERRORS);
  }, [albums]);

  const markImageError = useCallback((tab: TodayAlbumTab) => {
    setImageErrors((previous) => ({ ...previous, [tab]: true }));
  }, []);

  return {
    albums,
    archive,
    isLoading,
    imageErrors,
    markImageError,
  };
}
