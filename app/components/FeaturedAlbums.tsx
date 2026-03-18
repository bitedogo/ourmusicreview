"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface FeaturedAlbum {
  collectionId: number;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
  averageRating: number | null;
}

function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return "";
  try {
    return new Date(releaseDate).getFullYear().toString();
  } catch {
    return "";
  }
}

export default function FeaturedAlbums() {
  const { data: session, status } = useSession();
  const [albums, setAlbums] = useState<FeaturedAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    setIsLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/featured-albums", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json().catch(() => null);
        if (data?.ok && Array.isArray(data?.albums)) {
          setAlbums(data.albums);
        }
      } catch {
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status, session?.user?.id]);

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">앨범을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  const duplicatedAlbums = [...albums, ...albums];

  return (
    <section className="relative left-1/2 mt-[6px] w-screen max-w-none -translate-x-1/2">
      <div className="relative overflow-hidden">
        <div className="group flex flex-nowrap items-stretch animate-marquee-force">
          {duplicatedAlbums.map((album, index) => (
            <Link
              key={`${album.collectionId}-${index}`}
              href={`/review/album/${album.collectionId}`}
              className="flex w-48 shrink-0 flex-col sm:w-56 mx-3 rounded-xl bg-white shadow-sm overflow-hidden transition-transform duration-300 hover:scale-105"
            >
              <div className="relative aspect-square bg-zinc-100 rounded-t-xl overflow-hidden">
                {album.imageUrl ? (
                  <Image
                    src={album.imageUrl}
                    alt={`${album.title} cover`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 192px, 224px"
                    className="w-full h-full object-cover"
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
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-zinc-600">Rating :</span>
                  <span
                    className={`text-sm font-bold ${album.averageRating != null && album.averageRating >= 9 ? "text-red-600" : "text-zinc-900"}`}
                  >
                    {album.averageRating != null ? album.averageRating.toFixed(1) : "-"}
                  </span>
                </div>
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
