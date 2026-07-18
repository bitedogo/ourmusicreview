/** Featured 앨범 카드 */

import Link from "next/link";
import type { FeaturedAlbumCardData } from "@/src/lib/featured-albums/types";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";
import { FeaturedAlbumCover } from "./featured/featured-album-cover";
import { FeaturedAlbumInfo } from "./featured/featured-album-info";

interface FeaturedAlbumCardProps {
  album: FeaturedAlbumCardData;
}

export function FeaturedAlbumCard({ album }: FeaturedAlbumCardProps) {
  return (
    <Link
      href={buildAlbumReviewPath(album.collectionId)}
      className="mx-[var(--featured-card-margin-x)] flex h-[var(--featured-card-height)] w-[var(--featured-card-width-mobile)] shrink-0 flex-col overflow-hidden rounded-[var(--featured-slide-card-radius)] border border-[var(--color-border)] bg-white shadow-md transition-transform duration-300 hover:scale-105 sm:w-[var(--featured-card-width-desktop)]"
    >
      <FeaturedAlbumCover title={album.title} imageUrl={album.imageUrl} />
      <FeaturedAlbumInfo album={album} />
    </Link>
  );
}
