import Image from "next/image";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import type { TodayAlbumData } from "@/src/lib/today-album/types";

interface TodayAlbumCoverProps {
  album: TodayAlbumData | null;
  hasImageError: boolean;
  onImageError: () => void;
}

export function TodayAlbumCover({
  album,
  hasImageError,
  onImageError,
}: TodayAlbumCoverProps) {
  if (!album) {
    return (
      <div className="mx-auto flex aspect-square w-full max-w-[320px] items-center justify-center text-sm text-zinc-400 sm:mx-0 sm:h-[320px] sm:w-[320px] sm:shrink-0">
        앨범 없음
      </div>
    );
  }

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-2xl sm:mx-0 sm:h-[320px] sm:w-[320px] sm:shrink-0">
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
        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
          {ALBUM_COVER_PLACEHOLDER}
        </div>
      )}
    </div>
  );
}
