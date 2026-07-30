"use client";
/** 오늘의 앨범 설명 문구 */

import { useState } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
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
    <div className="w-full min-w-0 flex-1 sm:self-start sm:pt-[var(--today-album-desc-offset-top)]">
      <div className="flex flex-col gap-[var(--featured-card-inner-gap)] sm:flex-row sm:items-center sm:gap-[var(--featured-card-gap)]">
        <div className="min-w-0 flex-1 text-left">
          <h3
            className="truncate text-[14px] font-bold leading-[145%] tracking-[0.03em] text-[#464646] sm:text-[24px]"
            title={album.title}
          >
            {album.title}
          </h3>
          <ArtistNameLink
            name={album.artist}
            className="mt-0.5 max-w-full truncate text-left text-[length:var(--text-today-album-artist)] font-bold tracking-[0.03em] text-[#939393] transition hover:text-[#43A7B2] hover:underline disabled:cursor-wait disabled:no-underline"
          />
        </div>
        <StreamingLinkButtons links={streamingLinks} className="shrink-0 justify-start" />
      </div>
      {description ? (
        <>
          <p
            className={`mt-6 max-h-[var(--today-album-description-max-height)] overflow-y-auto whitespace-pre-line break-words text-left text-[11px] font-normal leading-[170%] tracking-[0.03em] text-[#717171] sm:text-[15px] ${
              isExpanded ? "block" : "hidden sm:block"
            }`}
          >
            {description}
          </p>
          <div className="mt-[var(--featured-card-inner-gap)] flex justify-end sm:hidden">
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="text-[11px] font-medium text-[#43A7B2] transition hover:opacity-80"
            >
              {isExpanded ? "접기" : "더보기"}
            </button>
          </div>
        </>
      ) : (
        <p className="mt-6 hidden text-left text-[15px] text-[#939393] sm:block">
          등록된 소개글이 없습니다.
        </p>
      )}
    </div>
  );
}
