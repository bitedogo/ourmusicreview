/** Featured 앨범 제목·아티스트 정보 */

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
      <h3 className="truncate text-left text-[length:var(--text-featured-title)] font-bold leading-tight text-[var(--color-text-primary)]">
        {album.title}
      </h3>

      <p className="mt-0.5 truncate text-left text-[length:var(--text-featured-artist)] font-bold leading-tight text-[var(--color-text-secondary)]">
        {album.artist}
      </p>

      <div className="mt-1 flex items-center justify-between gap-[var(--featured-card-inner-gap)] text-[length:var(--text-featured-meta)] text-[var(--color-text-secondary)]">
        <span className="min-w-0 truncate">{album.genre || ""}</span>
        {releaseYear ? (
          <span className="shrink-0 text-right">{releaseYear}</span>
        ) : null}
      </div>

      <div className="mt-1 border-t border-[var(--color-divider)] pt-1">
        <RatingDisplay rating={album.averageRating} />
      </div>
    </div>
  );
}
