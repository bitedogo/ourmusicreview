"use client";
/** 플레이리스트 상세 mutation (소유자) */

import { useRouter } from "next/navigation";
import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import {
  deletePlaylistApi,
  removeTrackFromPlaylistApi,
  reorderPlaylistTracksApi,
  updatePlaylistApi,
  updatePlaylistCoverApi,
  type PlaylistDetailDto,
} from "@/src/lib/playlists/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { profileSelf } from "@/src/lib/navigation/routes";
import { reorderById } from "@/src/lib/utils/reorder";

export function usePlaylistDetailMutations(
  playlist: PlaylistDetailDto | null,
  setPlaylist: Dispatch<SetStateAction<PlaylistDetailDto | null>>
) {
  const router = useRouter();
  const [removingTrackId, setRemovingTrackId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    [playlist, setPlaylist]
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
        const response = await updatePlaylistCoverApi(playlist.id, coverFile);
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
    [playlist, setPlaylist]
  );

  const clearCover = useCallback(async () => {
    if (!playlist?.coverImageUrl) return false;
    if (!confirm("대표사진을 삭제할까요?")) return false;

    setIsSaving(true);
    try {
      const response = await updatePlaylistApi(playlist.id, {
        coverImageUrl: null,
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
    } catch {
      alert("대표사진 삭제에 실패했습니다.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [playlist, setPlaylist]);

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
    [playlist, setPlaylist]
  );

  const savePublic = useCallback(
    async (isPublic: boolean) => {
      if (!playlist || playlist.isPublic === isPublic) return false;
      setIsSaving(true);
      try {
        const response = await updatePlaylistApi(playlist.id, { isPublic });
        setPlaylist((prev) =>
          prev
            ? {
                ...prev,
                isPublic: response.data.playlist.isPublic,
                updatedAt: response.data.playlist.updatedAt,
              }
            : prev
        );
        return true;
      } catch (err) {
        alert(getApiErrorMessage(err, "공개 설정 변경에 실패했습니다."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [playlist, setPlaylist]
  );

  const reorderTracks = useCallback(
    async (sourceId: string, targetId: string) => {
      if (!playlist || sourceId === targetId) return false;
      const nextTracks = reorderById(playlist.tracks, sourceId, targetId);
      if (nextTracks === playlist.tracks) return false;

      const previousTracks = playlist.tracks;
      setPlaylist((prev) =>
        prev
          ? {
              ...prev,
              tracks: nextTracks.map((track, index) => ({
                ...track,
                position: index + 1,
              })),
            }
          : prev
      );
      setIsSaving(true);
      try {
        await reorderPlaylistTracksApi(
          playlist.id,
          nextTracks.map((track) => track.id)
        );
        return true;
      } catch (err) {
        setPlaylist((prev) =>
          prev ? { ...prev, tracks: previousTracks } : prev
        );
        alert(getApiErrorMessage(err, "트랙 순서 변경에 실패했습니다."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [playlist, setPlaylist]
  );

  return {
    isSaving,
    removingTrackId,
    removeTrack,
    deletePlaylist,
    saveCover,
    clearCover,
    saveGenres,
    savePublic,
    reorderTracks,
  };
}
