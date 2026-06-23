import Image from "next/image";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";

interface FeaturedAlbumCoverProps {
  title: string;
  imageUrl: string | null;
}

export function FeaturedAlbumCover({ title, imageUrl }: FeaturedAlbumCoverProps) {
  return (
    <div className="relative aspect-square w-full">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${title} cover`}
          fill
          unoptimized
          sizes="(max-width: 640px) 192px, 224px"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
          {ALBUM_COVER_PLACEHOLDER}
        </div>
      )}
    </div>
  );
}
