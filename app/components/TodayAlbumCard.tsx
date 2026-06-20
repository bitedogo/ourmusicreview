"use client";

import Link from "next/link";
import { useState } from "react";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { TODAY_ALBUM_COVER_SIZE } from "@/src/lib/layout/constants";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";
import { useTodayAlbums } from "@/src/hooks/use-today-albums";
import type { TodayAlbumTab } from "@/src/lib/today-album/types";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";
import { TodayAlbumCover } from "./today-album/today-album-cover";
import { TodayAlbumDescription } from "./today-album/today-album-description";
import { TodayAlbumTabs } from "./today-album/today-album-tabs";

export default function TodayAlbumCard() {
  const { albums, isLoading, imageErrors, markImageError } = useTodayAlbums();
  const [activeTab, setActiveTab] = useState<TodayAlbumTab>("today");

  if (isLoading || !albums) {
    return null;
  }

  const hasAnyAlbum = TODAY_ALBUM_TABS.some((tab) => albums[tab.id] != null);
  if (!hasAnyAlbum) {
    return null;
  }

  const activeAlbum = albums[activeTab];
  const albumReviewHref = activeAlbum?.albumId
    ? buildAlbumReviewPath(activeAlbum.albumId)
    : null;

  const cover = (
    <TodayAlbumCover
      album={activeAlbum}
      hasImageError={imageErrors[activeTab]}
      onImageError={() => markImageError(activeTab)}
    />
  );

  return (
    <ContentContainer
      as="section"
      className="relative left-1/2 mt-10 w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 px-0"
    >
      <div className="w-full">
        <TodayAlbumTabs
          activeTab={activeTab}
          hasAlbum={(tab) => albums[tab] != null}
          onTabChange={setActiveTab}
        />

        <article className="rounded-b-2xl rounded-tr-2xl border border-zinc-200 bg-white px-5 py-6 shadow-sm sm:px-8 sm:py-8">
          {activeAlbum ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-10">
              <div
                className="w-full shrink-0 sm:shrink-0"
                style={{ width: "100%", maxWidth: TODAY_ALBUM_COVER_SIZE }}
              >
                {albumReviewHref ? (
                  <Link
                    href={albumReviewHref}
                    className="block"
                    aria-label={`${activeAlbum.artist} - ${activeAlbum.title} 리뷰 페이지로 이동`}
                  >
                    {cover}
                  </Link>
                ) : (
                  cover
                )}
              </div>

              <TodayAlbumDescription album={activeAlbum} resetKey={activeTab} />
            </div>
          ) : (
            <p className="py-12 text-center text-sm text-zinc-400">
              해당 날짜의 앨범이 없습니다.
            </p>
          )}
        </article>
      </div>
    </ContentContainer>
  );
}
