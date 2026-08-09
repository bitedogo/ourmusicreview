"use client";
/** 내 플레이리스트 목록/관리 페이지 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CreatePlaylistModal } from "@/src/components/playlist/create-playlist-modal";
import {
  PlaylistListCard,
  PlaylistListCardGrid,
} from "@/src/components/playlist/playlist-list-card";
import { ProfilePrivacyToggle } from "@/src/components/profile/ProfilePrivacyToggle";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import {
  fetchMyPlaylists,
  type PlaylistListItemDto,
  updatePlaylistApi,
} from "@/src/lib/playlists/client-api";
import { playlistList, profilePlaylist } from "@/src/lib/navigation/routes";

export default function ProfilePlaylistsPage() {
  const router = useRouter();
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
          <div className="flex justify-end">
            <Link
              href={playlistList()}
              className="text-xs font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)]"
            >
              공개 플레이리스트 둘러보기
            </Link>
          </div>

          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-10 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">
                아직 만든 플레이리스트가 없습니다.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
              >
                새 플레이리스트 생성
              </button>
            </div>
          ) : (
            <PlaylistListCardGrid size="wide">
              {sorted.map((item) => (
                <li key={item.id} className="relative">
                  <PlaylistListCard
                    item={item}
                    href={profilePlaylist(item.id)}
                    showOwner={false}
                    showGenres
                    size="wide"
                  />
                  <div
                    className="absolute right-1.5 top-1.5"
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
                </li>
              ))}
            </PlaylistListCardGrid>
          )}

          {sorted.length > 0 ? (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
              >
                새 플레이리스트 생성
              </button>
            </div>
          ) : null}
        </div>
      </ProfileListPageLayout>

      <CreatePlaylistModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(playlist) => {
          setPlaylists((prev) => [playlist, ...prev]);
          router.push(profilePlaylist(playlist.id));
        }}
      />
    </>
  );
}
