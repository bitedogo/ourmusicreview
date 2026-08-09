"use client";
/** 공개 플레이리스트 장르 원형 필터 */

import Image from "next/image";
import type { GenreTreeNode } from "@/src/lib/genres/types";
import {
  SPECIAL_GENRE_ALL,
  type GenreCircleItem,
} from "@/src/lib/genres/genre-covers";

const GENRE_CIRCLE_TONES = [
  "from-[#C45C2A] to-[#8B3A18]",
  "from-[#2F6B7A] to-[#1A4450]",
  "from-[#6B4C7A] to-[#3D2A4A]",
  "from-[#4A6B4A] to-[#2A402A]",
  "from-[#7A5A2F] to-[#4A3518]",
  "from-[#5A5A6B] to-[#2E2E3A]",
] as const;

function genreTone(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % GENRE_CIRCLE_TONES.length;
  }
  return GENRE_CIRCLE_TONES[hash] ?? GENRE_CIRCLE_TONES[0];
}

interface PlaylistGenreCirclesProps {
  circles: GenreCircleItem[];
  genreTree: GenreTreeNode[];
  genreFromUrl: string;
  onSelect: (genreId: string) => void;
}

export function PlaylistGenreCircles({
  circles,
  genreTree,
  genreFromUrl,
  onSelect,
}: PlaylistGenreCirclesProps) {
  const isAllActive = !genreFromUrl || genreFromUrl === SPECIAL_GENRE_ALL;

  return (
    <section className="mt-9 w-[min(1200px,calc(100vw-2rem))] self-center sm:w-[min(1200px,calc(100vw-3rem))]">
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-6 sm:gap-x-5 sm:gap-y-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-8">
        {circles.map((circle) => {
          const isActive =
            circle.id === SPECIAL_GENRE_ALL
              ? isAllActive
              : genreFromUrl === circle.id ||
                (circle.kind === "genre" &&
                  genreTree
                    .find((g) => g.id === circle.id)
                    ?.children.some((c) => c.id === genreFromUrl) === true);
          return (
            <button
              key={circle.id}
              type="button"
              onClick={() => onSelect(circle.id)}
              className="group flex w-[68px] shrink-0 flex-col items-center gap-2 sm:w-full sm:gap-3"
            >
              <span
                className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${genreTone(circle.id)} text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,0,0,0.12)] transition sm:text-xl ${
                  isActive
                    ? "ring-2 ring-[var(--color-brand-primary)] ring-offset-2 ring-offset-white sm:ring-offset-4"
                    : "group-hover:scale-[1.03]"
                }`}
              >
                {circle.imageUrl ? (
                  <Image
                    src={circle.imageUrl}
                    alt={circle.label}
                    fill
                    sizes="(max-width: 640px) 68px, 140px"
                    className="object-cover"
                  />
                ) : (
                  circle.label.slice(0, 1)
                )}
              </span>
              <span
                className={`w-full truncate text-center text-[10px] font-medium sm:text-[14px] ${
                  isActive
                    ? "text-[var(--color-text-primary)]"
                    : "text-[var(--color-text-secondary)]"
                }`}
              >
                {circle.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
