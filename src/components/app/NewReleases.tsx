"use client";
/** 홈 주간 신보 섹션 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type TransitionEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import type { NewReleaseAlbum, NewReleasesHomeData } from "@/src/lib/new-releases/types";
import { formatMonthDayFromIso, isKstToday } from "@/src/lib/new-releases/weeks";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";
import { buildAlbumReviewPath } from "@/src/lib/utils/album";

const AUTO_ADVANCE_MS = 3000;
const SLIDE_TRANSITION_MS = 800;
const DESKTOP_VISIBLE = 5;
const MOBILE_VISIBLE = 3;

function useVisibleCount() {
  const [count, setCount] = useState(DESKTOP_VISIBLE);

  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setCount(media.matches ? DESKTOP_VISIBLE : MOBILE_VISIBLE);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return count;
}

function NewReleaseCover({
  album,
  releaseLabel,
  isToday,
}: {
  album: NewReleaseAlbum;
  releaseLabel: string;
  isToday: boolean;
}) {
  return (
    <>
      <div className="overflow-hidden rounded-[var(--featured-card-radius)] border border-[var(--color-border)] bg-zinc-100 shadow-md transition-transform duration-300 group-hover:scale-105">
        <div className="relative aspect-square w-full">
          {album.imageUrl ? (
            album.source === "manual" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={album.imageUrl}
                alt={`${album.title} cover`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <Image
                src={album.imageUrl}
                alt={`${album.title} cover`}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="h-full w-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Image
                src={LOGO_SRC}
                alt={LOGO_ALT}
                fill
                sizes="(max-width: 640px) 33vw, 20vw"
                className="object-contain p-[18%]"
              />
            </div>
          )}
          <span
            className={`absolute left-0 top-0 flex h-6 min-w-6 items-center justify-center rounded-br-[var(--featured-card-radius)] px-1 text-[10px] font-bold sm:h-7 sm:min-w-7 sm:px-1.5 sm:text-xs ${
              isToday
                ? "bg-[var(--color-new-release-today)] text-[var(--color-new-release-today-text)]"
                : "bg-[var(--color-accent)] tabular-nums text-white"
            }`}
          >
            {releaseLabel}
          </span>
        </div>
      </div>
      <h3 className="mt-[var(--featured-card-title-artist-gap)] truncate text-left text-[length:var(--text-featured-title)] font-bold text-[var(--color-text-primary)]">
        {album.title}
      </h3>
    </>
  );
}

function NewReleaseCard({ album }: { album: NewReleaseAlbum }) {
  const isToday = isKstToday(album.releaseDate);
  const releaseLabel = isToday ? "Today" : formatMonthDayFromIso(album.releaseDate);
  const isManual = album.source === "manual";

  return (
    <div className="flex min-w-0 flex-col">
      {isManual ? (
        <div className="group flex flex-col">
          <NewReleaseCover album={album} releaseLabel={releaseLabel} isToday={isToday} />
        </div>
      ) : (
        <Link
          href={buildAlbumReviewPath(album.collectionId)}
          className="group flex flex-col"
          aria-label={`${album.artist} - ${album.title} ${isToday ? "오늘 발매" : `발매일 ${releaseLabel}`} 리뷰 페이지로 이동`}
        >
          <NewReleaseCover album={album} releaseLabel={releaseLabel} isToday={isToday} />
        </Link>
      )}
      {isManual ? (
        <p className="truncate text-left text-[length:var(--text-featured-artist)] text-[var(--color-text-secondary)]">
          {album.artist}
        </p>
      ) : (
        <ArtistNameLink
          name={album.artist}
          artistId={album.artistId}
          className="truncate text-left text-[length:var(--text-featured-artist)] text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-default disabled:no-underline"
        />
      )}
    </div>
  );
}

export default function NewReleases({
  initialData,
}: {
  initialData: NewReleasesHomeData;
}) {
  const albums = initialData.albums;
  const visibleCount = useVisibleCount();
  const canLoop = albums.length > visibleCount;
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(false);
  const [offset, setOffset] = useState(() =>
    albums.length > DESKTOP_VISIBLE ? DESKTOP_VISIBLE : 0
  );
  const [coverCenterPx, setCoverCenterPx] = useState(0);
  const [transitionOn, setTransitionOn] = useState(false);
  const arrowOutsetPx = visibleCount === DESKTOP_VISIBLE ? -56 : 0;

  const slides = useMemo(() => {
    if (!canLoop) {
      return albums.map((album) => ({ album, key: album.id }));
    }
    const head = albums.slice(-visibleCount);
    const tail = albums.slice(0, visibleCount);
    return [
      ...head.map((album, index) => ({ album, key: `head-${album.id}-${index}` })),
      ...albums.map((album) => ({ album, key: album.id })),
      ...tail.map((album, index) => ({ album, key: `tail-${album.id}-${index}` })),
    ];
  }, [albums, canLoop, visibleCount]);

  useLayoutEffect(() => {
    setTransitionOn(false);
    setOffset(canLoop ? visibleCount : 0);
  }, [canLoop, visibleCount, albums.length]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = () => {
      const cover = track.querySelector(".aspect-square");
      const root = viewport.parentElement;
      if (cover instanceof HTMLElement && root) {
        const rootRect = root.getBoundingClientRect();
        const coverRect = cover.getBoundingClientRect();
        setCoverCenterPx(coverRect.top - rootRect.top + coverRect.height / 2);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [slides.length, visibleCount]);

  const go = useCallback(
    (delta: number) => {
      if (!canLoop) return;
      setTransitionOn(true);
      setOffset((current) => current + delta);
    },
    [canLoop]
  );

  useEffect(() => {
    if (!canLoop) return;

    const timer = window.setInterval(() => {
      if (pausedRef.current) return;
      go(1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [canLoop, go, offset]);

  function handleTransitionEnd(event: TransitionEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget || !canLoop) return;

    if (offset >= visibleCount + albums.length) {
      setTransitionOn(false);
      setOffset(visibleCount);
    } else if (offset <= 0) {
      setTransitionOn(false);
      setOffset(albums.length);
    }
  }

  if (albums.length === 0) return null;

  return (
    <section
      className="mt-[var(--today-album-chart-gap)]"
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onFocusCapture={() => {
        pausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          pausedRef.current = false;
        }
      }}
    >
      <div className="relative mb-[var(--chart-title-content-gap)] text-center">
        <h2 className="text-[20px] font-semibold leading-[145%] tracking-[-0.005em] text-[var(--color-accent)]">
          Upcoming Album Releases
        </h2>
        <p className="absolute inset-x-0 top-full mt-1 text-[10px] font-normal leading-[145%] tracking-[-0.005em] text-[var(--color-text-muted)] sm:text-[11px]">
          Recommended by ORUMUSICWEB
        </p>
      </div>

      <div className="relative px-8 sm:px-0">
        {canLoop ? (
          <button
            type="button"
            aria-label="이전 신보"
            onClick={() => go(-1)}
            className="absolute z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--color-text-primary)] transition hover:opacity-70 sm:h-10 sm:w-10"
            style={{ top: coverCenterPx || "30%", left: arrowOutsetPx }}
          >
            <Image
              src="/double-left-sign.svg"
              alt=""
              width={28}
              height={28}
              className="h-5 w-5 object-contain sm:h-7 sm:w-7"
              aria-hidden
              unoptimized
            />
          </button>
        ) : null}

        <div ref={viewportRef} className="@container overflow-hidden">
          <ul
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            className="grid w-max grid-flow-col auto-cols-[calc((100cqi-2*var(--featured-card-margin-x))/3)] gap-x-[var(--featured-card-margin-x)] py-[var(--masterpiece-slider-pad-y)] sm:auto-cols-[calc((100cqi-4*var(--featured-card-margin-x))/5)]"
            style={{
              transform: `translate3d(calc(${-offset} * (100cqi + var(--featured-card-margin-x)) / ${visibleCount}), 0, 0)`,
              transition: transitionOn
                ? `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            }}
          >
            {slides.map(({ album, key }) => (
              <li key={key}>
                <NewReleaseCard album={album} />
              </li>
            ))}
          </ul>
        </div>

        {canLoop ? (
          <button
            type="button"
            aria-label="다음 신보"
            onClick={() => go(1)}
            className="absolute z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-[var(--color-text-primary)] transition hover:opacity-70 sm:h-10 sm:w-10"
            style={{ top: coverCenterPx || "30%", right: arrowOutsetPx }}
          >
            <Image
              src="/double-right-sign.svg"
              alt=""
              width={28}
              height={28}
              className="h-5 w-5 object-contain sm:h-7 sm:w-7"
              aria-hidden
              unoptimized
            />
          </button>
        ) : null}
      </div>
    </section>
  );
}
