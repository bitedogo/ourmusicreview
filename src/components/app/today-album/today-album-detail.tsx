"use client";
/** 오늘의 앨범 Today / Yesterday 본문 */

import Link from "next/link";
import { TodayAlbumCover } from "@/src/components/app/today-album/today-album-cover";
import { TodayAlbumDescription } from "@/src/components/app/today-album/today-album-description";
import { TODAY_ALBUM_DETAIL_ROW } from "@/src/components/app/today-album/today-album-styles";
import type { TodayAlbumData } from "@/src/lib/today-album/types";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";

interface TodayAlbumDetailProps {
  album: TodayAlbumData;
  hasImageError: boolean;
  onImageError: () => void;
}

export function TodayAlbumDetail({
  album,
  hasImageError,
  onImageError,
}: TodayAlbumDetailProps) {
  const albumReviewHref = album.albumId
    ? buildAlbumReviewPath(album.albumId)
    : null;

  const cover = (
    <TodayAlbumCover
      album={album}
      hasImageError={hasImageError}
      onImageError={onImageError}
    />
  );

  return (
    <div className={TODAY_ALBUM_DETAIL_ROW}>
      <div className="w-full max-w-[var(--today-album-cover-size)] shrink-0">
        {albumReviewHref ? (
          <Link
            href={albumReviewHref}
            className="block"
            aria-label={`${album.artist} - ${album.title} 리뷰 페이지로 이동`}
          >
            {cover}
          </Link>
        ) : (
          cover
        )}
      </div>
      <TodayAlbumDescription album={album} />
    </div>
  );
}
