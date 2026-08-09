"use client";
/** 플레이리스트 상세(소유자) — 로드 + mutation 조합 */

import { usePlaylistDetailMutations } from "@/src/hooks/use-playlist-detail-mutations";
import { usePlaylistDetailQuery } from "@/src/hooks/use-playlist-detail-query";

export function usePlaylistDetail(playlistId: string) {
  const {
    playlist,
    setPlaylist,
    isLoading,
    error,
    streamingLinksByTrackId,
    reload,
  } = usePlaylistDetailQuery(playlistId);

  const mutations = usePlaylistDetailMutations(playlist, setPlaylist);

  return {
    playlist,
    isLoading,
    error,
    streamingLinksByTrackId,
    reload,
    ...mutations,
  };
}
