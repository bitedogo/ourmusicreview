/** 플레이리스트 트랙 추가·삭제·정렬 비즈니스 로직 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { PlaylistTrack } from "@/src/lib/db/entities/PlaylistTrack";
import { ServiceError } from "@/src/lib/http/service-error";
import { getLargeImageUrl } from "@/src/lib/itunes/http";
import { applyPositionOrder, reindexPositions } from "@/src/lib/utils/reorder";

export interface AddPlaylistTrackInput {
  trackId?: string;
  trackName?: string;
  artistName?: string;
  collectionId?: string | null;
  collectionName?: string | null;
  artworkUrl100?: string | null;
  previewUrl?: string | null;
  trackNumber?: number | null;
  discNumber?: number | null;
  durationMs?: number | null;
}

export interface ReorderPlaylistTracksInput {
  order?: string[];
}

async function touchPlaylistUpdatedAt(
  dataSource: DataSource,
  playlistId: string
): Promise<void> {
  const playlistRepository = dataSource.getRepository(Playlist);
  await playlistRepository.update({ id: playlistId }, { updatedAt: new Date() });
}

async function requireOwnedPlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string
): Promise<Playlist> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlist = await playlistRepository.findOne({ where: { id: playlistId } });
  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }
  if (playlist.userId !== requesterId) {
    throw new ServiceError("플레이리스트 수정 권한이 없습니다.", 403);
  }
  return playlist;
}

function normalizeString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function normalizeNullableString(
  value: unknown,
  maxLength: number
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeNullableNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const num = Math.floor(value);
  return num >= 0 ? num : null;
}

export async function addTrackToPlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string,
  input: AddPlaylistTrackInput
): Promise<{ trackId: string; created: boolean }> {
  const playlist = await requireOwnedPlaylist(dataSource, playlistId, requesterId);

  const normalizedTrackId = normalizeString(input.trackId, 255);
  const trackName = normalizeString(input.trackName, 500);
  const artistName = normalizeString(input.artistName, 255);

  if (!normalizedTrackId || !trackName || !artistName) {
    throw new ServiceError("트랙 ID, 곡 제목, 아티스트는 필수입니다.", 400);
  }

  const trackRepository = dataSource.getRepository(PlaylistTrack);
  const existing = await trackRepository.findOne({
    where: { playlistId, trackId: normalizedTrackId },
  });

  if (existing) {
    return { trackId: existing.id, created: false };
  }

  const lastTrack = await trackRepository.findOne({
    where: { playlistId },
    order: { position: "DESC", createdAt: "DESC" },
  });

  const artworkUrl100 = normalizeNullableString(input.artworkUrl100, 1000);
  // 자동 커버·트랙 아트는 iTunes CDN URL만 저장 (Storage Egress 회피)
  const normalizedArtwork =
    getLargeImageUrl(artworkUrl100 ?? undefined) ?? artworkUrl100;

  const track = trackRepository.create({
    id: randomUUID().replace(/-/g, "").slice(0, 255),
    playlistId,
    trackId: normalizedTrackId,
    trackName,
    artistName,
    collectionId: normalizeNullableString(input.collectionId, 255),
    collectionName: normalizeNullableString(input.collectionName, 500),
    artworkUrl100: normalizedArtwork,
    previewUrl: normalizeNullableString(input.previewUrl, 1000),
    trackNumber: normalizeNullableNumber(input.trackNumber),
    discNumber: normalizeNullableNumber(input.discNumber),
    durationMs: normalizeNullableNumber(input.durationMs),
    position: (lastTrack?.position ?? 0) + 1,
  });

  await trackRepository.save(track);

  // 대표사진이 비어 있으면 처음 담은 트랙 앨범 커버(외부 CDN)로 자동 설정
  if (!playlist.coverImageUrl && normalizedArtwork) {
    const playlistRepository = dataSource.getRepository(Playlist);
    playlist.coverImageUrl = normalizedArtwork;
    playlist.updatedAt = new Date();
    await playlistRepository.save(playlist);
  } else {
    await touchPlaylistUpdatedAt(dataSource, playlistId);
  }

  return { trackId: track.id, created: true };
}

export async function reorderPlaylistTracks(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string,
  input: ReorderPlaylistTracksInput
): Promise<void> {
  await requireOwnedPlaylist(dataSource, playlistId, requesterId);

  const order = Array.isArray(input.order)
    ? input.order.map((item) => String(item).trim()).filter(Boolean)
    : [];
  if (order.length === 0) {
    throw new ServiceError("변경할 트랙 순서가 비어 있습니다.", 400);
  }

  const trackRepository = dataSource.getRepository(PlaylistTrack);
  const tracks = await trackRepository.find({
    where: { playlistId },
    order: { position: "ASC", createdAt: "ASC" },
  });

  if (tracks.length === 0) {
    throw new ServiceError("플레이리스트에 트랙이 없습니다.", 400);
  }

  const existingIds = new Set(tracks.map((track) => track.id));
  const uniqueOrder = Array.from(new Set(order));
  const normalizedOrder = uniqueOrder.filter((id) => existingIds.has(id));

  if (normalizedOrder.length === 0) {
    throw new ServiceError("유효한 트랙 순서가 없습니다.", 400);
  }

  for (const track of tracks) {
    if (!normalizedOrder.includes(track.id)) {
      normalizedOrder.push(track.id);
    }
  }

  await applyPositionOrder(trackRepository, tracks, normalizedOrder);
  const refreshed = await trackRepository.find({
    where: { playlistId },
    order: { position: "ASC", createdAt: "ASC" },
  });
  await reindexPositions(trackRepository, refreshed);

  await touchPlaylistUpdatedAt(dataSource, playlistId);
}

export async function removeTrackFromPlaylist(
  dataSource: DataSource,
  playlistId: string,
  playlistTrackId: string,
  requesterId: string
): Promise<void> {
  await requireOwnedPlaylist(dataSource, playlistId, requesterId);

  const trackRepository = dataSource.getRepository(PlaylistTrack);
  const track = await trackRepository.findOne({
    where: { id: playlistTrackId, playlistId },
  });
  if (!track) {
    throw new ServiceError("트랙을 찾을 수 없습니다.", 404);
  }

  await trackRepository.remove(track);

  const remain = await trackRepository.find({
    where: { playlistId },
    order: { position: "ASC", createdAt: "ASC" },
  });
  await reindexPositions(trackRepository, remain);

  await touchPlaylistUpdatedAt(dataSource, playlistId);
}
