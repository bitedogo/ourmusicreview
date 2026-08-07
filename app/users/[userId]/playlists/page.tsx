"use client";
/** 타 유저 공개 플레이리스트 목록 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  fetchPublicPlaylistsByUser,
  type PlaylistListItemDto,
} from "@/src/components/playlist/playlist-api";
import { PlaylistEngagementCounts } from "@/src/components/playlist/playlist-engagement-counts";

export default function UserPlaylistsPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params?.userId ?? "";
  const [playlists, setPlaylists] = useState<PlaylistListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchPublicPlaylistsByUser(userId);
        if (cancelled) return;
        setPlaylists(response.data.playlists ?? []);
      } catch {
        if (cancelled) return;
        setError("공개 플레이리스트를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    if (userId) load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => router.push(`/users/${encodeURIComponent(userId)}`)}
          className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
        >
          프로필로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">공개 플레이리스트</h1>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          플레이리스트를 불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          공개된 플레이리스트가 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {playlists.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <h2 className="truncate text-sm font-semibold text-zinc-900">{item.title}</h2>
              <p className="mt-1 text-xs text-zinc-500">{item.trackCount}곡</p>
              <PlaylistEngagementCounts
                likeCount={item.likeCount ?? 0}
                commentCount={item.commentCount ?? 0}
                className="mt-1.5"
                size="mobile"
              />
              {item.description ? (
                <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
