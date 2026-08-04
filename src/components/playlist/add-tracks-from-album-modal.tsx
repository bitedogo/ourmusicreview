"use client";
/** 앨범/싱글 검색 후 트랙을 현재 플레이리스트에 담는 모달 */

import Image from "next/image";
import { AlbumTrackList } from "@/src/components/album/album-track-list";
import { ItunesAlbumSearchPanel } from "@/src/components/itunes/itunes-album-search-panel";
import { useAddTracksFromAlbum } from "@/src/hooks/use-add-tracks-from-album";

interface AddTracksFromAlbumModalProps {
  isOpen: boolean;
  playlistId: string;
  existingTrackIds: string[];
  onClose: () => void;
  onTracksChanged: () => void;
}

export function AddTracksFromAlbumModal({
  isOpen,
  playlistId,
  existingTrackIds,
  onClose,
  onTracksChanged,
}: AddTracksFromAlbumModalProps) {
  const {
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
  } = useAddTracksFromAlbum({
    isOpen,
    playlistId,
    existingTrackIds,
    onTracksChanged,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-tracks-from-album-title"
      >
        <div className="shrink-0 border-b border-zinc-100 px-5 py-4">
          <h3
            id="add-tracks-from-album-title"
            className="text-lg font-semibold text-zinc-900"
          >
            곡 추가
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            아티스트를 검색해 앨범/싱글을 고른 뒤, 트랙을 담으세요.
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {album ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={clearAlbum}
                className="text-sm text-zinc-600 hover:underline"
              >
                ← 앨범 다시 선택
              </button>

              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                  {album.imageUrl ? (
                    <Image
                      src={album.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {album.name}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {album.artists.join(", ")}
                  </p>
                </div>
              </div>

              <AlbumTrackList
                tracks={album.tracks}
                renderAction={(track) => (
                  <button
                    type="button"
                    disabled={isTrackActionDisabled(track.id)}
                    onClick={() => void addTrack(track)}
                    className="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-default disabled:opacity-60"
                  >
                    {trackActionLabel(track.id)}
                  </button>
                )}
              />
            </div>
          ) : (
            <>
              <ItunesAlbumSearchPanel
                picker={picker}
                onAlbumSelect={selectAlbum}
                isSelecting={isLoadingAlbum}
                error={selectError}
                variant="modal"
                searchPlaceholder="아티스트 검색"
              />
              {isLoadingAlbum ? (
                <p className="mt-3 text-center text-sm text-zinc-500">
                  트랙리스트를 불러오는 중...
                </p>
              ) : null}
            </>
          )}

          {actionMessage ? (
            <p className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700">
              {actionMessage}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-zinc-100 px-5 py-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
