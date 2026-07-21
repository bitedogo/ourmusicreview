/** Masterpiece 앨범 카드 (편집·드래그) */

import { type DragEvent } from "react";
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
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
}

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
  onRemove,
}: MasterpieceAlbumCardProps) {
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
