"use client";

import { useEffect, useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import type { AlbumStreamingLinks, BatchStreamingLinksResponse } from "@/src/lib/streaming/types";

export function useBatchStreamingLinks(albumIdsKey: string) {
  const [linksByAlbumId, setLinksByAlbumId] = useState<Record<string, AlbumStreamingLinks>>({});

  useEffect(() => {
    if (!albumIdsKey) {
      setLinksByAlbumId({});
      return;
    }

    let isCancelled = false;

    async function fetchLinks() {
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
    if (!albumId) {
      setLinks(null);
      return;
    }

    const collectionId = albumId;
    let isCancelled = false;

    async function fetchLinks() {
      try {
        const data = await fetchJson<BatchStreamingLinksResponse>(
          `/api/albums/streaming-links?ids=${encodeURIComponent(collectionId)}`
        );
        if (!isCancelled) {
          setLinks(data.data.links?.[collectionId] ?? null);
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
