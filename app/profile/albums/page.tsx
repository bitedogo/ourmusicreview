"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FavoriteAlbum {
  id: string;
  albumId: string;
  createdAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
    releaseDate: string | null;
  } | null;
}

export default function FavoriteAlbumsPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/favorites");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          if (response.status === 401) {
            router.push("/auth/signin?callbackUrl=/profile/albums");
            return;
          }
          setError(data?.error ?? "좋아요한 앨범을 불러오지 못했습니다.");
          return;
        }

        setFavorites(data.favorites || []);
      } catch {
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchFavorites();
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          onClick={() => router.push("/profile")}
          className="mb-4 flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          마이페이지로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">좋아하는 앨범 전체보기</h1>
        <p className="text-xs text-zinc-500">내가 좋아요 표시한 모든 앨범 목록입니다.</p>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">앨범을 불러오는 중...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 좋아하는 앨범이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
              className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-100">
                {fav.album?.imageUrl ? (
                  <img
                    src={fav.album.imageUrl}
                    alt={fav.album.title}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    이미지 없음
                  </div>
                )}
              </div>
              <div className="min-h-[60px] space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500 truncate">
                  {fav.album?.artist}
                </p>
                <h3 className="line-clamp-2 text-sm font-bold text-zinc-900">
                  {fav.album?.title}
                </h3>
                {fav.album?.releaseDate && (
                  <p className="text-[11px] text-zinc-500">
                    {new Date(fav.album.releaseDate).getFullYear()}년 발매
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
