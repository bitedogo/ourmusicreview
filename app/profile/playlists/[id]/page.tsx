"use client";
/** 내 플레이리스트 상세(트랙 목록) */

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AddTracksFromAlbumModal } from "@/src/components/playlist/add-tracks-from-album-modal";
import { PlaylistCoverEditor } from "@/src/components/playlist/playlist-cover-editor";
import { PlaylistDetailHeader } from "@/src/components/playlist/playlist-detail-header";
import { PlaylistDetailShell } from "@/src/components/playlist/playlist-detail-shell";
import { PlaylistTrackList } from "@/src/components/playlist/playlist-track-list";
import { usePlaylistDetail } from "@/src/hooks/use-playlist-detail";
import { profileSelf } from "@/src/lib/navigation/routes";

export default function ProfilePlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const playlistId = params?.id ?? "";
  const [isCoverEditorOpen, setIsCoverEditorOpen] = useState(false);
  const [isAddTracksOpen, setIsAddTracksOpen] = useState(false);

  const {
    playlist,
    isLoading,
    error,
    isSaving,
    removingTrackId,
    streamingLinksByTrackId,
    reload,
    removeTrack,
    deletePlaylist,
    saveCover,
    clearCover,
    saveGenres,
    savePublic,
    reorderTracks,
  } = usePlaylistDetail(playlistId);

  const existingTrackIds = useMemo(
    () => playlist?.tracks.map((track) => track.trackId) ?? [],
    [playlist]
  );

  return (
    <PlaylistDetailShell
      backHref={profileSelf("playlists")}
      isLoading={isLoading}
      error={error}
      hasPlaylist={!!playlist}
    >
      {playlist ? (
        <>
          <PlaylistDetailHeader
            playlist={playlist}
            isSaving={isSaving}
            onToggleCoverEditor={() => setIsCoverEditorOpen((prev) => !prev)}
            onDelete={() => void deletePlaylist()}
            onSaveGenres={saveGenres}
            onSavePublic={savePublic}
            coverEditor={
              isCoverEditorOpen ? (
                <PlaylistCoverEditor
                  currentCoverUrl={playlist.coverImageUrl}
                  isSaving={isSaving}
                  onClose={() => setIsCoverEditorOpen(false)}
                  onSave={saveCover}
                  onClear={clearCover}
                />
              ) : null
            }
          />

          <PlaylistTrackList
            tracks={playlist.tracks}
            removingTrackId={removingTrackId}
            isReordering={isSaving}
            streamingLinksByTrackId={streamingLinksByTrackId}
            onRemoveTrack={(id, name) => void removeTrack(id, name)}
            onReorderTrack={(sourceId, targetId) =>
              void reorderTracks(sourceId, targetId)
            }
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddTracksOpen(true)}
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
            >
              곡 추가
            </button>
          </div>

          <AddTracksFromAlbumModal
            isOpen={isAddTracksOpen}
            playlistId={playlist.id}
            existingTrackIds={existingTrackIds}
            onClose={() => setIsAddTracksOpen(false)}
            onTracksChanged={() => void reload()}
          />
        </>
      ) : null}
    </PlaylistDetailShell>
  );
}
