"use client";
/** 앨범 상세 패널(커버·트랙·평점) */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlbumTrackList } from "@/src/components/album/album-track-list";
import { AddTrackToPlaylistModal } from "@/src/components/playlist/add-track-to-playlist-modal";
import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";

interface AlbumDetailPanelProps {
  album: AlbumDetail;
}

export function formatAlbumReleaseDate(date: string, precision: string) {
  if (!date) return "-";
  if (precision === "year") return date.slice(0, 4);
  if (precision === "month") return date.slice(0, 7);
  return date;
}

export function AlbumDetailPanel({ album }: AlbumDetailPanelProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedTrack, setSelectedTrack] = useState<AlbumDetailTrack | null>(
    null
  );

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
      {album.tracks.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-zinc-800">트랙리스트</h4>
          <div className="mt-2 max-h-64 overflow-y-auto">
            <AlbumTrackList
              tracks={album.tracks}
              showExplicit
              renderAction={(track) => (
                <button
                  type="button"
                  onClick={() => handleOpenAddModal(track)}
                  className="shrink-0 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100"
                >
                  담기
                </button>
              )}
            />
          </div>
        </div>
      ) : null}

      {album.copyrights.length > 0 ? (
        <p className="text-[11px] leading-relaxed text-zinc-400">
          {album.copyrights.join(" · ")}
        </p>
      ) : null}

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
