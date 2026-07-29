"use client";
/** 앨범 상세 패널(커버·트랙·평점) */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import { AddTrackToPlaylistModal } from "@/src/components/playlist/add-track-to-playlist-modal";

interface AlbumDetailPanelProps {
  album: AlbumDetail;
}

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function formatAlbumReleaseDate(date: string, precision: string) {
  if (!date) return "-";
  if (precision === "year") return date.slice(0, 4);
  if (precision === "month") return date.slice(0, 7);
  return date;
}

function groupTracksByDisc(tracks: AlbumDetailTrack[]) {
  const byDisc = new Map<number, AlbumDetailTrack[]>();
  for (const track of tracks) {
    const disc = track.discNumber > 0 ? track.discNumber : 1;
    const list = byDisc.get(disc) ?? [];
    list.push(track);
    byDisc.set(disc, list);
  }
  return Array.from(byDisc.entries()).sort(([a], [b]) => a - b);
}

export function AlbumDetailPanel({ album }: AlbumDetailPanelProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const discGroups = album.tracks.length ? groupTracksByDisc(album.tracks) : [];
  const showDiscHeaders = discGroups.length > 1;
  const [selectedTrack, setSelectedTrack] = useState<AlbumDetailTrack | null>(null);

  const isLoggedIn = status === "authenticated" && Boolean(session?.user?.id);
  const callbackUrl = useMemo(() => {
    if (typeof window === "undefined") return "/search";
    return `${window.location.pathname}${window.location.search}`;
  }, []);

  function handleOpenAddModal(track: AlbumDetailTrack) {
    if (!isLoggedIn) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    setSelectedTrack(track);
  }

  return (
    <div className="space-y-3">
      {discGroups.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-zinc-800">트랙리스트</h4>
          <div className="mt-2 max-h-64 overflow-y-auto rounded-xl border border-zinc-200 bg-zinc-50">
            {discGroups.map(([discNumber, tracks]) => (
              <div key={discNumber}>
                {showDiscHeaders && (
                  <div className="sticky top-0 border-b border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600">
                    Disc {discNumber}
                  </div>
                )}
                <ul>
                  {tracks.map((track) => (
                    <li
                      key={track.id}
                      className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3 py-2 text-sm text-zinc-700 last:border-b-0"
                    >
                      <span className="min-w-0 flex-1 truncate">
                        <span className="mr-2 font-medium text-zinc-400">{track.trackNumber}.</span>
                        {track.title}
                        {track.explicit ? (
                          <span className="ml-1 text-[10px] font-semibold text-zinc-400">E</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {formatDuration(track.durationMs)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAddModal(track)}
                        className="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100"
                      >
                        담기
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {album.copyrights.length > 0 && (
        <p className="text-[11px] leading-relaxed text-zinc-400">{album.copyrights.join(" · ")}</p>
      )}

      {selectedTrack ? (
        <AddTrackToPlaylistModal
          isOpen
          album={album}
          track={selectedTrack}
          onClose={() => setSelectedTrack(null)}
        />
      ) : null}
    </div>
  );
}
