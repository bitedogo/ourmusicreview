"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";

interface TodayAlbumData {
  displayDate: string;
  albumId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  description: string | null;
}

interface TodayAlbumResponse {
  ok: boolean;
  album: TodayAlbumData | null;
}

export default function TodayAlbumCard() {
  const [album, setAlbum] = useState<TodayAlbumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function fetchTodayAlbum() {
      try {
        const response = await fetch("/api/today-album");
        const data = (await response.json().catch(() => null)) as TodayAlbumResponse | null;
        if (!isCancelled && data?.ok && data.album) {
          setAlbum(data.album);
        }
      } catch {
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchTodayAlbum();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setIsImageError(false);
  }, [album?.imageUrl]);

  useEffect(() => {
    setIsDescriptionOpen(false);
  }, [album?.displayDate]);

  if (isLoading || !album) {
    return null;
  }

  const resolvedAlbum = album;
  const description = resolvedAlbum.description?.trim() ?? "";
  const albumReviewHref = resolvedAlbum.albumId
    ? `/review/album/${encodeURIComponent(resolvedAlbum.albumId)}`
    : null;

  const coverImageElement = (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-100 shadow-md">
      {resolvedAlbum.imageUrl && !isImageError ? (
        <Image
          src={resolvedAlbum.imageUrl}
          alt={`${resolvedAlbum.title} cover`}
          fill
          unoptimized
          sizes="(max-width: 640px) calc(100vw - 2rem), 336px"
          className="h-full w-full object-cover"
          onError={() => setIsImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
          No Image
        </div>
      )}
    </div>
  );

  function renderCoverWithOptionalLink(className: string) {
    const wrappedCover = <div className={className}>{coverImageElement}</div>;

    if (!albumReviewHref) {
      return wrappedCover;
    }

    return (
      <Link
        href={albumReviewHref}
        className="block"
        aria-label={`${resolvedAlbum.artist} - ${resolvedAlbum.title} 리뷰 페이지로 이동`}
      >
        {wrappedCover}
      </Link>
    );
  }

  const cardContent = (
    <article className="relative overflow-hidden">
      <div className="relative flex w-full flex-col gap-4 py-4 sm:gap-6">
        <div className="sm:hidden">
          <h2 className="text-[25px] font-bold tracking-tight leading-none text-zinc-900">오늘의 앨범</h2>
          <div className="mt-3 w-full">{renderCoverWithOptionalLink("w-full")}</div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-[16px] font-medium leading-none text-zinc-500">
              {resolvedAlbum.artist} - {resolvedAlbum.title}
            </p>
            {description && (
              <button
                type="button"
                onClick={() => setIsDescriptionOpen((previousValue) => !previousValue)}
                aria-expanded={isDescriptionOpen}
                className="shrink-0 text-sm font-semibold text-zinc-700 underline underline-offset-4"
              >
                본문 보기
              </button>
            )}
          </div>
        </div>

        <div className="hidden w-full items-start gap-4 sm:flex sm:items-center sm:gap-8">
          <div className="flex shrink-0 items-center justify-center">
            {renderCoverWithOptionalLink("h-[21rem] w-[21rem] shrink-0")}
          </div>

          <div className="relative min-w-0 flex-1 sm:h-80">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:absolute sm:left-0 sm:right-0 sm:top-[30px]">
              <h2 className="text-[25px] font-bold tracking-tight leading-none text-zinc-900">
                오늘의 앨범
              </h2>
              <p className="text-[16px] font-medium leading-none text-zinc-500">
                {resolvedAlbum.artist} - {resolvedAlbum.title}
              </p>
            </div>

            {description && (
              <p className="mt-4 w-full whitespace-pre-line text-[14px] leading-relaxed text-zinc-600 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:top-[64px] sm:overflow-y-auto sm:pr-1 sm:text-[14px] sm:leading-8">
                {description}
              </p>
            )}

          </div>
        </div>

        {description && (
          <div
            className={`sm:hidden overflow-hidden transition-all duration-300 ${
              isDescriptionOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-zinc-600">
              {description}
            </p>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <section className="relative left-1/2 mt-10 w-[1300px] max-w-[calc(100vw-2rem)] -translate-x-1/2">
      {cardContent}
    </section>
  );
}
