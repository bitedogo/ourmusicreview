"use client";
/** Previous 날짜별 커버 그리드 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { TodayAlbumScrollFrame } from "@/src/components/app/today-album/today-album-scroll-frame";
import {
  PREVIOUS_CELL_CLASS,
  PREVIOUS_DATE_CLASS,
  PREVIOUS_GRID_CLASS,
  TODAY_ALBUM_EMPTY_CLASS,
} from "@/src/components/app/today-album/today-album-styles";
import { AlbumCoverPlaceholder } from "@/src/components/common/album-cover-placeholder";
import { formatTodayAlbumCellDate } from "@/src/lib/today-album/dates";
import { PREVIOUS_GRID, PREVIOUS_SCROLLBAR } from "@/src/lib/today-album/layout";
import type { TodayAlbumArchiveItem } from "@/src/lib/today-album/types";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";

function PreviousAlbumCell({ item }: { item: TodayAlbumArchiveItem }) {
  const [imageError, setImageError] = useState(false);
  const dateLabel = formatTodayAlbumCellDate(item.displayDate);
  const label = `${dateLabel} ${item.artist} - ${item.title}`;
  const href = item.albumId ? buildAlbumReviewPath(item.albumId) : null;
  const showCover = Boolean(item.imageUrl) && !imageError;

  const body = (
    <>
      {showCover && item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={`${item.title} cover`}
          width={PREVIOUS_GRID.cell}
          height={PREVIOUS_GRID.cell}
          sizes="(max-width: 639px) 25vw, 120px"
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <AlbumCoverPlaceholder label={`${item.title} cover`} className="rounded-none" />
      )}
      <span className={PREVIOUS_DATE_CLASS}>{dateLabel}</span>
    </>
  );

  if (!href) {
    return (
      <div className={PREVIOUS_CELL_CLASS} title={label}>
        {body}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${PREVIOUS_CELL_CLASS} transition hover:opacity-90`}
      aria-label={`${label} 리뷰 페이지로 이동`}
    >
      {body}
    </Link>
  );
}

export function TodayAlbumPreviousGrid({
  items,
}: {
  items: TodayAlbumArchiveItem[];
}) {
  if (items.length === 0) {
    return (
      <p className={TODAY_ALBUM_EMPTY_CLASS}>지난 오늘의 앨범이 없습니다.</p>
    );
  }

  return (
    <TodayAlbumScrollFrame
      className="h-full"
      viewportClassName="h-full overflow-y-auto overflow-x-hidden overscroll-contain"
      trackClassName="right-[var(--today-album-previous-scrollbar-right)] z-10"
      trackHeightPx={PREVIOUS_SCROLLBAR.height}
      trackOffsetTopPx={PREVIOUS_SCROLLBAR.top}
      trackAlways
    >
      <div className={PREVIOUS_GRID_CLASS}>
        {items.map((item) => (
          <PreviousAlbumCell key={item.displayDate} item={item} />
        ))}
      </div>
    </TodayAlbumScrollFrame>
  );
}
