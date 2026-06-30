"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMusicChart } from "@/src/hooks/use-chart";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import { CHART_REGIONS, type ChartRegion } from "@/src/lib/chart/types";

export default function MusicChart() {
  const [region, setRegion] = useState<ChartRegion>("kr");
  const { albums, isLoading } = useMusicChart(region);

  if (albums.length === 0 && isLoading) {
    return null;
  }

  return (
    <section className="mt-[var(--today-album-section-margin-top)]">
      <h2 className="text-center text-xl font-medium text-[var(--color-accent)]">
        Chart
      </h2>
      <p className="mt-1 text-center text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
        Apple Music 인기 앨범
      </p>

      <div className="mt-3 flex justify-center">
        <div className="inline-flex gap-1 rounded-full border border-[var(--color-border)] bg-zinc-50 p-1">
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
                    ? "bg-[var(--color-accent)] text-white shadow-sm"
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
          <li key={album.collectionId}>
            <Link
              href={buildAlbumReviewPath(album.collectionId)}
              className="group flex flex-col"
              aria-label={`${album.rank}위 ${album.artist} - ${album.title} 리뷰 페이지로 이동`}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-[var(--featured-card-radius)] border border-[var(--color-border)] bg-zinc-100 shadow-md transition-transform duration-300 group-hover:scale-105">
                {album.imageUrl ? (
                  <Image
                    src={album.imageUrl}
                    alt={`${album.title} cover`}
                    fill
                    unoptimized
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

              <h3 className="mt-[var(--featured-card-title-artist-gap)] truncate text-left text-[length:var(--text-featured-title)] font-bold text-[var(--color-text-primary)]">
                {album.title}
              </h3>
              <p className="truncate text-left text-[length:var(--text-featured-artist)] text-[var(--color-text-secondary)]">
                {album.artist}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
