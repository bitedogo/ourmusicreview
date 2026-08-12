"use client";
/** 관리자 Featured 슬라이드 클라이언트 */

import { useEffect, useState } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import Image from "next/image";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { ItunesAlbumPickerModal } from "@/src/components/itunes/itunes-album-picker-modal";
import type { SearchAlbumResult } from "@/src/lib/search/types";
const MIN_COUNT = 10;
const MAX_COUNT = 30;

interface SlideAlbum {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

interface FeaturedSlideListResponse {
  ok: true;
  data: {
    albums: SlideAlbum[];
  };
}

export function FeaturedSlideClient() {
  const [albums, setAlbums] = useState<SlideAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<FeaturedSlideListResponse>("/api/admin/featured-slide");
      setAlbums(data.data.albums ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "목록을 불러오는 중 오류가 발생했습니다."));
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }

  function openAddModal() {
    setAddError(null);
    setModalOpen(true);
  }

  async function handleAlbumSelect(album: SearchAlbumResult) {
    if (albums.length >= MAX_COUNT) {
      setAddError(`최대 ${MAX_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    try {
      const data = await fetchJson<{ ok: true; data: { album: SlideAlbum | null } }>(
        "/api/admin/featured-slide",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId: album.collectionId }),
        }
      );
      const createdAlbum = data.data.album;
      if (createdAlbum) {
        setAlbums((prev) => [...prev, createdAlbum]);
      }
      setModalOpen(false);
    } catch (err) {
      setAddError(getApiErrorMessage(err, "추가 중 오류가 발생했습니다."));
    } finally {
      setAddSubmitting(false);
    }
  }

  async function removeAlbum(id: string) {
    if (albums.length <= MIN_COUNT) {
      alert(`최소 ${MIN_COUNT}개는 유지해야 합니다.`);
      return;
    }
    if (!confirm("이 앨범을 슬라이드바에서 제거할까요?")) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await fetchJson<{ ok: true }>(
        `/api/admin/featured-slide?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "삭제 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function getReorderedAlbums(sourceId: string, targetId: string): SlideAlbum[] {
    return reorderById(albums, sourceId, targetId);
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const next = getReorderedAlbums(draggingId, targetId);
    if (next === albums) return;
    await saveOrder(next.map((a) => a.id));
  }

  async function saveOrder(ids: string[]) {
    setIsSavingOrder(true);
    try {
      await fetchJson<{ ok: true }>("/api/admin/featured-slide", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ids }),
      });
      setAlbums((prev) => {
        const byId = new Map(prev.map((a) => [a.id, a]));
        return ids
          .map((id, i) => {
            const a = byId.get(id);
            return a ? { ...a, position: i + 1 } : null;
          })
          .filter((a): a is SlideAlbum => a !== null);
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "순서 저장 중 오류가 발생했습니다."));
    } finally {
      setIsSavingOrder(false);
      setDraggingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">명반 슬라이드바 관리</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-[var(--color-text-secondary)]">
            현재 <strong>{albums.length}</strong>개 / {MAX_COUNT}개
          </span>
          {albums.length < MIN_COUNT && (
            <span className="hidden rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 sm:inline">
              최소 {MIN_COUNT}개 이상
            </span>
          )}
          <button
            type="button"
            onClick={openAddModal}
            disabled={albums.length >= MAX_COUNT || isLoading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            앨범 추가
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
        항목을 드래그해서 순서를 변경할 수 있습니다.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          목록을 불러오는 중...
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          등록된 앨범이 없습니다. 앨범 추가로 최소 {MIN_COUNT}개를 등록해 주세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {albums.map((album, index) => (
            <li
              key={album.id}
              draggable={!isSavingOrder}
              onDragStart={() => setDraggingId(album.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(album.id)}
              onDragEnd={() => setDraggingId(null)}
              className={`flex cursor-grab items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3 active:cursor-grabbing ${
                draggingId === album.id ? "opacity-60" : ""
              }`}
            >
              <span className="shrink-0 text-[var(--color-text-muted)]">⋮⋮</span>
              <span className="w-6 shrink-0 text-right text-sm text-[var(--color-text-muted)]">
                {index + 1}
              </span>
              {album.imageUrl ? (
                <Image
                  src={album.imageUrl}
                  alt={album.title ?? "앨범 커버"}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-zinc-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-text-primary)]">{album.title}</p>
                <ArtistNameLink
                  name={album.artist}
                  className="truncate text-left text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                />
              </div>
              <button
                type="button"
                onClick={() => removeAlbum(album.id)}
                disabled={albums.length <= MIN_COUNT || processingIds.has(album.id)}
                className="shrink-0 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {processingIds.has(album.id) ? "처리 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ItunesAlbumPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAlbumSelect={handleAlbumSelect}
        isSelecting={addSubmitting}
        selectError={addError}
        titleId="add-album-title"
      />
    </div>
  );
}
