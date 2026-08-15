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

export function useTodayAlbums() {
  const [albums, setAlbums] = useState<TodayAlbumsResponse["albums"] | null>(
    null
  );
  const [archive, setArchive] = useState<TodayAlbumArchiveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] =
    useState<Record<TodayAlbumTab, boolean>>(INITIAL_IMAGE_ERRORS);

  useEffect(() => {
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
  }, []);

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
