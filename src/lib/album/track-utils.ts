/** 앨범 트랙 표시·그룹핑 유틸 */

import type { AlbumDetailTrack } from "@/src/lib/album/detail-types";

export function formatTrackDuration(ms: number | null | undefined): string {
  if (ms == null || ms <= 0) return "-";
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${String(sec).padStart(2, "0")}`;
}

export function groupTracksByDisc(
  tracks: AlbumDetailTrack[]
): Array<[number, AlbumDetailTrack[]]> {
  const byDisc = new Map<number, AlbumDetailTrack[]>();
  for (const track of tracks) {
    const disc = track.discNumber > 0 ? track.discNumber : 1;
    const list = byDisc.get(disc) ?? [];
    list.push(track);
    byDisc.set(disc, list);
  }
  return Array.from(byDisc.entries()).sort(([a], [b]) => a - b);
}
