"use client";
/** 오늘의 앨범 카드 */

import Link from "next/link";
import { useState } from "react";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";
import { useTodayAlbums } from "@/src/hooks/use-today-albums";
import type { TodayAlbumTab } from "@/src/lib/today-album/types";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";
import { TodayAlbumCover } from "./today-album/today-album-cover";
import { TodayAlbumDescription } from "./today-album/today-album-description";
import { TodayAlbumPreviousGrid } from "./today-album/today-album-previous-grid";
import {
  TODAY_ALBUM_ARTICLE_BASE,
  TODAY_ALBUM_ARTICLE_DETAIL,
  TODAY_ALBUM_ARTICLE_PREVIOUS,
} from "./today-album/today-album-styles";
import { TodayAlbumTabs } from "./today-album/today-album-tabs";

export default function TodayAlbumCard() {
  const { albums, archive, isLoading, imageErrors, markImageError } =
    useTodayAlbums();
  const [activeTab, setActiveTab] = useState<TodayAlbumTab>("today");

  if (isLoading || !albums) return null;

  const hasArchive = archive.length > 0;
  const hasAnyAlbum =
    TODAY_ALBUM_TABS.some((tab) => albums[tab.id] != null) || hasArchive;
  if (!hasAnyAlbum) return null;

  const activeAlbum = albums[activeTab];
  const albumReviewHref = activeAlbum?.albumId
    ? buildAlbumReviewPath(activeAlbum.albumId)
    : null;
  const isPrevious = activeTab === "previous";

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
      className="relative left-1/2 mt-[calc(var(--featured-slider-today-album-gap)-var(--masterpiece-slider-pad-y))] w-full max-w-[calc(100vw-2rem)] -translate-x-1/2 px-0"
    >
      <div className="w-full">
        <h2 className="mb-[var(--today-album-title-content-gap)] flex items-center justify-center text-center text-[20px] font-semibold leading-[145%] tracking-[-0.005em] text-[#43A7B2]">
          Today&apos;s Album
        </h2>
        <TodayAlbumTabs
          activeTab={activeTab}
          hasAlbum={(tab) =>
            tab === "previous" ? hasArchive : albums[tab] != null
          }
          onTabChange={setActiveTab}
        />

        <article
          className={`${TODAY_ALBUM_ARTICLE_BASE} ${
            isPrevious
              ? TODAY_ALBUM_ARTICLE_PREVIOUS
              : TODAY_ALBUM_ARTICLE_DETAIL
          }`}
        >
          {isPrevious ? (
            <TodayAlbumPreviousGrid items={archive} />
          ) : activeAlbum ? (
            <div className="flex flex-col items-center gap-[var(--today-album-layout-gap-mobile)] sm:h-full sm:flex-row sm:items-center sm:gap-[var(--today-album-layout-gap-desktop)]">
              <div
                className="w-full shrink-0"
                style={{
                  width: "100%",
                  maxWidth: "var(--today-album-cover-size)",
                }}
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
            <p className="py-[var(--today-album-section-margin-top)] text-center text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)]">
              해당 날짜의 앨범이 없습니다.
            </p>
          )}
        </article>
      </div>
    </ContentContainer>
  );
}
