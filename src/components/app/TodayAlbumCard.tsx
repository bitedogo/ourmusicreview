"use client";
/** 오늘의 앨범 카드 */

import { useState } from "react";
import { useTodayAlbums } from "@/src/hooks/use-today-albums";
import type { TodayAlbumTab } from "@/src/lib/today-album/types";
import { TODAY_ALBUM_TABS } from "@/src/lib/today-album/types";
import { TodayAlbumDetail } from "./today-album/today-album-detail";
import { TodayAlbumPreviousGrid } from "./today-album/today-album-previous-grid";
import {
  TODAY_ALBUM_ARTICLE_BASE,
  TODAY_ALBUM_ARTICLE_DETAIL,
  TODAY_ALBUM_ARTICLE_PREVIOUS,
  TODAY_ALBUM_EMPTY_CLASS,
  TODAY_ALBUM_SHELL,
  TODAY_ALBUM_SHELL_INNER,
  TODAY_ALBUM_TITLE_CLASS,
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
  const isPrevious = activeTab === "previous";

  return (
    <section className={TODAY_ALBUM_SHELL}>
      <div className={TODAY_ALBUM_SHELL_INNER}>
        <h2 className={TODAY_ALBUM_TITLE_CLASS}>Today&apos;s Album</h2>
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
            <TodayAlbumDetail
              key={activeTab}
              album={activeAlbum}
              hasImageError={imageErrors[activeTab]}
              onImageError={() => markImageError(activeTab)}
            />
          ) : (
            <p className={TODAY_ALBUM_EMPTY_CLASS}>
              해당 날짜의 앨범이 없습니다.
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
