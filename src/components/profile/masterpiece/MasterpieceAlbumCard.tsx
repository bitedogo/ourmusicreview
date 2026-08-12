/** Masterpiece 앨범 카드 (편집·드래그) */

import { type DragEvent, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MasterpieceAlbumMeta } from "./MasterpieceAlbumMeta";
import { yearFromRelease } from "./masterpiece-utils";

export interface MasterpieceSlideAlbum {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

interface MasterpieceAlbumCardProps {
  album: MasterpieceSlideAlbum;
  isEditing: boolean;
  isProcessing: boolean;
  isDragging: boolean;
  draggable: boolean;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  /** 터치 드래그 종료 시 드롭 대상 id */
  onTouchDrop: (targetId: string) => void;
  onRemove: () => void;
}

const LONG_PRESS_MS = 280;
const MOVE_CANCEL_PX = 10;

export function MasterpieceAlbumCard({
  album,
  isEditing,
  isProcessing,
  isDragging,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onTouchDrop,
  onRemove,
}: MasterpieceAlbumCardProps) {
  const year = yearFromRelease(album.releaseDate);
  const genre = album.genre?.trim() || "—";
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragGhostRef = useRef<HTMLElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const isTouchDraggingRef = useRef(false);

  function clearLongPress() {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function cleanupGhost() {
    dragGhostRef.current?.remove();
    dragGhostRef.current = null;
  }

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    if (isTouchDraggingRef.current) {
      e.preventDefault();
      return;
    }

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    const clone = target.cloneNode(true) as HTMLElement;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.opacity = "0.55";
    clone.style.position = "fixed";
    clone.style.top = "-9999px";
    clone.style.left = "-9999px";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "9999";
    clone.style.transform = "rotate(3deg) scale(1.02)";
    clone.style.boxShadow = "0 12px 28px rgba(0,0,0,0.28)";
    clone.querySelectorAll("a").forEach((a) => a.removeAttribute("href"));

    document.body.appendChild(clone);
    dragGhostRef.current = clone;

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", album.id);
    e.dataTransfer.setDragImage(
      clone,
      Math.min(Math.max(e.clientX - rect.left, 12), rect.width - 12),
      Math.min(Math.max(e.clientY - rect.top, 12), rect.height - 12)
    );

    onDragStart(e);
  }

  function handleDragEnd() {
    cleanupGhost();
    onDragEnd();
  }

  useEffect(() => {
    const node = rootRef.current;
    if (!node || !draggable) return;

    function handleTouchStart(event: TouchEvent) {
      if (!draggable || event.touches.length !== 1) return;
      const touch = event.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      isTouchDraggingRef.current = false;
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => {
        isTouchDraggingRef.current = true;
        onDragStart({} as DragEvent<HTMLDivElement>);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate?.(15);
        }
      }, LONG_PRESS_MS);
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      const start = touchStartRef.current;
      if (!touch || !start) return;

      if (!isTouchDraggingRef.current) {
        const dx = Math.abs(touch.clientX - start.x);
        const dy = Math.abs(touch.clientY - start.y);
        if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) {
          clearLongPress();
        }
        return;
      }

      event.preventDefault();
    }

    function handleTouchEnd(event: TouchEvent) {
      clearLongPress();
      const wasDragging = isTouchDraggingRef.current;
      isTouchDraggingRef.current = false;
      touchStartRef.current = null;

      if (!wasDragging) return;

      event.preventDefault();
      const touch = event.changedTouches[0];
      if (!touch) {
        onDragEnd();
        return;
      }

      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const target = el?.closest("[data-masterpiece-id]") as HTMLElement | null;
      const targetId = target?.dataset.masterpieceId;
      if (targetId && targetId !== album.id) {
        onTouchDrop(targetId);
      }
      onDragEnd();
    }

    function handleTouchCancel() {
      clearLongPress();
      if (isTouchDraggingRef.current) {
        isTouchDraggingRef.current = false;
        onDragEnd();
      }
      touchStartRef.current = null;
    }

    node.addEventListener("touchstart", handleTouchStart, { passive: true });
    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    node.addEventListener("touchend", handleTouchEnd, { passive: false });
    node.addEventListener("touchcancel", handleTouchCancel);

    return () => {
      clearLongPress();
      node.removeEventListener("touchstart", handleTouchStart);
      node.removeEventListener("touchmove", handleTouchMove);
      node.removeEventListener("touchend", handleTouchEnd);
      node.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [album.id, draggable, onDragEnd, onDragStart, onTouchDrop]);

  return (
    <div
      ref={rootRef}
      data-masterpiece-id={album.id}
      className={`relative w-full shrink-0 touch-manipulation transition-[opacity,transform] duration-150 ${
        draggable ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "z-10 scale-[0.98] opacity-35" : "opacity-100"}`}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={handleDragEnd}
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
          if (isEditing || isDragging) e.preventDefault();
        }}
        draggable={false}
      >
        <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-t-[10px] bg-[#464646]">
          {album.imageUrl ? (
            <Image
              src={album.imageUrl}
              alt={album.title}
              width={200}
              height={200}
              draggable={false}
              className="h-full w-full object-cover"
            />
          ) : null}
        </div>

        <MasterpieceAlbumMeta
          title={album.title}
          artist={album.artist}
          genre={genre}
          year={year}
          footer={
            <p className="text-center text-[9px] font-bold leading-snug tracking-[-0.005em] text-[#43A7B2] lg:text-[10px]">
              Rating : -
            </p>
          }
        />
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
