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

export default function TodayAlbumCard() {
  const [album, setAlbum] = useState<TodayAlbumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageError, setIsImageError] = useState(false);

  useEffect(() => {
    async function fetchTodayAlbum() {
      try {
        const response = await fetch("/api/today-album");
        const data = await response.json().catch(() => null);
        if (data?.ok && data?.album) {
          setAlbum(data.album);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodayAlbum();
  }, []);

  useEffect(() => {
    setIsImageError(false);
  }, [album?.imageUrl]);

  if (isLoading || !album) {
    return null;
  }

  const cardContent = (
    <article className="relative overflow-hidden">
      <div className="relative flex w-full flex-col gap-4 py-4 sm:gap-6">
        <div className="flex w-full flex-row items-center gap-4 sm:gap-6">
          <div className="flex shrink-0 items-center justify-center">
            <div className="relative aspect-square h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md sm:h-44 sm:w-44">
              {album.imageUrl && !isImageError ? (
                <>
                  <Image
                    src={album.imageUrl}
                    alt={`${album.title} cover`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 112px, 176px"
                    className="h-full w-full object-cover"
                    onError={() => setIsImageError(true)}
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                  No Image
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-700">
              오늘의 앨범
            </h2>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                {album.artist}
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                {album.title}
              </h3>
            </div>
          </div>
        </div>

        {album.description && album.description.trim() && (
          <div className="w-full">
            <p className="w-full text-sm leading-relaxed text-zinc-600">
              {album.description.trim()}
            </p>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <section className="mx-auto mt-10 w-[956px] max-w-full">
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
