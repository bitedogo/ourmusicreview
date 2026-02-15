"use client";

import { useEffect, useState } from "react";

interface FeaturedAlbum {
  collectionId: number;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}


export default function FeaturedAlbums() {
  const [albums, setAlbums] = useState<FeaturedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlbums() {
      try {
        const response = await fetch("/api/featured-albums");
        if (!response.ok) {
          throw new Error("Failed to fetch featured albums");
        }
        const data = await response.json();
        if (data.ok && data.albums) {
          setAlbums(data.albums);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlbums();
  }, []);

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">앨범을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (albums.length === 0) {
    return null;
  }

  const getReleaseYear = (releaseDate: string): string => {
    if (!releaseDate) return "";
    try {
      const date = new Date(releaseDate);
      return date.getFullYear().toString();
    } catch {
      return "";
    }
  };

  const duplicatedAlbums = [...albums, ...albums];

  return (
    <section className="mt-10">
        <div className="relative overflow-hidden -mx-6 sm:-mx-10">
        <div className="group flex flex-nowrap items-stretch animate-marquee-force">
          {duplicatedAlbums.map((album, index) => (
            <div
              key={`${album.collectionId}-${index}`}
              className="flex w-48 shrink-0 flex-col sm:w-56 mx-3 rounded-xl bg-white shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="relative aspect-square bg-zinc-100 rounded-t-xl overflow-hidden">
                {album.imageUrl ? (
                  <img
                    src={album.imageUrl}
                    alt={`${album.title} cover`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-xs text-zinc-400">
                    이미지 없음
                  </div>
                )}
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-bold text-base text-left line-clamp-2">
                  {album.title}
                </h3>
                <p className="text-sm text-zinc-700 text-left">
                  {album.artist}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  {album.genre && (
                    <span className="text-left">{album.genre}</span>
                  )}
                  {album.releaseDate && (
                    <>
                      {album.genre && <span>•</span>}
                      <span>{getReleaseYear(album.releaseDate)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
