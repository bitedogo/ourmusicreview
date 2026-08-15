"use client";
/** Previous 날짜별 커버 그리드 */

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { TodayAlbumScrollFrame } from "@/src/components/app/today-album/today-album-scroll-frame";
import {
  PREVIOUS_CELL_CLASS,
  PREVIOUS_GRID_CLASS,
} from "@/src/components/app/today-album/today-album-styles";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import {
  formatTodayAlbumCellDate,
  PREVIOUS_SCROLLBAR,
} from "@/src/lib/today-album/dates";
import type { TodayAlbumArchiveItem } from "@/src/lib/today-album/types";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";

function CellShell({
  href,
  label,
  children,
}: {
  href: string | null;
  label: string;
  children: ReactNode;
}) {
  if (!href) {
    return (
      <div className={PREVIOUS_CELL_CLASS} title={label}>
        {children}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={`${PREVIOUS_CELL_CLASS} transition hover:opacity-90`}
      aria-label={`${label} 리뷰 페이지로 이동`}
    >
      {children}
    </Link>
  );
}

function PreviousAlbumCell({ item }: { item: TodayAlbumArchiveItem }) {
  const [imageError, setImageError] = useState(false);
  const dateLabel = formatTodayAlbumCellDate(item.displayDate);
  const label = `${dateLabel} ${item.artist} - ${item.title}`;
  const imageUrl = item.imageUrl;
  const showCover = Boolean(imageUrl) && !imageError;

  return (
    <CellShell
      href={item.albumId ? buildAlbumReviewPath(item.albumId) : null}
      label={label}
    >
      {showCover && imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${item.title} cover`}
          fill
          sizes="120px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : imageUrl ? (
        <span className="flex h-full w-full items-center justify-center text-[length:var(--text-featured-meta)] font-medium text-[var(--color-text-muted)]">
          {ALBUM_COVER_PLACEHOLDER}
        </span>
      ) : null}
      <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-1 text-center text-[14px] font-normal leading-[29px] text-[#FEFEFE] [text-shadow:0_1px_2px_rgba(0,0,0,0.65)] sm:text-[24px]">
        {dateLabel}
      </span>
    </CellShell>
  );
}

export function TodayAlbumPreviousGrid({
  items,
}: {
  items: TodayAlbumArchiveItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="px-[var(--today-album-previous-padding-left)] py-[var(--today-album-section-margin-top)] text-center text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)]">
        지난 오늘의 앨범이 없습니다.
      </p>
    );
  }

  return (
    <TodayAlbumScrollFrame
      className="h-full"
      viewportClassName="h-full overflow-y-auto overscroll-contain"
      trackClassName="right-[22px]"
      trackHeightPx={PREVIOUS_SCROLLBAR.height}
      trackOffsetTopPx={PREVIOUS_SCROLLBAR.top}
    >
      <div className={PREVIOUS_GRID_CLASS}>
        {items.map((item) => (
          <PreviousAlbumCell key={item.displayDate} item={item} />
        ))}
      </div>
    </TodayAlbumScrollFrame>
  );
}
