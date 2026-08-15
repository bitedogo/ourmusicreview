"use client";
/** 오늘의 앨범 소개글 */

import { useState } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { TodayAlbumDescriptionScroll } from "@/src/components/app/today-album/today-album-description-scroll";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { useStreamingLinks } from "@/src/hooks/use-streaming-links";
import type { TodayAlbumData } from "@/src/lib/today-album/types";

interface TodayAlbumDescriptionProps {
  album: TodayAlbumData;
}

export function TodayAlbumDescription({ album }: TodayAlbumDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const description = album.description?.trim() ?? "";
  const streamingLinks = useStreamingLinks(album.albumId);

  return (
    <div className="w-full min-w-0 flex-1 sm:self-start sm:pt-[var(--today-album-desc-offset-top)]">
      <div className="flex flex-col gap-[var(--featured-card-inner-gap)] sm:flex-row sm:items-center sm:gap-[var(--featured-card-gap)]">
        <div className="min-w-0 flex-1 text-left">
          <h3
            className="truncate text-[14px] font-bold leading-[145%] tracking-[0.03em] text-[#505050] sm:text-[24px]"
            title={album.title}
          >
            {album.title}
          </h3>
          <ArtistNameLink
            name={album.artist}
            className="mt-0.5 max-w-full truncate text-left text-[length:var(--text-today-album-artist)] font-bold tracking-[0.03em] text-[#949494] transition hover:text-[#43A7B2] hover:underline disabled:cursor-wait disabled:no-underline"
          />
        </div>
        <StreamingLinkButtons links={streamingLinks} className="shrink-0 justify-start" />
      </div>
      {description ? (
        <>
          <div
            className={`mt-6 ${isExpanded ? "block" : "hidden sm:block"}`}
          >
            <TodayAlbumDescriptionScroll>
              {description}
            </TodayAlbumDescriptionScroll>
          </div>
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
        <p className="mt-6 hidden text-left text-[15px] text-[#949494] sm:block">
          등록된 소개글이 없습니다.
        </p>
      )}
    </div>
  );
}
