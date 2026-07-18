"use client";
/** 오늘의 앨범 설명 문구 */

import { useState } from "react";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { useArtistSearchNavigation } from "@/src/hooks/use-artist-search-navigation";
import { useStreamingLinks } from "@/src/hooks/use-streaming-links";
import type { TodayAlbumData } from "@/src/lib/today-album/types";

interface TodayAlbumDescriptionProps {
  album: TodayAlbumData;
  resetKey: string;
}

export function TodayAlbumDescription({ album, resetKey }: TodayAlbumDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const description = album.description?.trim() ?? "";
  const streamingLinks = useStreamingLinks(album.albumId);
  const { isNavigating, navigateToArtistAlbums } = useArtistSearchNavigation();

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setIsExpanded(false);
  }

  return (
    <div className="w-full min-w-0 flex-1 sm:self-start sm:pt-[var(--today-album-desc-offset-top)]">
      <div className="flex flex-col gap-[var(--featured-card-inner-gap)] sm:flex-row sm:items-center sm:gap-[var(--featured-card-gap)]">
        <div className="min-w-0 flex-1">
          <h3
            className="truncate text-[length:var(--text-today-album-title)] font-bold leading-[var(--leading-today-album-title)] tracking-[var(--tracking-ui)] text-[var(--color-text-primary)]"
            title={album.title}
          >
            {album.title}
          </h3>
          <button
            type="button"
            onClick={() => void navigateToArtistAlbums(album.artist)}
            disabled={isNavigating || !album.artist.trim()}
            className="mt-0.5 max-w-full truncate text-left text-[length:var(--text-today-album-artist)] font-bold tracking-[var(--tracking-ui)] text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
            title={album.artist}
          >
            {album.artist}
          </button>
        </div>
        <StreamingLinkButtons links={streamingLinks} className="shrink-0" />
      </div>
      {description ? (
        <>
          <p
            className={`mt-6 max-h-[var(--today-album-description-max-height)] overflow-y-auto whitespace-pre-line break-words text-[length:var(--text-today-album-body-desktop)] font-normal leading-[var(--leading-today-album-body)] tracking-[var(--tracking-ui)] text-[var(--color-today-album-body)] ${
              isExpanded ? "block" : "hidden sm:block"
            }`}
          >
            {description}
          </p>
          <div className="mt-[var(--featured-card-inner-gap)] flex justify-end sm:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-[length:var(--text-today-album-body-mobile)] font-medium text-[var(--color-accent)] transition hover:opacity-80"
            >
              {isExpanded ? "접기" : "더보기"}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-6 hidden text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)] sm:block">
          등록된 소개글이 없습니다.
        </p>
      )}
    </div>
  );
}
