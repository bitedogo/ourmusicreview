"use client";
/** 추천 플레이리스트 — Cover Flow 캐러셀 */

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";
import type { PublicPlaylistListItemDto } from "@/src/components/playlist/playlist-api";
import { playlistDetail } from "@/src/lib/navigation/routes";

const AUTO_ADVANCE_MS = 3000;
const SLIDE_TRANSITION_MS = 800;
const FLOW_WIDTH_PX = 780;

function wrapIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

function relativeOffset(
  itemIndex: number,
  activeIndex: number,
  length: number
): number {
  let diff = itemIndex - activeIndex;
  if (length <= 1) return 0;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

function coverFlowStyle(offset: number): CSSProperties {
  const abs = Math.abs(offset);
  const sign = Math.sign(offset);
  const rotateY = offset === 0 ? 0 : sign * -38;
  const translateX = offset * 68;
  const translateZ = offset === 0 ? 72 : 24 - abs * 42;
  const scale =
    offset === 0 ? 1.14 : abs === 1 ? 0.84 : Math.max(0.66, 0.92 - abs * 0.14);

  return {
    transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
    zIndex: 20 - abs,
    opacity: abs > 2 ? 0 : 1,
    pointerEvents: abs > 2 ? "none" : "auto",
  };
}

interface PlaylistCoverFlowProps {
  playlists: PublicPlaylistListItemDto[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}

export function PlaylistCoverFlow({
  playlists,
  activeIndex,
  onActiveIndexChange,
}: PlaylistCoverFlowProps) {
  const safeIndex = wrapIndex(activeIndex, playlists.length);
  const active = playlists[safeIndex] ?? null;
  const isPausedRef = useRef(false);

  const maxSideOffset = playlists.length <= 4 ? 1 : 2;

  const slides = useMemo(() => {
    return playlists
      .map((playlist, index) => ({
        playlist,
        index,
        offset: relativeOffset(index, safeIndex, playlists.length),
      }))
      .filter(({ offset }) => Math.abs(offset) <= maxSideOffset);
  }, [maxSideOffset, playlists, safeIndex]);

  const go = useCallback(
    (delta: number) => {
      if (playlists.length <= 1) return;
      onActiveIndexChange(wrapIndex(safeIndex + delta, playlists.length));
    },
    [onActiveIndexChange, playlists.length, safeIndex]
  );

  useEffect(() => {
    if (playlists.length <= 1) return;

    const timer = window.setInterval(() => {
      if (isPausedRef.current) return;
      onActiveIndexChange(wrapIndex(safeIndex + 1, playlists.length));
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [onActiveIndexChange, playlists.length, safeIndex]);

  useEffect(() => {
    if (playlists.length <= 1) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") go(-1);
      if (event.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, playlists.length]);

  if (!active) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[28px] px-6 text-sm text-[var(--color-text-secondary)] sm:min-h-[260px]">
        아직 추천할 공개 플레이리스트가 없습니다.
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => {
        isPausedRef.current = true;
      }}
      onMouseLeave={() => {
        isPausedRef.current = false;
      }}
      onFocusCapture={() => {
        isPausedRef.current = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          isPausedRef.current = false;
        }
      }}
    >
      <div className="px-1 pb-1 pt-1 sm:px-2">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Recommended Playlist
        </p>

        <div
          className="relative mx-auto mt-4 h-[220px] w-full sm:h-[252px]"
          style={{
            maxWidth: FLOW_WIDTH_PX,
            perspective: "1200px",
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {slides.map(({ offset, index, playlist }) => {
              const isCenter = offset === 0;
              const style = coverFlowStyle(offset);
              const cover = (
                <div className="relative aspect-square h-full overflow-hidden rounded-[24px] bg-zinc-200 ring-1 ring-black/5 shadow-[0_14px_32px_rgba(0,0,0,0.2)] sm:rounded-[28px]">
                  {playlist.coverImageUrl ? (
                    <Image
                      src={playlist.coverImageUrl}
                      alt={playlist.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="280px"
                      priority={isCenter}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-[var(--color-text-muted)]">
                      No Cover
                    </div>
                  )}
                </div>
              );

              return (
                <div
                  key={playlist.id}
                  className="absolute h-[168px] sm:h-[196px]"
                  style={{
                    ...style,
                    transformStyle: "preserve-3d",
                    transition: `transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1), opacity ${SLIDE_TRANSITION_MS}ms ease, z-index 0ms linear ${SLIDE_TRANSITION_MS}ms`,
                  }}
                >
                  {isCenter ? (
                    <Link
                      href={playlistDetail(playlist.id)}
                      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-primary)]"
                      aria-label={`${playlist.title} 상세 보기`}
                    >
                      {cover}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onActiveIndexChange(index)}
                      className="block h-full cursor-pointer border-0 bg-transparent p-0"
                      aria-label={`${playlist.title} 선택`}
                    >
                      {cover}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {playlists.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="이전 추천"
                onClick={() => go(-1)}
                className="absolute left-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[var(--color-text-primary)] transition hover:opacity-70 sm:left-1"
              >
                <Image
                  src="/icons/chevron-left.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  aria-hidden
                />
              </button>
              <button
                type="button"
                aria-label="다음 추천"
                onClick={() => go(1)}
                className="absolute right-0 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-[var(--color-text-primary)] transition hover:opacity-70 sm:right-1"
              >
                <Image
                  src="/icons/chevron-right.png"
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                  aria-hidden
                />
              </button>
            </>
          ) : null}
        </div>

        <div
          key={active.id}
          className="mx-auto mt-4 max-w-[360px] text-center transition-opacity duration-500 ease-out animate-in fade-in"
        >
          <Link
            href={playlistDetail(active.id)}
            className="block truncate text-[16px] font-semibold tracking-tight text-[var(--color-text-primary)] transition hover:text-[var(--color-text-primary)] sm:text-[18px]"
          >
            {active.title}
          </Link>
          <p className="mt-1 truncate text-[12px] text-[var(--color-text-secondary)]">
            {active.ownerNickname}
            <span className="mx-1.5 text-[var(--color-text-muted)]">·</span>
            {active.trackCount}곡
            {(active.genres?.length ?? 0) > 0 ? (
              <>
                <span className="mx-1.5 text-[var(--color-text-muted)]">·</span>
                {active.genres!
                  .slice(0, 2)
                  .map((g) => g.nameKo)
                  .join(", ")}
              </>
            ) : null}
          </p>
          <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
            좋아요 {active.likeCount ?? 0}
            <span className="mx-1.5 text-[var(--color-text-muted)]">·</span>
            댓글 {active.commentCount ?? 0}
          </p>
        </div>

        {playlists.length > 1 ? (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {playlists.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`추천 ${index + 1}`}
                onClick={() => onActiveIndexChange(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  index === safeIndex
                    ? "w-5 bg-zinc-800"
                    : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
