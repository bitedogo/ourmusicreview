"use client";

/**
 * 나의 Masterpiece (유저 슬라이드 앨범)
 * - 추가 / 삭제 / 드래그 정렬 / 공개 토글
 * - 그리드: 모바일 3열, 데스크톱 6열
 */

import { useEffect, useState, type DragEvent } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import Link from "next/link";
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

interface MyPicksSectionProps {
  embedded?: boolean;
  isPublic?: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

function yearFromRelease(releaseDate: string) {
  const y = releaseDate?.slice(0, 4);
  return y && /^\d{4}$/.test(y) ? y : "";
}

export function MyPicksSection({
  embedded = false,
  isPublic = true,
  isSavingPrivacy = false,
  onPrivacyChange,
}: MyPicksSectionProps) {
  const [albums, setAlbums] = useState<SlideAlbum[]>([]);
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
    if (isEditing) return;
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
          .filter((a): a is SlideAlbum => a !== null);
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "순서 저장 중 오류가 발생했습니다."));
    } finally {
      setIsSavingOrder(false);
      setDraggingId(null);
    }
  }

  const canAdd = albums.length < MAX_COUNT && !isLoading;

  const body = (
    <>
      {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

      {isLoading ? (
        <p className="py-16 text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-3 justify-items-stretch gap-x-2 gap-y-6 lg:grid-cols-6 lg:gap-x-3">
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
              onDrop={() => handleDrop(album.id)}
              onDragEnd={() => setDraggingId(null)}
              onRemove={() => removeAlbum(album.id)}
            />
          ))}

          {canAdd && (
            <button
              type="button"
              onClick={openAddModal}
              disabled={isEditing}
              className="relative flex aspect-square w-full flex-col items-center justify-center rounded-[10px] border-2 border-dashed border-[#43A7B2] bg-[#FEFEFE] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] transition hover:bg-[#F7FCFD] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#71BCC5] sm:h-12 sm:w-12"
                aria-hidden
              >
                <span className="relative block h-6 w-6 sm:h-7 sm:w-7">
                  <span className="absolute left-0 top-1/2 h-0 w-full -translate-y-1/2 border-t-2 border-[#71BCC5]" />
                  <span className="absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-l-2 border-[#71BCC5]" />
                </span>
              </span>
              <span className="absolute bottom-3 left-0 right-0 text-center text-[12px] font-bold leading-4 text-[#43A7B2] lg:text-[13px]">
                {albums.length}/{MAX_COUNT}
              </span>
            </button>
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
    return <section className="flex shrink-0 flex-col">{body}</section>;
  }

  return (
    <section className="relative mx-auto box-border w-full max-w-[1100px] overflow-hidden rounded-[15px] border border-[#D9D9D9] bg-white px-4 pb-10 pt-10 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:px-6 lg:px-[52px]">
      {/* 헤더: 제목+i 한 줄 / 편집·토글은 모바일에서 다음 줄 */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <h2 className="text-[15px] font-normal leading-[18px] text-black">
            나의 Masterpiece
          </h2>
          <InfoIconWithTip />
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
            <MasterpiecePrivacyToggle
              isPublic={isPublic}
              disabled={isSavingPrivacy}
              onChange={onPrivacyChange}
            />
          )}
        </div>
      </div>

      <div className="mb-8 h-px w-full bg-[#E3E3E3]" aria-hidden />

      {body}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 앨범 카드                                                                   */
/* -------------------------------------------------------------------------- */

function MasterpieceAlbumCard({
  album,
  isEditing,
  isProcessing,
  isDragging,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemove,
}: {
  album: SlideAlbum;
  isEditing: boolean;
  isProcessing: boolean;
  isDragging: boolean;
  draggable: boolean;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  const year = yearFromRelease(album.releaseDate);
  const genre = album.genre?.trim() || "—";

  return (
    <div
      className={`relative w-full shrink-0 ${isDragging ? "opacity-60" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {isEditing && (
        <button
          type="button"
          aria-label={`${album.title} 삭제`}
          disabled={isProcessing}
          onClick={onRemove}
          className="absolute -right-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.25)] disabled:opacity-50"
        >
          <RemoveXIcon />
        </button>
      )}

      <Link
        href={`/review/album/${encodeURIComponent(album.collectionId)}`}
        className="flex w-full flex-col overflow-hidden rounded-[10px] bg-[#FEFEFE] shadow-[0px_2px_4px_rgba(0,0,0,0.25)]"
        onClick={(e) => {
          if (isEditing) e.preventDefault();
        }}
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-[10px] bg-[#464646]">
          {album.imageUrl ? (
            <Image
              src={album.imageUrl}
              alt={album.title}
              width={200}
              height={200}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <div className="flex min-h-0 flex-col gap-0.5 px-2 pb-2 pt-1.5">
          <p className="truncate text-[10px] font-bold leading-snug tracking-[-0.005em] text-[#464646] lg:text-[11px]">
            {album.title}
          </p>
          <p className="truncate text-[8px] font-bold leading-snug tracking-[-0.005em] text-[#939393] lg:text-[9px]">
            {album.artist}
          </p>
          <div className="flex items-start justify-between gap-1 text-[7px] font-bold leading-snug tracking-[-0.005em] text-[#939393] lg:text-[8px]">
            <span className="min-w-0 break-words">{genre}</span>
            <span className="shrink-0">{year}</span>
          </div>
          <div className="mt-0.5 w-full border-t border-[#464646]" aria-hidden />
          <p className="pt-0.5 text-center text-[9px] font-bold leading-snug tracking-[-0.005em] text-[#43A7B2] lg:text-[10px]">
            Rating : -
          </p>
        </div>
      </Link>
    </div>
  );
}

function RemoveXIcon() {
  return (
    <span className="relative block h-[12.38px] w-[12.37px]" aria-hidden>
      <span className="absolute left-1/2 top-1/2 h-[17.5px] w-0 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l-[3px] border-[#FF1D1D]" />
      <span className="absolute left-1/2 top-1/2 h-[17.5px] w-0 -translate-x-1/2 -translate-y-1/2 -rotate-45 border-l-[3px] border-[#FF1D1D]" />
    </span>
  );
}

function InfoIconWithTip() {
  return (
    <span
      className="group relative inline-flex h-[22px] w-[22px] cursor-default items-center justify-center"
      title={`최대 ${MAX_COUNT}장까지 등록할 수 있습니다. ${MIN_FOR_SLIDE}장 이상이면 메인 슬라이드에 사용할 수 있습니다.`}
    >
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#D9D9D9] text-[11px] font-bold text-white">
        i
      </span>
      <span className="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden w-52 -translate-y-1/2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[11px] leading-snug text-zinc-600 shadow-md group-hover:block">
        최대 {MAX_COUNT}장까지 등록할 수 있습니다. {MIN_FOR_SLIDE}장 이상이면 메인 슬라이드에
        사용할 수 있습니다.
      </span>
    </span>
  );
}

function MasterpiecePrivacyToggle({
  isPublic,
  onChange,
  disabled,
}: {
  isPublic: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="box-border flex h-[35px] w-[111px] items-center rounded-[10px] border border-[#D9D9D9] bg-[#FAFAFA] px-[5px]">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`flex h-6 w-[47px] items-center justify-center rounded-[6px] text-[13px] leading-4 transition disabled:opacity-50 ${
          isPublic
            ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
            : "bg-transparent text-[#D9D9D9]"
        }`}
      >
        공개
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`flex h-6 flex-1 items-center justify-center rounded-[6px] text-[13px] leading-4 transition disabled:opacity-50 ${
          !isPublic
            ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
            : "bg-transparent text-[#D9D9D9]"
        }`}
      >
        비공개
      </button>
    </div>
  );
}
