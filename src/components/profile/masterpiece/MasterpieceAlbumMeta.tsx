"use client";
/** Masterpiece 앨범 카드 메타 영역 (앨범·추가 카드 공용) */

import { ReactNode } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";

interface MasterpieceAlbumMetaProps {
  title: string;
  artist: string;
  genre: string;
  year: string;
  footer: ReactNode;
  /** false면 아티스트를 링크로 만들지 않음 (레이아웃 플레이스홀더 등) */
  linkArtist?: boolean;
}

export function MasterpieceAlbumMeta({
  title,
  artist,
  genre,
  year,
  footer,
  linkArtist = true,
}: MasterpieceAlbumMetaProps) {
  return (
    <div className="flex min-h-0 flex-col gap-0.5 px-2 pb-2 pt-1.5">
      <p className="truncate text-[10px] font-bold leading-snug tracking-[-0.005em] text-[#505050] lg:text-[11px]">
        {title}
      </p>
      {linkArtist ? (
        <ArtistNameLink
          name={artist}
          className="truncate text-left text-[8px] font-bold leading-snug tracking-[-0.005em] text-[#949494] transition hover:text-[#43A7B2] hover:underline disabled:cursor-wait disabled:no-underline lg:text-[9px]"
        />
      ) : (
        <p className="truncate text-[8px] font-bold leading-snug tracking-[-0.005em] text-[#949494] lg:text-[9px]">
          {artist}
        </p>
      )}
      <div className="flex items-start justify-between gap-1 text-[7px] font-bold leading-snug tracking-[-0.005em] text-[#949494] lg:text-[8px]">
        <span className="min-w-0 break-words">{genre}</span>
        <span className="shrink-0">{year}</span>
      </div>
      <div className="mt-0.5 w-full border-t border-[#464646]" aria-hidden />
      <div className="pt-0.5">{footer}</div>
    </div>
  );
}
