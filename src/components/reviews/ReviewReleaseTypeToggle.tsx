"use client";

/** 앨범 리뷰 목록 — 앨범/싱글 토글 */

import Link from "next/link";
import {
  ChartStylePillTrack,
  chartStylePillTabClass,
} from "@/src/components/common/chart-style-pill-toggle";
import type { AlbumReleaseType } from "@/src/lib/albums/release-type";

const RELEASE_TYPE_OPTIONS: { value: AlbumReleaseType; label: string }[] = [
  { value: "album", label: "앨범" },
  { value: "single", label: "싱글" },
];

interface ReviewReleaseTypeToggleProps {
  value: AlbumReleaseType;
  buildHref: (releaseType: AlbumReleaseType) => string;
}

export function ReviewReleaseTypeToggle({
  value,
  buildHref,
}: ReviewReleaseTypeToggleProps) {
  return (
    <ChartStylePillTrack role="group" aria-label="발매 유형" size="compact">
      {RELEASE_TYPE_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <Link
            key={option.value}
            href={buildHref(option.value)}
            aria-current={isActive ? "page" : undefined}
            className={chartStylePillTabClass(isActive, "compact")}
          >
            {option.label}
          </Link>
        );
      })}
    </ChartStylePillTrack>
  );
}
