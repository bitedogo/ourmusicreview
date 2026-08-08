"use client";
/** 앨범 트랙리스트 (디스크 그룹) */

import type { ReactNode } from "react";
import type { AlbumDetailTrack } from "@/src/lib/album/detail-types";
import {
  formatTrackDuration,
  groupTracksByDisc,
} from "@/src/lib/album/track-utils";

interface AlbumTrackListProps {
  tracks: AlbumDetailTrack[];
  showExplicit?: boolean;
  emptyMessage?: string;
  listClassName?: string;
  renderAction?: (track: AlbumDetailTrack) => ReactNode;
}

export function AlbumTrackList({
  tracks,
  showExplicit = false,
  emptyMessage = "트랙리스트가 없습니다.",
  listClassName = "overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50",
  renderAction,
}: AlbumTrackListProps) {
  if (tracks.length === 0) {
    return (
      <p className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-6 text-center text-sm text-[var(--color-text-secondary)]">
        {emptyMessage}
      </p>
    );
  }

  const discGroups = groupTracksByDisc(tracks);
  const showDiscHeaders = discGroups.length > 1;

  return (
    <div className={listClassName}>
      {discGroups.map(([discNumber, discTracks]) => (
        <div key={discNumber}>
          {showDiscHeaders ? (
            <div className="sticky top-0 border-b border-zinc-200 bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
              Disc {discNumber}
            </div>
          ) : null}
          <ul>
            {discTracks.map((track) => (
              <li
                key={track.id}
                className="flex items-center justify-between gap-3 border-b border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)] last:border-b-0"
              >
                <span className="min-w-0 flex-1 truncate">
                  <span className="mr-2 font-medium text-[var(--color-text-muted)]">
                    {track.trackNumber}.
                  </span>
                  {track.title}
                  {showExplicit && track.explicit ? (
                    <span className="ml-1 text-[10px] font-semibold text-[var(--color-text-muted)]">
                      E
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-xs text-[var(--color-text-secondary)]">
                  {formatTrackDuration(track.durationMs)}
                </span>
                {renderAction ? renderAction(track) : null}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
