/** 플레이리스트 생성·조회·수정·삭제 비즈니스 로직 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { PlaylistTrack } from "@/src/lib/db/entities/PlaylistTrack";
import { ServiceError } from "@/src/lib/http/service-error";

export interface PlaylistListItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  trackCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistDetail extends PlaylistListItem {
  tracks: Array<{
    id: string;
    trackId: string;
    trackName: string;
    artistName: string;
    collectionId: string | null;
    collectionName: string | null;
    artworkUrl100: string | null;
    previewUrl: string | null;
    trackNumber: number | null;
    discNumber: number | null;
    durationMs: number | null;
    position: number;
    createdAt: Date;
  }>;
}

export interface CreatePlaylistInput {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  coverImageUrl?: string | null;
}

export interface UpdatePlaylistInput {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  coverImageUrl?: string | null;
}

function toListItem(
  playlist: Playlist,
  trackCount: number
): PlaylistListItem {
  return {
    id: playlist.id,
    userId: playlist.userId,
    title: playlist.title,
    description: playlist.description ?? null,
    isPublic: playlist.isPublic === "Y",
    coverImageUrl: playlist.coverImageUrl ?? null,
    trackCount,
    createdAt: playlist.createdAt,
    updatedAt: playlist.updatedAt,
  };
}

function normalizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, maxLength);
}

function normalizeOptionalText(
  value: unknown,
  maxLength: number
): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

async function getPlaylistTrackCounts(
  dataSource: DataSource,
  playlistIds: string[]
): Promise<Map<string, number>> {
  if (playlistIds.length === 0) return new Map();

  const rows = await dataSource
    .getRepository(PlaylistTrack)
    .createQueryBuilder("track")
    .select("track.playlist_id", "playlistId")
    .addSelect("COUNT(track.id)", "count")
    .where("track.playlist_id IN (:...playlistIds)", { playlistIds })
    .groupBy("track.playlist_id")
    .getRawMany<{ playlistId: string; count: string }>();

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.playlistId, Number(row.count || 0));
  }
  return map;
}

export async function createPlaylist(
  dataSource: DataSource,
  userId: string,
  input: CreatePlaylistInput
): Promise<PlaylistListItem> {
  const title = normalizeText(input.title, 255);
  if (!title) {
    throw new ServiceError("플레이리스트 제목은 필수입니다.", 400);
  }

  const playlistRepository = dataSource.getRepository(Playlist);
  const playlist = playlistRepository.create({
    id: randomUUID().replace(/-/g, "").slice(0, 255),
    userId,
    title,
    description: normalizeOptionalText(input.description, 2000) ?? null,
    isPublic: input.isPublic ? "Y" : "N",
    coverImageUrl: normalizeOptionalText(input.coverImageUrl, 1000) ?? null,
  });

  await playlistRepository.save(playlist);
  return toListItem(playlist, 0);
}

export async function listMyPlaylists(
  dataSource: DataSource,
  userId: string
): Promise<PlaylistListItem[]> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlists = await playlistRepository.find({
    where: { userId },
    order: { updatedAt: "DESC", createdAt: "DESC" },
  });

  const counts = await getPlaylistTrackCounts(
    dataSource,
    playlists.map((playlist) => playlist.id)
  );

  return playlists.map((playlist) => toListItem(playlist, counts.get(playlist.id) ?? 0));
}

export async function listPublicPlaylistsByUser(
  dataSource: DataSource,
  userId: string
): Promise<PlaylistListItem[]> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlists = await playlistRepository.find({
    where: { userId, isPublic: "Y" },
    order: { updatedAt: "DESC", createdAt: "DESC" },
  });

  const counts = await getPlaylistTrackCounts(
    dataSource,
    playlists.map((playlist) => playlist.id)
  );
  return playlists.map((playlist) => toListItem(playlist, counts.get(playlist.id) ?? 0));
}

const PUBLIC_PLAYLIST_PAGE_SIZE = 12;
const PUBLIC_PLAYLIST_SEARCH_FIELDS = ["title", "author"] as const;
export type PublicPlaylistSearchField =
  (typeof PUBLIC_PLAYLIST_SEARCH_FIELDS)[number];

export interface PublicPlaylistListItem extends PlaylistListItem {
  ownerNickname: string;
}

export interface PublicPlaylistListParams {
  page: string | null;
  searchField: string | null;
  q: string | null;
}

export interface PublicPlaylistListResult {
  playlists: PublicPlaylistListItem[];
  searchField: PublicPlaylistSearchField;
  q: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

function parsePublicPlaylistPage(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

function parsePublicPlaylistSearchField(
  value: string | null
): PublicPlaylistSearchField {
  if (
    value &&
    PUBLIC_PLAYLIST_SEARCH_FIELDS.includes(value as PublicPlaylistSearchField)
  ) {
    return value as PublicPlaylistSearchField;
  }
  return "title";
}

function parsePublicPlaylistSearchQuery(value: string | null): string {
  if (!value) return "";
  return value.trim().slice(0, 100);
}

/** 전역 공개 플레이리스트 목록 (is_public + 유저 show_playlists_public) */
export async function listPublicPlaylists(
  dataSource: DataSource,
  params: PublicPlaylistListParams
): Promise<PublicPlaylistListResult> {
  const page = parsePublicPlaylistPage(params.page);
  const searchField = parsePublicPlaylistSearchField(params.searchField);
  const searchQuery = parsePublicPlaylistSearchQuery(params.q);

  const qb = dataSource
    .getRepository(Playlist)
    .createQueryBuilder("playlist")
    .innerJoinAndSelect("playlist.user", "user")
    .where("playlist.is_public = :isPublic", { isPublic: "Y" })
    .andWhere("user.show_playlists_public = :showPublic", { showPublic: "Y" });

  if (searchQuery) {
    const keyword = `%${searchQuery.toLowerCase()}%`;
    if (searchField === "author") {
      qb.andWhere("LOWER(user.nickname) LIKE :keyword", { keyword });
    } else {
      qb.andWhere("LOWER(playlist.title) LIKE :keyword", { keyword });
    }
  }

  const total = await qb.clone().getCount();
  const totalPages = Math.max(1, Math.ceil(total / PUBLIC_PLAYLIST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PUBLIC_PLAYLIST_PAGE_SIZE;

  const playlists = await qb
    .orderBy("playlist.updatedAt", "DESC")
    .addOrderBy("playlist.createdAt", "DESC")
    .skip(start)
    .take(PUBLIC_PLAYLIST_PAGE_SIZE)
    .getMany();

  const counts = await getPlaylistTrackCounts(
    dataSource,
    playlists.map((playlist) => playlist.id)
  );

  return {
    playlists: playlists.map((playlist) => ({
      ...toListItem(playlist, counts.get(playlist.id) ?? 0),
      ownerNickname: playlist.user?.nickname ?? playlist.userId,
    })),
    searchField,
    q: searchQuery,
    page: currentPage,
    totalPages,
    total,
    pageSize: PUBLIC_PLAYLIST_PAGE_SIZE,
  };
}

export async function getPlaylistDetail(
  dataSource: DataSource,
  playlistId: string,
  viewerId?: string | null
): Promise<PlaylistDetail> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const trackRepository = dataSource.getRepository(PlaylistTrack);
  const playlist = await playlistRepository.findOne({ where: { id: playlistId } });

  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }

  const isOwner = viewerId === playlist.userId;
  if (!isOwner && playlist.isPublic !== "Y") {
    throw new ServiceError("비공개 플레이리스트입니다.", 403);
  }

  const tracks = await trackRepository.find({
    where: { playlistId: playlist.id },
    order: { position: "ASC", createdAt: "ASC" },
  });

  return {
    ...toListItem(playlist, tracks.length),
    tracks: tracks.map((track) => ({
      id: track.id,
      trackId: track.trackId,
      trackName: track.trackName,
      artistName: track.artistName,
      collectionId: track.collectionId,
      collectionName: track.collectionName,
      artworkUrl100: track.artworkUrl100,
      previewUrl: track.previewUrl,
      trackNumber: track.trackNumber,
      discNumber: track.discNumber,
      durationMs: track.durationMs,
      position: track.position,
      createdAt: track.createdAt,
    })),
  };
}

