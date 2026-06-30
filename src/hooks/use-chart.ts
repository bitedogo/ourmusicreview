"use client";

import { useEffect, useRef, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type { ChartAlbum, ChartRegion, ChartResponse } from "@/src/lib/chart/types";

export function useMusicChart(region: ChartRegion) {
  const [albums, setAlbums] = useState<ChartAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cacheRef = useRef<Map<ChartRegion, ChartAlbum[]>>(new Map());

  useEffect(() => {
    let isCancelled = false;

    const cached = cacheRef.current.get(region);
    if (cached) {
      setAlbums(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    async function fetchChart() {
      try {
        const data = await fetchJson<ChartResponse>(`/api/chart?region=${region}`);
        if (!isCancelled) {
          const result = data.data.albums ?? [];
          cacheRef.current.set(region, result);
          setAlbums(result);
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

    fetchChart();

    return () => {
      isCancelled = true;
    };
  }, [region]);

  return { albums, isLoading };
}
