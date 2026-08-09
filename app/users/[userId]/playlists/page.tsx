"use client";
/** 타 유저 공개 플레이리스트 목록 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PlaylistListCard,
  PlaylistListCardGrid,
} from "@/src/components/playlist/playlist-list-card";
import {
  fetchPublicPlaylistsByUser,
  type PlaylistListItemDto,
} from "@/src/lib/playlists/client-api";
import { playlistDetail, userProfile } from "@/src/lib/navigation/routes";

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

    if (userId) void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => router.push(userProfile(userId))}
          className="mb-4 flex w-fit items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
        >
          프로필로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">공개 플레이리스트</h1>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          플레이리스트를 불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : playlists.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          공개된 플레이리스트가 없습니다.
        </div>
      ) : (
        <PlaylistListCardGrid size="wide">
          {playlists.map((item) => (
            <li key={item.id}>
              <PlaylistListCard
                item={item}
                href={playlistDetail(item.id)}
                showOwner={false}
                size="wide"
              />
            </li>
          ))}
        </PlaylistListCardGrid>
      )}
    </div>
  );
}
