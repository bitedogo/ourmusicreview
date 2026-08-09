/** 앨범 트랙 → 플레이리스트 추가 payload */

import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import type { AddPlaylistTrackInput } from "@/src/lib/playlists/client-api";

export function buildAddTrackPayload(
  album: AlbumDetail,
  track: AlbumDetailTrack
): AddPlaylistTrackInput {
  return {
    trackId: track.id,
    trackName: track.title,
    artistName: track.artists[0] ?? album.artists[0] ?? "",
    collectionId: album.id,
    collectionName: album.name,
    artworkUrl100: album.imageUrl,
    previewUrl: track.previewUrl ?? null,
    trackNumber: track.trackNumber,
    discNumber: track.discNumber,
    durationMs: track.durationMs,
  };
}
