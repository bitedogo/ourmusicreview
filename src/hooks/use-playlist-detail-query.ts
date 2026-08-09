"use client";
/** 플레이리스트 상세 로드·스트리밍 링크 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchPlaylistDetail,
  type PlaylistDetailDto,
} from "@/src/lib/playlists/client-api";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { AlbumStreamingLinks, BatchStreamingLinksResponse } from "@/src/lib/streaming/types";

export function usePlaylistDetailQuery(playlistId: string) {
  const [playlist, setPlaylist] = useState<PlaylistDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streamingLinksByTrackId, setStreamingLinksByTrackId] = useState<
    Record<string, AlbumStreamingLinks>
  >({});

  const trackIdsKey = useMemo(
    () =>
      (playlist?.tracks ?? [])
        .map((track) => track.trackId)
        .filter((id) => /^\d+$/.test(id))
        .join(","),
    [playlist]
  );

  const loadPlaylist = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!playlistId) return;
      if (!options?.silent) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await fetchPlaylistDetail(playlistId);
        setPlaylist(response.data.playlist);
      } catch (err) {
        setPlaylist(null);
        setError(getApiErrorMessage(err, "플레이리스트를 불러오지 못했습니다."));
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [playlistId]
  );

  useEffect(() => {
    void loadPlaylist();
  }, [loadPlaylist]);

  useEffect(() => {
    let cancelled = false;

    async function loadStreamingLinks() {
      if (!trackIdsKey) {
        setStreamingLinksByTrackId({});
        return;
      }

      try {
        const response = await fetchJson<BatchStreamingLinksResponse>(
          `/api/tracks/streaming-links?ids=${encodeURIComponent(trackIdsKey)}`
        );
        if (!cancelled) {
          setStreamingLinksByTrackId(response.data.links ?? {});
        }
      } catch {
        if (!cancelled) {
          setStreamingLinksByTrackId({});
        }
      }
    }

    void loadStreamingLinks();
    return () => {
      cancelled = true;
    };
  }, [trackIdsKey]);

  return {
    playlist,
    setPlaylist,
    isLoading,
    error,
    streamingLinksByTrackId,
    reload: () => loadPlaylist({ silent: true }),
  };
}
