"use client";
/** 내 플레이리스트 목록/관리 페이지 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CreatePlaylistModal } from "@/src/components/playlist/create-playlist-modal";
import { ProfilePrivacyToggle } from "@/src/components/profile/ProfilePrivacyToggle";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import {
  fetchMyPlaylists,
  type PlaylistListItemDto,
  updatePlaylistApi,
} from "@/src/components/playlist/playlist-api";
import { profilePlaylist } from "@/src/lib/navigation/routes";

export default function ProfilePlaylistsPage() {
  const [playlists, setPlaylists] = useState<PlaylistListItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const sorted = useMemo(
    () =>
      [...playlists].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [playlists]
  );

  async function loadPlaylists() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchMyPlaylists();
      setPlaylists(response.data.playlists ?? []);
    } catch {
      setError("플레이리스트를 불러오는 데 실패했습니다.");
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function handleTogglePublic(item: PlaylistListItemDto, nextPublic: boolean) {
    if (item.isPublic === nextPublic) return;
    setSavingId(item.id);
    try {
      const response = await updatePlaylistApi(item.id, { isPublic: nextPublic });
      setPlaylists((prev) =>
        prev.map((playlist) =>
          playlist.id === item.id ? response.data.playlist : playlist
        )
      );
    } catch {
      alert("공개 설정 변경에 실패했습니다.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <>
      <ProfileListPageLayout
        title="내 플레이리스트"
        isLoading={isLoading}
        error={error}
        emptyMessage=""
        isEmpty={false}
        loadingMessage="플레이리스트를 불러오는 중..."
      >
        <div className="space-y-3">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
              아직 만든 플레이리스트가 없습니다.
            </div>
          ) : null}

          {sorted.map((item) => (
            <Link
              key={item.id}
              href={profilePlaylist(item.id)}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                {item.coverImageUrl ? (
                  <Image
                    src={item.coverImageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                    No Cover
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-zinc-900">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500">{item.trackCount}곡</p>
                {item.description ? (
                  <p className="mt-1 line-clamp-1 text-xs text-zinc-600">
                    {item.description}
                  </p>
                ) : null}
              </div>

              <div
                className="shrink-0"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
              >
                <ProfilePrivacyToggle
                  isPublic={item.isPublic}
                  disabled={savingId === item.id}
                  size="sm"
                  onChange={(value) => void handleTogglePublic(item, value)}
                />
              </div>
            </Link>
          ))}

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
            >
              새 플레이리스트 생성
            </button>
          </div>
        </div>
      </ProfileListPageLayout>

      <CreatePlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(playlist) => {
          setPlaylists((prev) => [playlist, ...prev]);
        }}
      />
    </>
  );
}
