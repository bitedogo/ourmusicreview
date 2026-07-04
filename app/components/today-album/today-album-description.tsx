"use client";

import { useState } from "react";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
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

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setIsExpanded(false);
  }

  return (
    <div className="w-full min-w-0 flex-1 sm:self-start">
      <div className="flex flex-col gap-[var(--featured-card-inner-gap)] sm:flex-row sm:items-center sm:gap-[var(--featured-card-gap)]">
        <h3
          className="min-w-0 flex-1 truncate text-[length:var(--text-today-album-title)] font-bold leading-[var(--leading-today-album-title)] tracking-[var(--tracking-ui)] text-[var(--color-today-album-title)]"
          title={`${album.artist} - ${album.title}`}
        >
          {album.artist} - {album.title}
        </h3>
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
