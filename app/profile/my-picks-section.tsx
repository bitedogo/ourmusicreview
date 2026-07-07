"use client";

import { useEffect, useState } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import Link from "next/link";
import { useSlideSourceState } from "@/src/hooks/use-slide-source-state";
import { ItunesAlbumPickerModal } from "@/src/components/itunes/itunes-album-picker-modal";
import type { SearchAlbumResult } from "@/src/lib/search/types";

const MIN_FOR_SLIDE = 15;
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

interface UserSlideResponse {
  ok: true;
  data: {
    albums: SlideAlbum[];
    count: number;
    minForSlide: number;
    maxCount: number;
  };
}

export function MyPicksSection({ embedded = false }: { embedded?: boolean }) {
  const [albums, setAlbums] = useState<SlideAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const { slideSource, updateSlideSource } = useSlideSourceState();

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<UserSlideResponse>("/api/user/slide");
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
        "/api/user/slide",
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
    if (!confirm("이 앨범을 제거할까요?")) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await fetchJson<{ ok: true }>(
        `/api/user/slide?id=${encodeURIComponent(id)}`,
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

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const next = reorderById(albums, draggingId, targetId);
    if (next === albums) return;
    await saveOrder(next.map((a) => a.id));
  }

  async function saveOrder(ids: string[]) {
    setIsSavingOrder(true);
    try {
      await fetchJson<{ ok: true }>("/api/user/slide", {
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

  const canShowInSlide = albums.length >= MIN_FOR_SLIDE;

  return (
    <section className="flex shrink-0 flex-col space-y-3 md:space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">
            나만의 명반
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">
              {albums.length}/{MAX_COUNT}
            </span>
            <button
              type="button"
              onClick={openAddModal}
              disabled={albums.length >= MAX_COUNT || isLoading}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              앨범 추가
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-zinc-500">
            {albums.length}/{MAX_COUNT}
          </span>
          <button
            type="button"
            onClick={openAddModal}
            disabled={albums.length >= MAX_COUNT || isLoading}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            앨범 추가
          </button>
        </div>
      )}

      {canShowInSlide && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={slideSource === "user"}
            onClick={() => updateSlideSource("user")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              slideSource === "user"
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white cursor-default"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Custom Slidebar
          </button>
          <button
            type="button"
            disabled={slideSource === "admin"}
            onClick={() => updateSlideSource("admin")}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              slideSource === "admin"
                ? "border-[var(--color-brand-primary)] bg-[var(--color-brand-primary)] text-white cursor-default"
                : "border-zinc-300 text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Admin Slidebar
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">불러오는 중...</p>
      ) : albums.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          등록된 앨범이 없습니다. 앨범 추가로 나만의 명반을 꾸며보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[albums.slice(0, 15), albums.slice(15, 30)].map((column, colIdx) => (
            <div key={colIdx} className="flex flex-col space-y-1.5">
              {column.map((album) => (
                <div
                  key={album.id}
                  draggable={!isSavingOrder}
                  onDragStart={() => setDraggingId(album.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(album.id)}
                  onDragEnd={() => setDraggingId(null)}
                  className={`flex cursor-grab items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2 active:cursor-grabbing ${
                    draggingId === album.id ? "opacity-60" : ""
                  }`}
                >
                  <span className="shrink-0 text-zinc-300 text-[10px]">⋮⋮</span>
                  {album.imageUrl ? (
                    <Image
                      src={album.imageUrl}
                      alt={album.title}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 shrink-0 rounded bg-zinc-200" />
                  )}
                  <Link
                    href={`/review/album/${encodeURIComponent(album.collectionId)}`}
                    className="min-w-0 flex-1 truncate text-[11px] font-medium text-zinc-900 hover:text-[var(--color-brand-primary)]"
                  >
                    {album.title} · {album.artist}
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeAlbum(album.id)}
                    disabled={processingIds.has(album.id)}
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    {processingIds.has(album.id) ? "..." : "삭제"}
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <ItunesAlbumPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAlbumSelect={handleAlbumSelect}
        isSelecting={addSubmitting}
        selectError={addError}
        titleId="add-pick-album-title"
      />
    </section>
  );
}
