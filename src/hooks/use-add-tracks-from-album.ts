"use client";
/** 앨범 검색 → 트랙리스트 → 현재 플레이리스트 담기 상태 */

import { useCallback, useEffect, useRef, useState } from "react";
import { buildAddTrackPayload } from "@/src/components/playlist/build-add-track-payload";
import { addTrackToPlaylistApi } from "@/src/components/playlist/playlist-api";
import { useItunesAlbumPicker } from "@/src/hooks/use-itunes-album-picker";
import { getApiErrorMessage } from "@/src/lib/http/client";
import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import { fetchItunesAlbumDetail } from "@/src/lib/itunes/fetch-album-detail-client";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface UseAddTracksFromAlbumOptions {
  isOpen: boolean;
  playlistId: string;
  existingTrackIds: string[];
  onTracksChanged: () => void;
}

export function useAddTracksFromAlbum({
  isOpen,
  playlistId,
  existingTrackIds,
  onTracksChanged,
}: UseAddTracksFromAlbumOptions) {
  const picker = useItunesAlbumPicker();
  const { reset } = picker;
  const existingTrackIdsRef = useRef(existingTrackIds);
  existingTrackIdsRef.current = existingTrackIds;

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [selectError, setSelectError] = useState<string | null>(null);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [addedTrackIds, setAddedTrackIds] = useState<Set<string>>(
    () => new Set()
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    reset();
    setAlbum(null);
    setSelectError(null);
    setIsLoadingAlbum(false);
    setAddingTrackId(null);
    setAddedTrackIds(new Set(existingTrackIdsRef.current));
    setActionMessage(null);
  }, [isOpen, reset]);

  const clearAlbum = useCallback(() => {
    setAlbum(null);
    setSelectError(null);
    setActionMessage(null);
  }, []);

  const selectAlbum = useCallback(async (selected: SearchAlbumResult) => {
    setIsLoadingAlbum(true);
    setSelectError(null);
    setActionMessage(null);
    try {
      const response = await fetchItunesAlbumDetail(selected.collectionId);
      setAlbum(response.data.album);
    } catch (err) {
      setAlbum(null);
      setSelectError(
        getApiErrorMessage(err, "앨범 트랙리스트를 불러오지 못했습니다.")
      );
    } finally {
      setIsLoadingAlbum(false);
    }
  }, []);

  const addTrack = useCallback(
    async (track: AlbumDetailTrack) => {
      if (!album || addingTrackId) return;
      if (addedTrackIds.has(track.id)) {
        setActionMessage("이미 플레이리스트에 담긴 곡입니다.");
        return;
      }

      setAddingTrackId(track.id);
      setActionMessage(null);
      try {
        const response = await addTrackToPlaylistApi(
          playlistId,
          buildAddTrackPayload(album, track)
        );
        setAddedTrackIds((prev) => new Set(prev).add(track.id));
        setActionMessage(
          response.data.created
            ? `"${track.title}" 을(를) 담았습니다.`
            : "이미 플레이리스트에 담긴 곡입니다."
        );
        if (response.data.created) {
          onTracksChanged();
        }
      } catch (err) {
        setActionMessage(getApiErrorMessage(err, "트랙 추가에 실패했습니다."));
      } finally {
        setAddingTrackId(null);
      }
    },
    [album, addingTrackId, addedTrackIds, playlistId, onTracksChanged]
  );

  const trackActionLabel = useCallback(
    (trackId: string) => {
      if (addingTrackId === trackId) return "담는 중";
      if (addedTrackIds.has(trackId)) return "담김";
      return "담기";
    },
    [addingTrackId, addedTrackIds]
  );

  const isTrackActionDisabled = useCallback(
    (trackId: string) =>
      addedTrackIds.has(trackId) || addingTrackId === trackId,
    [addedTrackIds, addingTrackId]
  );

  return {
    picker,
    album,
    isLoadingAlbum,
    selectError,
    actionMessage,
    clearAlbum,
    selectAlbum,
    addTrack,
    trackActionLabel,
    isTrackActionDisabled,
  };
}
