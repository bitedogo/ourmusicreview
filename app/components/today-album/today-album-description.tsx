"use client";

import { useEffect, useState } from "react";
import type { TodayAlbumData } from "@/src/lib/today-album/types";

interface TodayAlbumDescriptionProps {
  album: TodayAlbumData;
  resetKey: string;
}

export function TodayAlbumDescription({ album, resetKey }: TodayAlbumDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = album.description?.trim() ?? "";

  useEffect(() => {
    setIsExpanded(false);
  }, [resetKey]);

  return (
    <div className="w-full min-w-0 flex-1 sm:self-center">
      <h3
        className="truncate text-[length:var(--text-today-album-title)] font-bold leading-[var(--leading-today-album-title)] tracking-[var(--tracking-ui)] text-[var(--color-today-album-title)]"
        title={`${album.artist} - ${album.title}`}
      >
        {album.artist} - {album.title}
      </h3>
      {description ? (
        <>
          <p
            className={`mt-[var(--featured-card-gap)] max-h-[var(--today-album-description-max-height)] overflow-y-auto whitespace-pre-line break-words text-[length:var(--text-today-album-body-mobile)] font-normal leading-[var(--leading-today-album-body)] tracking-[var(--tracking-ui)] text-[var(--color-today-album-body)] sm:text-[length:var(--text-today-album-body-desktop)] ${
              isExpanded ? "block" : "hidden sm:block"
            }`}
          >
            {description}
          </p>
          <div className="mt-[var(--featured-card-inner-gap)] sm:hidden">
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
        <p className="mt-[var(--featured-card-gap)] hidden text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)] sm:block">
          등록된 소개글이 없습니다.
        </p>
      )}
    </div>
  );
}
