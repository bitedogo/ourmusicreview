import type { FeaturedAlbumCardData } from "@/src/lib/featured-albums/types";
import { formatGenreYear } from "@/src/lib/utils/album";
import { RatingDisplay } from "../rating-display";

interface FeaturedAlbumInfoProps {
  album: FeaturedAlbumCardData;
}

export function FeaturedAlbumInfo({ album }: FeaturedAlbumInfoProps) {
  return (
    <div className="flex flex-col gap-[var(--featured-card-inner-gap)] px-[var(--featured-card-padding)] pt-[var(--featured-card-inner-gap)] pb-[var(--featured-card-padding)]">
      <h3 className="truncate text-left text-[length:var(--text-featured-title)] font-bold text-[var(--color-text-primary)]">
        {album.title}
      </h3>

      <div className="flex items-center justify-between gap-[var(--featured-card-inner-gap)] text-[length:var(--text-featured-meta)] text-[var(--color-text-secondary)]">
        <span className="min-w-0 truncate">{album.artist}</span>
        <span className="shrink-0 text-right">
          {formatGenreYear(album.genre, album.releaseDate)}
        </span>
      </div>

      <div className="border-t border-[var(--color-divider)] pt-[var(--featured-rating-divider-padding-top)] pb-[var(--featured-rating-divider-padding-bottom)]">
        <RatingDisplay rating={album.averageRating} />
      </div>
    </div>
  );
}
