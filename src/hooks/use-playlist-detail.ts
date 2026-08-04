"use client";
/** 플레이리스트 상세 로드·트랙 조작·스트리밍 링크 */

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deletePlaylistApi,
  fetchPlaylistDetail,
  removeTrackFromPlaylistApi,
  updatePlaylistApi,
  type PlaylistDetailDto,
} from "@/src/components/playlist/playlist-api";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { profileSelf } from "@/src/lib/navigation/routes";
import type { AlbumStreamingLinks, BatchStreamingLinksResponse } from "@/src/lib/streaming/types";

export function usePlaylistDetail(playlistId: string) {
  const router = useRouter();
  const [playlist, setPlaylist] = useState<PlaylistDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingTrackId, setRemovingTrackId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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

  const loadPlaylist = useCallback(async (options?: { silent?: boolean }) => {
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
  }, [playlistId]);

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

  const removeTrack = useCallback(
    async (trackRowId: string, trackName: string) => {
      if (!playlist) return;
      if (!confirm(`"${trackName}" 트랙을 플레이리스트에서 제거할까요?`)) return;

      setRemovingTrackId(trackRowId);
      try {
        await removeTrackFromPlaylistApi(playlist.id, trackRowId);
        setPlaylist((prev) =>
          prev
            ? {
                ...prev,
                tracks: prev.tracks.filter((track) => track.id !== trackRowId),
                trackCount: Math.max(0, prev.trackCount - 1),
              }
            : prev
        );
      } catch (err) {
        alert(getApiErrorMessage(err, "트랙 제거에 실패했습니다."));
      } finally {
        setRemovingTrackId(null);
      }
    },
    [playlist]
  );

  const deletePlaylist = useCallback(async () => {
    if (!playlist) return;
    if (!confirm(`"${playlist.title}" 플레이리스트를 삭제할까요?`)) return;

    setIsSaving(true);
    try {
      await deletePlaylistApi(playlist.id);
      router.push(profileSelf("playlists"));
    } catch {
      alert("플레이리스트 삭제에 실패했습니다.");
      setIsSaving(false);
    }
  }, [playlist, router]);

  const saveCover = useCallback(
    async (coverFile: File) => {
      if (!playlist) return false;
      setIsSaving(true);
      try {
        const formData = new FormData();
        formData.append("coverImage", coverFile);
        const response = await fetchJson<{
          ok: boolean;
          data: { playlist: PlaylistDetailDto };
        }>(`/api/playlists/${encodeURIComponent(playlist.id)}/cover`, {
          method: "POST",
          body: formData,
        });
        setPlaylist((prev) =>
          prev
            ? {
                ...prev,
                coverImageUrl: response.data.playlist.coverImageUrl,
                updatedAt: response.data.playlist.updatedAt,
              }
            : prev
        );
        return true;
      } catch (err) {
        alert(getApiErrorMessage(err, "대표사진 저장에 실패했습니다."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [playlist]
  );

  const clearCover = useCallback(async () => {
    if (!playlist?.coverImageUrl) return false;
    if (!confirm("대표사진을 삭제할까요?")) return false;

    setIsSaving(true);
    try {
      const response = await updatePlaylistApi(playlist.id, { coverImageUrl: null });
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              coverImageUrl: response.data.playlist.coverImageUrl,
              updatedAt: response.data.playlist.updatedAt,
            }
          : prev
      );
      return true;
    } catch {
      alert("대표사진 삭제에 실패했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [playlist]);

  const saveGenres = useCallback(
    async (genreIds: string[]) => {
      if (!playlist) return false;
      setIsSaving(true);
      try {
        const response = await updatePlaylistApi(playlist.id, { genreIds });
        setPlaylist((prev) =>
          prev
            ? {
                ...prev,
                genres: response.data.playlist.genres ?? [],
                updatedAt: response.data.playlist.updatedAt,
              }
            : prev
        );
        return true;
      } catch (err) {
        alert(getApiErrorMessage(err, "장르 저장에 실패했습니다."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [playlist]
  );

  return {
    playlist,
    isLoading,
    error,
    isSaving,
    removingTrackId,
    streamingLinksByTrackId,
    reload: () => loadPlaylist({ silent: true }),
    removeTrack,
    deletePlaylist,
    saveCover,
    clearCover,
    saveGenres,
  };
}