export async function updatePlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string,
  input: UpdatePlaylistInput
): Promise<PlaylistListItem> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlist = await playlistRepository.findOne({ where: { id: playlistId } });

  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }

  if (playlist.userId !== requesterId) {
    throw new ServiceError("수정 권한이 없습니다.", 403);
  }

  let changed = false;

  if (input.title !== undefined) {
    const title = normalizeText(input.title, 255);
    if (!title) {
      throw new ServiceError("플레이리스트 제목은 비워둘 수 없습니다.", 400);
    }
    if (playlist.title !== title) {
      playlist.title = title;
      changed = true;
    }
  }

  if (input.description !== undefined) {
    const nextDescription = normalizeOptionalText(input.description, 2000) ?? null;
    if (playlist.description !== nextDescription) {
      playlist.description = nextDescription;
      changed = true;
    }
  }

  if (input.isPublic !== undefined) {
    const nextPublic = input.isPublic ? "Y" : "N";
    if (playlist.isPublic !== nextPublic) {
      playlist.isPublic = nextPublic;
      changed = true;
    }
  }

  if (input.coverImageUrl !== undefined) {
    const nextCover = normalizeOptionalText(input.coverImageUrl, 1000) ?? null;
    if (playlist.coverImageUrl !== nextCover) {
      playlist.coverImageUrl = nextCover;
      changed = true;
    }
  }

  if (!changed) {
    throw new ServiceError("수정된 내용이 없습니다.", 400);
  }

  await playlistRepository.save(playlist);
  const trackCount = await dataSource
    .getRepository(PlaylistTrack)
    .count({ where: { playlistId: playlist.id } });
  return toListItem(playlist, trackCount);
}

export async function deletePlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string
): Promise<void> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlist = await playlistRepository.findOne({ where: { id: playlistId } });
  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }
  if (playlist.userId !== requesterId) {
    throw new ServiceError("삭제 권한이 없습니다.", 403);
  }
  await playlistRepository.remove(playlist);
}
