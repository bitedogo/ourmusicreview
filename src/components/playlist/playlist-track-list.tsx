"use client";
/** 플레이리스트 트랙 목록 */

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import type { PlaylistTrackDto } from "@/src/lib/playlists/client-api";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { formatTrackDuration } from "@/src/lib/album/track-utils";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { buildTrackStreamingLinks } from "@/src/lib/streaming/track-links";

interface PlaylistTrackListProps {
  tracks: PlaylistTrackDto[];
  streamingLinksByTrackId: Record<string, AlbumStreamingLinks>;
  removingTrackId?: string | null;
  isReordering?: boolean;
  onRemoveTrack?: (trackRowId: string, trackName: string) => void;
  onReorderTrack?: (sourceId: string, targetId: string) => void;
}

export function PlaylistTrackList({
  tracks,
  streamingLinksByTrackId,
  removingTrackId = null,
  isReordering = false,
  onRemoveTrack,
  onReorderTrack,
}: PlaylistTrackListProps) {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const canReorder = Boolean(onReorderTrack) && tracks.length > 1;

  if (tracks.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          트랙 목록
        </h2>
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          아직 담긴 트랙이 없습니다.
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
          트랙 목록
        </h2>
        {canReorder ? (
          <p className="text-[11px] text-[var(--color-text-muted)]">
            드래그하거나 ↑↓로 순서를 변경할 수 있습니다.
          </p>
        ) : null}
      </div>
      <ul className="w-full overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_#D9D9D9,0px_2px_4px_rgba(0,0,0,0.25)]">
        {tracks.map((track, index) => {
          const resolved = streamingLinksByTrackId[track.trackId];
          const streamingLinks =
            resolved &&
            (resolved.appleMusic || resolved.spotify || resolved.deezer)
              ? resolved
              : buildTrackStreamingLinks(track.artistName, track.trackName);
          const prevTrack = tracks[index - 1];
          const nextTrack = tracks[index + 1];

          return (
            <li
              key={track.id}
              draggable={canReorder && !isReordering}
              onDragStart={() => {
                if (!canReorder || isReordering) return;
                setDraggingId(track.id);
              }}
              onDragOver={(event) => {
                if (!canReorder || isReordering) return;
                event.preventDefault();
              }}
              onDrop={() => {
                if (!canReorder || !draggingId || !onReorderTrack) return;
                onReorderTrack(draggingId, track.id);
                setDraggingId(null);
              }}
              onDragEnd={() => setDraggingId(null)}
              className={`border-b border-zinc-100 px-3 py-3 last:border-b-0 ${
                canReorder ? "cursor-grab active:cursor-grabbing" : ""
              } ${draggingId === track.id ? "bg-zinc-50 opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3">
                {canReorder ? (
                  <div className="mt-4 flex shrink-0 flex-col items-center gap-1">
                    <span
                      className="text-[var(--color-text-muted)]"
                      aria-hidden
                    >
                      ⋮⋮
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={isReordering || !prevTrack}
                        onClick={() =>
                          prevTrack &&
                          onReorderTrack?.(track.id, prevTrack.id)
                        }
                        aria-label="한 칸 위로"
                        className="rounded px-1 text-[10px] text-[var(--color-text-secondary)] hover:bg-zinc-100 disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={isReordering || !nextTrack}
                        onClick={() =>
                          nextTrack &&
                          onReorderTrack?.(track.id, nextTrack.id)
                        }
                        aria-label="한 칸 아래로"
                        className="rounded px-1 text-[10px] text-[var(--color-text-secondary)] hover:bg-zinc-100 disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ) : null}
                <span className="mt-5 w-6 shrink-0 text-center text-xs text-[var(--color-text-muted)]">
                  {index + 1}
                </span>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-20 sm:w-20">
                  {track.artworkUrl100 ? (
                    <Image
                      src={track.artworkUrl100}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
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
