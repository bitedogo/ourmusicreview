/** 플레이리스트 생성·조회·수정·삭제 비즈니스 로직 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { PlaylistTrack } from "@/src/lib/db/entities/PlaylistTrack";
import { PlaylistGenre } from "@/src/lib/db/entities/PlaylistGenre";
import { User } from "@/src/lib/db/entities/User";
import {
  assertValidGenreIds,
  resolveGenreFilterIds,
  type GenreDto,
} from "@/src/lib/genres/genre-service";
import { collapsePlaylistGenresForDisplay } from "@/src/lib/genres/genre-covers";
import { ServiceError } from "@/src/lib/http/service-error";

export type PlaylistGenreDto = GenreDto;

export interface PlaylistListItem {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  trackCount: number;
  likeCount: number;
  commentCount: number;
  genres: PlaylistGenreDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistDetail extends PlaylistListItem {
  ownerNickname: string;
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
  genreIds?: string[];
}

export interface UpdatePlaylistInput {
  title?: string;
  description?: string | null;
  isPublic?: boolean;
  coverImageUrl?: string | null;
  genreIds?: string[];
}

function toListItem(
  playlist: Playlist,
  trackCount: number,
  genres: PlaylistGenreDto[] = [],
  likeCount = 0,
  commentCount = 0
): PlaylistListItem {
  return {
    id: playlist.id,
    userId: playlist.userId,
    title: playlist.title,
    description: playlist.description ?? null,
    isPublic: playlist.isPublic === "Y",
    coverImageUrl: playlist.coverImageUrl ?? null,
    trackCount,
    likeCount,
    commentCount,
    genres,
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

async function getPlaylistLikeCounts(
  dataSource: DataSource,
  playlistIds: string[]
): Promise<Map<string, number>> {
  if (playlistIds.length === 0) return new Map();

  const rows = await dataSource
    .getRepository(Like)
    .createQueryBuilder("like")
    .select("like.playlist_id", "playlistId")
    .addSelect("COUNT(*)::int", "count")
    .where("like.playlist_id IN (:...playlistIds)", { playlistIds })
    .groupBy("like.playlist_id")
    .getRawMany<{ playlistId: string; count: number }>();

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.playlistId, Number(row.count || 0));
  }
  return map;
}

async function getPlaylistCommentCounts(
  dataSource: DataSource,
  playlistIds: string[]
): Promise<Map<string, number>> {
  if (playlistIds.length === 0) return new Map();

  const rows = await dataSource
    .getRepository(Comment)
    .createQueryBuilder("comment")
    .select("comment.playlist_id", "playlistId")
    .addSelect("COUNT(*)::int", "count")
    .where("comment.playlist_id IN (:...playlistIds)", { playlistIds })
    .groupBy("comment.playlist_id")
    .getRawMany<{ playlistId: string; count: number }>();

  const map = new Map<string, number>();
  for (const row of rows) {
    map.set(row.playlistId, Number(row.count || 0));
  }
  return map;
}

async function getPlaylistEngagementCounts(
  dataSource: DataSource,
  playlistIds: string[]
): Promise<{
  likeCounts: Map<string, number>;
  commentCounts: Map<string, number>;
}> {
  const [likeCounts, commentCounts] = await Promise.all([
    getPlaylistLikeCounts(dataSource, playlistIds),
    getPlaylistCommentCounts(dataSource, playlistIds),
  ]);
  return { likeCounts, commentCounts };
}

async function getGenresByPlaylistIds(
  dataSource: DataSource,
  playlistIds: string[]
): Promise<Map<string, PlaylistGenreDto[]>> {
  const map = new Map<string, PlaylistGenreDto[]>();
  if (playlistIds.length === 0) return map;

  const rows = await dataSource
    .getRepository(PlaylistGenre)
    .createQueryBuilder("pg")
    .innerJoinAndSelect("pg.genre", "genre")
    .where("pg.playlist_id IN (:...playlistIds)", { playlistIds })
    .orderBy("genre.parent_id", "ASC")
    .addOrderBy("genre.name_ko", "ASC")
    .getMany();

  for (const row of rows) {
    const list = map.get(row.playlistId) ?? [];
    list.push({
      id: row.genre.id,
      nameKo: row.genre.nameKo,
      nameEn: row.genre.nameEn,
      parentId: row.genre.parentId,
    });
    map.set(row.playlistId, list);
  }

  for (const [playlistId, list] of map) {
    map.set(playlistId, collapsePlaylistGenresForDisplay(list));
  }

  return map;
}

async function replacePlaylistGenres(
  dataSource: DataSource,
  playlistId: string,
  genreIds: string[]
): Promise<PlaylistGenreDto[]> {
  const validated = await assertValidGenreIds(dataSource, genreIds);
  const repository = dataSource.getRepository(PlaylistGenre);

  await repository.delete({ playlistId });

  if (validated.length === 0) return [];

  await repository.save(
    validated.map((genreId) =>
      repository.create({
        playlistId,
        genreId,
      })
    )
  );

  const genresMap = await getGenresByPlaylistIds(dataSource, [playlistId]);
  return genresMap.get(playlistId) ?? [];
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

  const genres =
    input.genreIds !== undefined
      ? await replacePlaylistGenres(dataSource, playlist.id, input.genreIds)
      : [];

  return toListItem(playlist, 0, genres);
}

export async function listMyPlaylists(
  dataSource: DataSource,
  userId: string,
  genreId?: string | null
): Promise<PlaylistListItem[]> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const qb = playlistRepository
    .createQueryBuilder("playlist")
    .where("playlist.user_id = :userId", { userId });

  if (genreId?.trim()) {
    const genreIds = await resolveGenreFilterIds(dataSource, genreId.trim());
    if (genreIds.length > 0) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM playlist_genres pg
          WHERE pg.playlist_id = playlist.id
            AND pg.genre_id IN (:...genreIds)
        )`,
        { genreIds }
      );
    }
  }

  const playlists = await qb
    .orderBy("playlist.updatedAt", "DESC")
    .addOrderBy("playlist.createdAt", "DESC")
    .getMany();

  const ids = playlists.map((playlist) => playlist.id);
  const [counts, genresMap, engagement] = await Promise.all([
    getPlaylistTrackCounts(dataSource, ids),
    getGenresByPlaylistIds(dataSource, ids),
    getPlaylistEngagementCounts(dataSource, ids),
  ]);

  return playlists.map((playlist) =>
    toListItem(
      playlist,
      counts.get(playlist.id) ?? 0,
      genresMap.get(playlist.id) ?? [],
      engagement.likeCounts.get(playlist.id) ?? 0,
      engagement.commentCounts.get(playlist.id) ?? 0
    )
  );
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

  const ids = playlists.map((playlist) => playlist.id);
  const [counts, genresMap, engagement] = await Promise.all([
    getPlaylistTrackCounts(dataSource, ids),
    getGenresByPlaylistIds(dataSource, ids),
    getPlaylistEngagementCounts(dataSource, ids),
  ]);
  return playlists.map((playlist) =>
    toListItem(
      playlist,
      counts.get(playlist.id) ?? 0,
      genresMap.get(playlist.id) ?? [],
      engagement.likeCounts.get(playlist.id) ?? 0,
      engagement.commentCounts.get(playlist.id) ?? 0
    )
  );
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
  genre: string | null;
}

export interface PublicPlaylistListResult {
  playlists: PublicPlaylistListItem[];
  searchField: PublicPlaylistSearchField;
  q: string;
  genre: string | null;
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
  const genreFilter = params.genre?.trim() || null;

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

  if (genreFilter) {
    const genreIds = await resolveGenreFilterIds(dataSource, genreFilter);
    if (genreIds.length > 0) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM playlist_genres pg
          WHERE pg.playlist_id = playlist.id
            AND pg.genre_id IN (:...genreIds)
        )`,
        { genreIds }
      );
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

  const ids = playlists.map((playlist) => playlist.id);
  const [counts, genresMap, engagement] = await Promise.all([
    getPlaylistTrackCounts(dataSource, ids),
    getGenresByPlaylistIds(dataSource, ids),
    getPlaylistEngagementCounts(dataSource, ids),
  ]);

  return {
    playlists: playlists.map((playlist) => ({
      ...toListItem(
        playlist,
        counts.get(playlist.id) ?? 0,
        genresMap.get(playlist.id) ?? [],
        engagement.likeCounts.get(playlist.id) ?? 0,
        engagement.commentCounts.get(playlist.id) ?? 0
      ),
      ownerNickname: playlist.user?.nickname ?? playlist.userId,
    })),
    searchField,
    q: searchQuery,
    genre: genreFilter,
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
  const userRepository = dataSource.getRepository(User);
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId },
  });

  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }

  const isOwner = viewerId === playlist.userId;
  if (!isOwner && playlist.isPublic !== "Y") {
    throw new ServiceError("비공개 플레이리스트입니다.", 403);
  }

  const [tracks, genresMap, engagement, owner] = await Promise.all([
    trackRepository.find({
      where: { playlistId: playlist.id },
      order: { position: "ASC", createdAt: "ASC" },
    }),
    getGenresByPlaylistIds(dataSource, [playlist.id]),
    getPlaylistEngagementCounts(dataSource, [playlist.id]),
    userRepository.findOne({
      where: { id: playlist.userId },
      select: ["id", "nickname"],
    }),
  ]);

  const ownerNickname = owner?.nickname?.trim() || playlist.userId;

  return {
    ...toListItem(
      playlist,
      tracks.length,
      genresMap.get(playlist.id) ?? [],
      engagement.likeCounts.get(playlist.id) ?? 0,
      engagement.commentCounts.get(playlist.id) ?? 0
    ),
    ownerNickname,
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
  let genres: PlaylistGenreDto[] | undefined;

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

  if (input.genreIds !== undefined) {
    genres = await replacePlaylistGenres(dataSource, playlist.id, input.genreIds);
    changed = true;
  }

  if (!changed) {
    throw new ServiceError("수정된 내용이 없습니다.", 400);
  }

  await playlistRepository.save(playlist);

  const trackCount = await dataSource
    .getRepository(PlaylistTrack)
    .count({ where: { playlistId: playlist.id } });

  if (genres === undefined) {
    const genresMap = await getGenresByPlaylistIds(dataSource, [playlist.id]);
    genres = genresMap.get(playlist.id) ?? [];
  }

  const engagement = await getPlaylistEngagementCounts(dataSource, [
    playlist.id,
  ]);

  return toListItem(
    playlist,
    trackCount,
    genres,
    engagement.likeCounts.get(playlist.id) ?? 0,
    engagement.commentCounts.get(playlist.id) ?? 0
  );
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
