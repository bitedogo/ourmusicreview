"use client";
/** 플레이리스트 트랙 목록 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import type { PlaylistTrackDto } from "@/src/components/playlist/playlist-api";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { formatTrackDuration } from "@/src/lib/album/track-utils";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { buildTrackStreamingLinks } from "@/src/lib/streaming/track-links";

interface PlaylistTrackListProps {
  tracks: PlaylistTrackDto[];
  streamingLinksByTrackId: Record<string, AlbumStreamingLinks>;
  removingTrackId?: string | null;
  onRemoveTrack?: (trackRowId: string, trackName: string) => void;
}

export function PlaylistTrackList({
  tracks,
  streamingLinksByTrackId,
  removingTrackId = null,
  onRemoveTrack,
}: PlaylistTrackListProps) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  if (tracks.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">트랙 목록</h2>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          아직 담긴 트랙이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">트랙 목록</h2>
      <ul className="w-full overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_#D9D9D9,0px_2px_4px_rgba(0,0,0,0.25)]">
        {tracks.map((track, index) => {
          const resolved = streamingLinksByTrackId[track.trackId];
          const streamingLinks =
            resolved &&
            (resolved.appleMusic || resolved.spotify || resolved.deezer)
              ? resolved
              : buildTrackStreamingLinks(track.artistName, track.trackName);

          return (
            <li
              key={track.id}
              className="border-b border-zinc-100 px-3 py-3 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <span className="mt-5 w-6 shrink-0 text-center text-xs text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-20 sm:w-20">
                  {track.artworkUrl100 ? (
                    <Image
                      src={track.artworkUrl100}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-200" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)] sm:text-base">
                    {track.trackName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-text-secondary)]">
                    <ArtistNameLink
                      name={track.artistName}
                      className="truncate text-left text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                    />
                    {track.collectionName ? ` · ${track.collectionName}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                    {formatTrackDuration(track.durationMs)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {track.previewUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPlayingTrackId((prev) =>
                            prev === track.id ? null : track.id
                          )
                        }
                        className="shrink-0 rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] text-[var(--color-text-primary)] hover:bg-zinc-50"
                      >
                        {playingTrackId === track.id ? "정지" : "미리듣기"}
                      </button>
                    ) : null}
                    {track.collectionId ? (
                      <Link
                        href={`/review/album/${encodeURIComponent(track.collectionId)}`}
                        className="shrink-0 rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] text-[var(--color-text-primary)] hover:bg-zinc-50"
                      >
                        앨범
                      </Link>
                    ) : null}
                    {onRemoveTrack ? (
                      <button
                        type="button"
                        disabled={removingTrackId === track.id}
                        onClick={() =>
                          void onRemoveTrack(track.id, track.trackName)
                        }
                        className="shrink-0 rounded-full border border-red-200 px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-60"
                      >
                        {removingTrackId === track.id ? "제거중" : "제거"}
                      </button>
                    ) : null}
                  </div>
                  <StreamingLinkButtons links={streamingLinks} />
                </div>
              </div>
              {playingTrackId === track.id && track.previewUrl ? (
                <audio
                  autoPlay
                  src={track.previewUrl}
                  onEnded={() => setPlayingTrackId(null)}
                  className="hidden"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
