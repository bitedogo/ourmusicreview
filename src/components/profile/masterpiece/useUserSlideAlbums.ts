/** 나의 Masterpiece 슬라이드 API · 상태 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { MasterpieceSlideAlbum } from "./MasterpieceAlbumCard";
import { MASTERPIECE_MAX_COUNT } from "./masterpiece-utils";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface UserSlideResponse {
  ok: true;
  data: {
    albums: MasterpieceSlideAlbum[];
    count: number;
    minForSlide: number;
    maxCount: number;
  };
}

export function useUserSlideAlbums() {
  const [albums, setAlbums] = useState<MasterpieceSlideAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchAlbums = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void fetchAlbums();
  }, [fetchAlbums]);

  function openAddModal() {
    if (isEditing) return;
    setAddError(null);
    setModalOpen(true);
  }

  async function handleAlbumSelect(album: SearchAlbumResult) {
    if (albums.length >= MASTERPIECE_MAX_COUNT) {
      setAddError(`최대 ${MASTERPIECE_MAX_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    try {
      const data = await fetchJson<{
        ok: true;
        data: { album: MasterpieceSlideAlbum | null };
      }>("/api/user/slide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: album.collectionId }),
      });
      if (data.data.album) {
        setAlbums((prev) => [...prev, data.data.album!]);
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
          .filter((a): a is MasterpieceSlideAlbum => a !== null);
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "순서 저장 중 오류가 발생했습니다."));
    } finally {
      setIsSavingOrder(false);
      setDraggingId(null);
    }
  }

  function handleDragStart(id: string) {
    if (isEditing || isSavingOrder) return;
    setDraggingId(id);
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId || isEditing) return;
    const next = reorderById(albums, draggingId, targetId);
    if (next === albums) return;
    await saveOrder(next.map((a) => a.id));
  }

  function handleDragEnd() {
    setDraggingId(null);
  }

  return {
    albums,
    isLoading,
    error,
    processingIds,
    modalOpen,
    setModalOpen,
    addSubmitting,
    addError,
    draggingId,
    isSavingOrder,
    isEditing,
    setIsEditing,
    canAdd: albums.length < MASTERPIECE_MAX_COUNT && !isLoading,
    isEmpty: albums.length === 0,
    openAddModal,
    handleAlbumSelect,
    removeAlbum,
    handleDragStart,
    handleDrop,
    handleDragEnd,
  };
}
