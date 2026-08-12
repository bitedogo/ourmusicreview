"use client";
/** 홈 음원 차트 섹션 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { useMusicChart } from "@/src/hooks/use-chart";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import { CHART_REGIONS, type ChartRegion } from "@/src/lib/chart/types";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";

export default function MusicChart() {
  const [region, setRegion] = useState<ChartRegion>("kr");
  const { albums, isLoading } = useMusicChart(region);

  if (albums.length === 0 && isLoading) {
    return null;
  }

  return (
    <section className="mt-[var(--today-album-chart-gap)]">
      <h2 className="mb-[var(--chart-title-content-gap)] text-center text-[20px] font-semibold leading-[145%] tracking-[-0.005em] text-[var(--color-accent)]">
        Chart
      </h2>

      <div className="flex justify-center">
        <div className="chart-region-track inline-flex gap-1 rounded-full border border-[var(--color-border)] bg-white p-1">
          {CHART_REGIONS.map((entry) => {
            const isActive = entry.id === region;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setRegion(entry.id)}
                aria-pressed={isActive}
                className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                  isActive
                    ? "chart-region-tab-active bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                {entry.label}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="mt-[var(--featured-track-padding-y)] grid grid-cols-2 gap-x-[var(--featured-card-margin-x)] gap-y-[var(--today-album-layout-gap-mobile)] sm:grid-cols-5">
        {albums.map((album) => (
          <li key={album.collectionId} className="flex flex-col">
            <Link
              href={buildAlbumReviewPath(album.collectionId)}
              className="group flex flex-col"
              aria-label={`${album.rank}위 ${album.artist} - ${album.title} 리뷰 페이지로 이동`}
            >
              <div className="overflow-hidden rounded-[var(--featured-card-radius)] border border-[var(--color-border)] bg-zinc-100 shadow-md transition-transform duration-300 group-hover:scale-105">
                <div className="relative aspect-square w-full">
                  {album.imageUrl ? (
                    <Image
                      src={album.imageUrl}
                      alt={`${album.title} cover`}
                      fill
                      sizes="(max-width: 640px) 50vw, 20vw"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
                      {ALBUM_COVER_PLACEHOLDER}
                    </div>
                  )}
                  <span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-br-[var(--featured-card-radius)] bg-[var(--color-accent)] text-sm font-bold text-white">
                    {album.rank}
                  </span>
                </div>
              </div>

              <h3 className="mt-[var(--featured-card-title-artist-gap)] truncate text-left text-[length:var(--text-featured-title)] font-bold text-[var(--color-text-primary)]">
                {album.title}
              </h3>
            </Link>
            <ArtistNameLink
              name={album.artist}
              artistId={album.artistId}
              className="truncate text-left text-[length:var(--text-featured-artist)] text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-default disabled:no-underline"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
