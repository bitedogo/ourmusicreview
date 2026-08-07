"use client";
/** 공개 플레이리스트 상세 (읽기 전용) */

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PlaylistTrackList } from "@/src/components/playlist/playlist-track-list";
import { GenreTags } from "@/src/components/playlist/genre-tags";
import { PlaylistEngagementCounts } from "@/src/components/playlist/playlist-engagement-counts";
import { PlaylistVinylCover } from "@/src/components/playlist/playlist-vinyl-cover";
import { CommentSection } from "@/src/components/interaction/CommentSection";
import { usePlaylistDetail } from "@/src/hooks/use-playlist-detail";
import { getUserProfilePath } from "@/src/components/profile/profile-view-types";
import { playlistList } from "@/src/lib/navigation/routes";

export default function PublicPlaylistDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const playlistId = params?.id ?? "";
  const { playlist, isLoading, error, streamingLinksByTrackId } =
    usePlaylistDetail(playlistId);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-4 py-10 sm:px-0">
      <button
        type="button"
        onClick={() => router.push(playlistList())}
        className="mb-2 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        플레이리스트 목록으로
      </button>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          플레이리스트를 불러오는 중...
        </div>
      ) : error || !playlist ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "플레이리스트를 찾을 수 없습니다."}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-stretch gap-4">
                <PlaylistVinylCover
                  coverImageUrl={playlist.coverImageUrl}
                  alt={playlist.title}
                  size="md"
                  interactive
                />
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                    {playlist.title}
                  </h1>
                  <p className="mt-1 text-xs text-zinc-500">
                    {playlist.trackCount}곡 ·{" "}
                    <Link
                      href={getUserProfilePath(playlist.userId)}
                      className="hover:text-[var(--color-brand-primary)] hover:underline"
                    >
                      작성자 프로필
                    </Link>
                  </p>
                  <PlaylistEngagementCounts
                    likeCount={playlist.likeCount ?? 0}
                    commentCount={playlist.commentCount ?? 0}
                    className="mt-1.5"
                    size="desktop"
                  />
                  {playlist.description ? (
                    <p className="mt-2 text-sm text-zinc-600">
                      {playlist.description}
                    </p>
                  ) : null}
                  <GenreTags
                    genres={playlist.genres ?? []}
                    className="mt-2"
                    size="md"
                  />
                </div>
              </div>
            </section>

            <PlaylistTrackList
              tracks={playlist.tracks}
              streamingLinksByTrackId={streamingLinksByTrackId}
            />
          </div>

          <CommentSection playlistId={playlist.id} variant="detail" />
        </>
      )}
    </div>
  );
}
