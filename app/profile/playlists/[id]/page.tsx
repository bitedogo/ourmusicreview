"use client";
/** 내 플레이리스트 상세(트랙 목록) */

import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AddTracksFromAlbumModal } from "@/src/components/playlist/add-tracks-from-album-modal";
import { PlaylistCoverEditor } from "@/src/components/playlist/playlist-cover-editor";
import { PlaylistDetailHeader } from "@/src/components/playlist/playlist-detail-header";
import { PlaylistTrackList } from "@/src/components/playlist/playlist-track-list";
import { usePlaylistDetail } from "@/src/hooks/use-playlist-detail";
import { profileSelf } from "@/src/lib/navigation/routes";

export default function ProfilePlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
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
  } = usePlaylistDetail(playlistId);

  const existingTrackIds = useMemo(
    () => playlist?.tracks.map((track) => track.trackId) ?? [],
    [playlist]
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => router.push(profileSelf("playlists"))}
          className="mb-4 flex items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          플레이리스트 목록으로
        </button>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          플레이리스트를 불러오는 중...
        </div>
      ) : error || !playlist ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "플레이리스트를 찾을 수 없습니다."}
        </div>
      ) : (
        <>
          <PlaylistDetailHeader
            playlist={playlist}
            isSaving={isSaving}
            onToggleCoverEditor={() => setIsCoverEditorOpen((prev) => !prev)}
            onDelete={() => void deletePlaylist()}
            onSaveGenres={saveGenres}
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
            streamingLinksByTrackId={streamingLinksByTrackId}
            onRemoveTrack={(id, name) => void removeTrack(id, name)}
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
      )}
    </div>
  );
}
