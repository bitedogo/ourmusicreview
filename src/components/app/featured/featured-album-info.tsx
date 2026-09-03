"use client";
/** Featured 앨범 제목·아티스트 정보 */

import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import type { FeaturedAlbumCardData } from "@/src/lib/featured-albums/types";
import { getReleaseYear } from "@/src/lib/utils/album";
import { RatingDisplay } from "../rating-display";

interface FeaturedAlbumInfoProps {
  album: FeaturedAlbumCardData;
}

export function FeaturedAlbumInfo({ album }: FeaturedAlbumInfoProps) {
  const releaseYear = getReleaseYear(album.releaseDate);

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-[var(--featured-card-padding)] py-1.5">
      <h3 className="truncate text-left text-[16px] font-bold leading-[145%] tracking-[-0.005em] text-[#505050]">
        {album.title}
      </h3>

      <ArtistNameLink
        name={album.artist}
        className="mt-0.5 truncate text-left text-[11px] font-bold leading-[145%] tracking-[-0.005em] text-[#949494] transition hover:text-[#43A7B2] hover:underline disabled:cursor-wait disabled:no-underline"
      />

      <div className="mt-1 flex items-center justify-between gap-[var(--featured-card-inner-gap)] text-[10px] font-bold leading-[145%] tracking-[-0.005em] text-[#949494]">
        <span className="min-w-0 truncate">{album.genre || ""}</span>
        {releaseYear ? (
          <span className="shrink-0 text-right">{releaseYear}</span>
        ) : null}
      </div>

      <div className="mt-1 border-t border-[var(--color-divider)] pt-1">
        <RatingDisplay rating={album.averageRating} emptyMode="na" />
      </div>
    </div>
  );
}
