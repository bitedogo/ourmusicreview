import type { FeaturedAlbumCardData } from "@/src/lib/featured-albums/types";
import { getReleaseYear } from "@/src/lib/utils/album";
import { RatingDisplay } from "../rating-display";

interface FeaturedAlbumInfoProps {
  album: FeaturedAlbumCardData;
}

export function FeaturedAlbumInfo({ album }: FeaturedAlbumInfoProps) {
  const releaseYear = getReleaseYear(album.releaseDate);

  return (
    <div className="px-[var(--featured-card-padding)] pt-[var(--featured-card-gap)] pb-[var(--featured-card-padding)]">
      <h3 className="truncate text-left text-[length:var(--text-featured-title)] font-bold text-[var(--color-text-primary)]">
        {album.title}
      </h3>

      <p className="mt-[var(--featured-card-inner-gap)] truncate text-left text-[length:var(--text-featured-artist)] font-bold text-[var(--color-text-secondary)]">
        {album.artist}
      </p>

      <div className="mt-[var(--featured-card-inner-gap)] flex items-center justify-between gap-[var(--featured-card-inner-gap)] text-[length:var(--text-featured-meta)] text-[var(--color-text-secondary)]">
        <span className="min-w-0 truncate">{album.genre || ""}</span>
        {releaseYear ? (
          <span className="shrink-0 text-right">{releaseYear}</span>
        ) : null}
      </div>

      <div className="mt-[var(--featured-card-inner-gap)] border-t border-[var(--color-divider)] pt-[var(--featured-card-inner-gap)]">
        <RatingDisplay rating={album.averageRating} />
      </div>
    </div>
  );
}
