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

  if (isLoading || !album) {
    return null;
  }

  const description = album.description?.trim() ?? "";

  const cardContent = (
    <article className="relative overflow-hidden">
      <div className="relative flex w-full flex-col gap-4 py-4 sm:gap-6">
        <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative aspect-square h-56 w-56 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md sm:h-[21rem] sm:w-[21rem]">
              {album.imageUrl && !isImageError ? (
                <Image
                  src={album.imageUrl}
                  alt={`${album.title} cover`}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 224px, 336px"
                  className="h-full w-full object-cover"
                  onError={() => setIsImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="relative min-w-0 flex-1 sm:h-80">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:absolute sm:left-0 sm:right-0 sm:top-[30px]">
              <h2 className="text-[25px] font-bold tracking-tight leading-none text-zinc-900">
                오늘의 앨범
              </h2>
              <p className="text-[16px] font-medium leading-none text-zinc-500">
                {album.artist} - {album.title}
              </p>
            </div>

            {description && (
              <p className="mt-4 w-full whitespace-pre-line text-[14px] leading-relaxed text-zinc-600 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:top-[64px] sm:overflow-y-auto sm:pr-1 sm:text-[14px] sm:leading-8">
                {description}
              </p>
            )}

          </div>
        </div>
      </div>
    </article>
  );

  return (
    <section className="relative left-1/2 mt-10 w-[1300px] max-w-[calc(100vw-2rem)] -translate-x-1/2">
      {album.albumId ? (
        <Link href={`/review/album/${encodeURIComponent(album.albumId)}`} className="block">
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </section>
  );
}
