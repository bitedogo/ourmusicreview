import Image from "next/image";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import type { TodayAlbumData } from "@/src/lib/today-album/types";

interface TodayAlbumCoverProps {
  album: TodayAlbumData | null;
  hasImageError: boolean;
  onImageError: () => void;
}

const coverSizeClass =
  "max-w-[var(--today-album-cover-size)] sm:h-[var(--today-album-cover-size)] sm:w-[var(--today-album-cover-size)]";

export function TodayAlbumCover({
  album,
  hasImageError,
  onImageError,
}: TodayAlbumCoverProps) {
  if (!album) {
    return (
      <div
        className={`mx-auto flex aspect-square w-full items-center justify-center text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)] sm:mx-0 sm:shrink-0 ${coverSizeClass}`}
      >
        앨범 없음
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto aspect-square w-full overflow-hidden rounded-[var(--featured-cover-radius)] sm:mx-0 sm:shrink-0 ${coverSizeClass}`}
    >
      {album.imageUrl && !hasImageError ? (
        <Image
          src={album.imageUrl}
          alt={`${album.title} cover`}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 320px"
          className="h-full w-full object-cover"
          onError={onImageError}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[length:var(--text-featured-meta)] font-medium text-[var(--color-text-muted)]">
          {ALBUM_COVER_PLACEHOLDER}
        </div>
      )}
    </div>
  );
}
