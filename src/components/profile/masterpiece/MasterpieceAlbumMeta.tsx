/** Masterpiece 앨범 카드 메타 영역 (앨범·추가 카드 공용) */

import { ReactNode } from "react";

interface MasterpieceAlbumMetaProps {
  title: string;
  artist: string;
  genre: string;
  year: string;
  footer: ReactNode;
}

export function MasterpieceAlbumMeta({
  title,
  artist,
  genre,
  year,
  footer,
}: MasterpieceAlbumMetaProps) {
  return (
    <div className="flex min-h-0 flex-col gap-0.5 px-2 pb-2 pt-1.5">
      <p className="truncate text-[10px] font-bold leading-snug tracking-[-0.005em] text-[#464646] lg:text-[11px]">
        {title}
      </p>
      <p className="truncate text-[8px] font-bold leading-snug tracking-[-0.005em] text-[#939393] lg:text-[9px]">
        {artist}
      </p>
      <div className="flex items-start justify-between gap-1 text-[7px] font-bold leading-snug tracking-[-0.005em] text-[#939393] lg:text-[8px]">
        <span className="min-w-0 break-words">{genre}</span>
        <span className="shrink-0">{year}</span>
      </div>
      <div className="mt-0.5 w-full border-t border-[#464646]" aria-hidden />
      <div className="pt-0.5">{footer}</div>
    </div>
  );
}
