/** 플레이리스트 목록 카드 — compact 240×100 / wide 400×100 */

import Link from "next/link";
import type { ReactNode } from "react";
import { PlaylistEngagementCounts } from "@/src/components/playlist/playlist-engagement-counts";
import { PlaylistVinylCover } from "@/src/components/playlist/playlist-vinyl-cover";

export const PLAYLIST_LIST_CARD_WIDTH = {
  compact: 240,
  wide: 400,
} as const;

export const PLAYLIST_LIST_CARD_HEIGHT = 100;

export type PlaylistListCardSize = keyof typeof PLAYLIST_LIST_CARD_WIDTH;

export interface PlaylistListCardItem {
  id: string;
  title: string;
  coverImageUrl: string | null;
  trackCount: number;
  likeCount?: number;
  commentCount?: number;
  ownerNickname?: string;
  genres?: Array<{ nameKo: string }>;
}

interface PlaylistListCardProps {
  item: PlaylistListCardItem;
  href: string;
  showOwner?: boolean;
  showGenres?: boolean;
  /** compact: 공개 목록 2열 / wide: 내 플레이리스트 */
  size?: PlaylistListCardSize;
  className?: string;
}

const CARD_CLASS: Record<PlaylistListCardSize, string> = {
  compact:
    "h-[100px] w-[240px] gap-2.5 px-2.5",
  wide: "h-[100px] w-[400px] gap-3 px-3",
};

export function PlaylistListCard({
  item,
  href,
  showOwner = true,
  showGenres = true,
  size = "compact",
  className = "",
}: PlaylistListCardProps) {
  const isWide = size === "wide";

  return (
    <Link
      href={href}
      className={`flex items-center overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition hover:border-zinc-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] ${CARD_CLASS[size]} ${className}`}
    >
      <PlaylistVinylCover
        coverImageUrl={item.coverImageUrl}
        alt={item.title}
        size={isWide ? "list" : "compact"}
        interactive
      />

      <div
        className={`flex min-w-0 flex-1 flex-col justify-between py-0 ${
          isWide ? "h-[78px]" : "h-[75px]"
        }`}
      >
        <div className="min-w-0">
          <div className="flex min-w-0 items-baseline gap-1">
            <h3
              className={`min-w-0 flex-1 truncate font-semibold leading-tight text-zinc-900 ${
                isWide ? "text-[13px]" : "text-[11px]"
              }`}
            >
              {item.title}
            </h3>
            <span
              className={`shrink-0 tabular-nums text-zinc-400 ${
                isWide ? "text-[11px]" : "text-[10px]"
              }`}
            >
              {item.trackCount}곡
            </span>
          </div>
          {showGenres && (item.genres?.length ?? 0) > 0 ? (
            <p
              className={`mt-0.5 truncate leading-tight text-zinc-400 ${
                isWide ? "text-[10px]" : "text-[9px]"
              }`}
            >
              {item.genres!.map((g) => g.nameKo).join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="flex min-w-0 items-center gap-1.5">
          <PlaylistEngagementCounts
            likeCount={item.likeCount ?? 0}
            commentCount={item.commentCount ?? 0}
            size={isWide ? "desktop" : "mobile"}
          />
          {showOwner && item.ownerNickname ? (
            <span
              className={`min-w-0 flex-1 truncate text-right text-zinc-400 ${
                isWide ? "text-[10px]" : "text-[9px]"
              }`}
            >
              {item.ownerNickname}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export function PlaylistListCardGrid({
  children,
  className = "",
  size = "compact",
}: {
  children: ReactNode;
  className?: string;
  size?: PlaylistListCardSize;
}) {
  const gridClass =
    size === "wide"
      ? "grid grid-cols-1 justify-items-stretch gap-y-3 sm:grid-cols-[repeat(auto-fill,400px)] sm:justify-start sm:gap-x-4 sm:gap-y-4"
      : "grid grid-cols-2 justify-items-center gap-x-3 gap-y-3 sm:grid-cols-[repeat(auto-fill,240px)] sm:justify-center";

  return <ul className={`${gridClass} ${className}`}>{children}</ul>;
}
