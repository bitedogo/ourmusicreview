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
        className="truncate text-lg font-bold text-zinc-900 sm:text-xl"
        title={`${album.artist} - ${album.title}`}
      >
        {album.artist} - {album.title}
      </h3>
      {description ? (
        <>
          <p
            className={`mt-4 max-h-[320px] overflow-y-auto whitespace-pre-line break-words text-sm leading-8 text-zinc-600 sm:text-[15px] ${
              isExpanded ? "block" : "hidden sm:block"
            }`}
          >
            {description}
          </p>
          <div className="mt-3 sm:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-sm font-medium text-[var(--color-accent)] transition hover:opacity-80"
            >
              {isExpanded ? "접기" : "더보기"}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-4 hidden text-sm text-zinc-400 sm:block">
          등록된 소개글이 없습니다.
        </p>
      )}
    </div>
  );
}
