"use client";

import { useEffect, useState } from "react";

interface TodayAlbumData {
  displayDate: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  description: string | null;
}

export default function TodayAlbumCard() {
  const [album, setAlbum] = useState<TodayAlbumData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayAlbum() {
      try {
        const response = await fetch("/api/today-album");
        const data = await response.json();
        if (data.ok && data.album) {
          setAlbum(data.album);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    fetchTodayAlbum();
  }, []);

  if (isLoading || !album) {
    return null;
  }

  return (
    <section className="mt-10">
      <article className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white shadow-lg">
        <div className="relative flex w-full flex-col gap-6 p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
          <div className="flex shrink-0 items-center justify-center">
            <div className="aspect-square h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-100 shadow-md sm:h-44 sm:w-44">
              {album.imageUrl ? (
                <img
                  src={album.imageUrl}
                  alt={`${album.title} cover`}
                  className="h-full w-full object-cover"
                />
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
            {album.description && album.description.trim() && (
              <div>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-600">
                  {album.description.trim()}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>
    </section>
  );
}
