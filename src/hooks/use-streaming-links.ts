"use client";
/** 앨범 스트리밍 링크 조회 훅 */

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type { AlbumStreamingLinks, BatchStreamingLinksResponse } from "@/src/lib/streaming/types";

export function useBatchStreamingLinks(albumIdsKey: string) {
  const [linksByAlbumId, setLinksByAlbumId] = useState<Record<string, AlbumStreamingLinks>>({});

  useEffect(() => {
    let isCancelled = false;

    async function fetchLinks() {
      if (!albumIdsKey) {
        if (!isCancelled) setLinksByAlbumId({});
        return;
      }

      try {
        const data = await fetchJson<BatchStreamingLinksResponse>(
          `/api/albums/streaming-links?ids=${encodeURIComponent(albumIdsKey)}`
        );
        if (!isCancelled) {
          setLinksByAlbumId(data.data.links ?? {});
        }
      } catch {
        if (!isCancelled) {
          setLinksByAlbumId({});
        }
      }
    }

    fetchLinks();

    return () => {
      isCancelled = true;
    };
  }, [albumIdsKey]);

  return linksByAlbumId;
}

export function useStreamingLinks(albumId: string | null | undefined) {
  const [links, setLinks] = useState<AlbumStreamingLinks | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchLinks() {
      if (!albumId) {
        if (!isCancelled) setLinks(null);
        return;
      }

      try {
        const data = await fetchJson<BatchStreamingLinksResponse>(
          `/api/albums/streaming-links?ids=${encodeURIComponent(albumId)}`
        );
        if (!isCancelled) {
          setLinks(data.data.links?.[albumId] ?? null);
        }
      } catch {
        if (!isCancelled) {
          setLinks(null);
        }
      }
    }

    fetchLinks();

    return () => {
      isCancelled = true;
    };
  }, [albumId]);

  return links;
}
