"use client";
/** 오늘의 앨범 소개글 스크롤 */

import type { ReactNode } from "react";
import { TodayAlbumScrollFrame } from "@/src/components/app/today-album/today-album-scroll-frame";

interface TodayAlbumDescriptionScrollProps {
  children: ReactNode;
  className?: string;
}

export function TodayAlbumDescriptionScroll({
  children,
  className = "",
}: TodayAlbumDescriptionScrollProps) {
  return (
    <TodayAlbumScrollFrame
      className={className}
      viewportClassName="max-h-[var(--today-album-description-max-height)] overflow-y-auto whitespace-pre-line break-words pr-[14px] text-left text-[11px] font-normal leading-[170%] tracking-[0.03em] text-[#C4C4C4] sm:text-[15px]"
    >
      {children}
    </TodayAlbumScrollFrame>
  );
}
