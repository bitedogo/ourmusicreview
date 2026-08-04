"use client";
/** 단일 트랙을 플레이리스트에 담는 모달 */

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import { buildAddTrackPayload } from "@/src/components/playlist/build-add-track-payload";
import {
  addTrackToPlaylistApi,
  createPlaylistApi,
  fetchMyPlaylists,
  type PlaylistListItemDto,
} from "./playlist-api";

interface AddTrackToPlaylistModalProps {
  isOpen: boolean;
  album: AlbumDetail;
  track: AlbumDetailTrack;
  onClose: () => void;
}

export function AddTrackToPlaylistModal({
  isOpen,
  album,
  track,
  onClose,
}: AddTrackToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<PlaylistListItemDto[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      setNewPlaylistTitle("");
      try {
        const response = await fetchMyPlaylists();
        if (cancelled) return;
        const loaded = response.data.playlists ?? [];
        setPlaylists(loaded);
        setSelectedPlaylistId(loaded[0]?.id ?? "");
      } catch {
        if (!cancelled) {
          setError("플레이리스트를 불러오지 못했습니다.");
          setPlaylists([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, track.id]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      let targetPlaylistId = selectedPlaylistId;
      const title = newPlaylistTitle.trim();

      if (title) {
        const created = await createPlaylistApi({
          title,
          isPublic: false,
          coverImageUrl: album.imageUrl,
        });
        targetPlaylistId = created.data.playlist.id;
      }

      if (!targetPlaylistId) {
        setError("플레이리스트를 선택하거나 새 제목을 입력해주세요.");
        return;
      }

      await addTrackToPlaylistApi(
        targetPlaylistId,
        buildAddTrackPayload(album, track)
      );
      alert(`"${track.title}" 을(를) 플레이리스트에 저장했습니다.`);
      onClose();
    } catch {
      setError("트랙 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-zinc-900">플레이리스트에 담기</h3>
        <p className="mt-1 truncate text-sm text-zinc-600">{track.title}</p>
        <p className="mt-0.5 truncate text-xs text-zinc-400">{album.name}</p>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-zinc-500">불러오는 중...</p>
        ) : (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                기존 플레이리스트
              </label>
              <select
                value={selectedPlaylistId}
                onChange={(event) => setSelectedPlaylistId(event.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              >
                <option value="">선택 안 함</option>
                {playlists.map((playlist) => (
                  <option key={playlist.id} value={playlist.id}>
                    {playlist.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                새 플레이리스트 만들기
              </label>
              <input
                value={newPlaylistTitle}
                onChange={(event) => setNewPlaylistTitle(event.target.value)}
                placeholder="새 제목 입력 시 생성 후 저장"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />
              {newPlaylistTitle.trim() && album.imageUrl ? (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-200">
                    <Image
                      src={album.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                  <p className="text-[11px] leading-snug text-zinc-500">
                    이 앨범 커버가 새 플레이리스트 대표사진으로 저장됩니다.
                  </p>
                </div>
              ) : null}
            </div>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isLoading || isSaving}
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
          >
            {isSaving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
