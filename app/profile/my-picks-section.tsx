"use client";

/**
 * 나의 Masterpiece (유저 슬라이드 앨범)
 * - 추가 / 삭제 / 드래그 정렬 / 공개 토글
 */

import { useEffect, useState } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { ItunesAlbumPickerModal } from "@/src/components/itunes/itunes-album-picker-modal";
import { MasterpieceInfoTip } from "@/src/components/profile/ProfileInfoTips";
import { ProfilePrivacyToggle } from "@/src/components/profile/ProfilePrivacyToggle";
import {
  PROFILE_SECTION_CARD,
  PROFILE_SECTION_DIVIDER,
  PROFILE_SECTION_INSET,
  PROFILE_SECTION_TITLE,
  MASTERPIECE_GRID,
  MASTERPIECE_GRID_COL_WIDTH,
} from "@/src/components/profile/profile-section-styles";
import { MasterpieceAddCard } from "@/src/components/profile/masterpiece/MasterpieceAddCard";
import {
  MasterpieceAlbumCard,
  type MasterpieceSlideAlbum,
} from "@/src/components/profile/masterpiece/MasterpieceAlbumCard";
import { MASTERPIECE_MAX_COUNT } from "@/src/components/profile/masterpiece/masterpiece-utils";
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

interface MyPicksSectionProps {
  embedded?: boolean;
  isPublic?: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

export function MyPicksSection({
  embedded = false,
  isPublic = true,
  isSavingPrivacy = false,
  onPrivacyChange,
}: MyPicksSectionProps) {
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

  useEffect(() => {
    void fetchAlbums();
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
      const data = await fetchJson<{ ok: true; data: { album: MasterpieceSlideAlbum | null } }>(
        "/api/user/slide",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ collectionId: album.collectionId }),
        }
      );
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
      await fetchJson<{ ok: true }>(`/api/user/slide?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
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
    if (!draggingId || draggingId === targetId || isEditing) return;
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
          .filter((a): a is MasterpieceSlideAlbum => a !== null);
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "순서 저장 중 오류가 발생했습니다."));
    } finally {
      setIsSavingOrder(false);
      setDraggingId(null);
    }
  }

  const canAdd = albums.length < MASTERPIECE_MAX_COUNT && !isLoading;
  const isEmpty = albums.length === 0;

  const grid = (
    <>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : isEmpty && canAdd ? (
        <div className="flex justify-center">
          <div className={MASTERPIECE_GRID_COL_WIDTH}>
            <MasterpieceAddCard
              count={albums.length}
              onClick={openAddModal}
              disabled={isEditing}
            />
          </div>
        </div>
      ) : (
        <div className={MASTERPIECE_GRID}>
          {albums.map((album) => (
            <MasterpieceAlbumCard
              key={album.id}
              album={album}
              isEditing={isEditing}
              isProcessing={processingIds.has(album.id)}
              isDragging={draggingId === album.id}
              draggable={!isSavingOrder && !isEditing}
              onDragStart={() => setDraggingId(album.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => void handleDrop(album.id)}
              onDragEnd={() => setDraggingId(null)}
              onRemove={() => void removeAlbum(album.id)}
            />
          ))}

          {canAdd && (
            <MasterpieceAddCard
              count={albums.length}
              onClick={openAddModal}
              disabled={isEditing}
            />
          )}
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
    </>
  );

  if (!embedded) {
    return <section className="flex shrink-0 flex-col">{grid}</section>;
  }

  return (
    <section
      className={`${PROFILE_SECTION_CARD} overflow-visible pb-10 pt-10 ${PROFILE_SECTION_INSET}`}
    >
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <h2 className={PROFILE_SECTION_TITLE}>나의 Masterpiece</h2>
          <MasterpieceInfoTip />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            className={`box-border flex h-[35px] w-[55px] items-center justify-center rounded-[10px] border border-[#D9D9D9] text-[13px] leading-4 transition ${
              isEditing
                ? "bg-[#43A7B2] text-white"
                : "bg-white text-[#43A7B2] hover:bg-[#FAFAFA]"
            }`}
          >
            {isEditing ? "완료" : "편집"}
          </button>
          {onPrivacyChange && (
            <ProfilePrivacyToggle
              isPublic={isPublic}
              disabled={isSavingPrivacy}
              onChange={onPrivacyChange}
            />
          )}
        </div>
      </div>

      <div className={PROFILE_SECTION_DIVIDER} aria-hidden />

      {grid}
    </section>
  );
}
