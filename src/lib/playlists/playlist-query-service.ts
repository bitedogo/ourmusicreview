/** 플레이리스트 조회와 DTO 매핑 로직 */

import type { DataSource, EntityManager } from "typeorm";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { PlaylistGenre } from "@/src/lib/db/entities/PlaylistGenre";
import { PlaylistTrack } from "@/src/lib/db/entities/PlaylistTrack";
import { User } from "@/src/lib/db/entities/User";
import { collapsePlaylistGenresForDisplay } from "@/src/lib/genres/genre-covers";
import {
  resolveGenreFilterIds,
  type GenreDto,
} from "@/src/lib/genres/genre-service";
import { ServiceError } from "@/src/lib/http/service-error";

export type PlaylistGenreDto = GenreDto;
export type PlaylistRepositoryProvider = DataSource | EntityManager;

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

export function toPlaylistListItem(
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

async function getPlaylistTrackCounts(
  dataSource: PlaylistRepositoryProvider,
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

  return new Map(
    rows.map((row) => [row.playlistId, Number(row.count || 0)])
  );
}

async function getPlaylistLikeCounts(
  dataSource: PlaylistRepositoryProvider,
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

  return new Map(
    rows.map((row) => [row.playlistId, Number(row.count || 0)])
  );
}

async function getPlaylistCommentCounts(
  dataSource: PlaylistRepositoryProvider,
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

  return new Map(
    rows.map((row) => [row.playlistId, Number(row.count || 0)])
  );
}

export async function getPlaylistEngagementCounts(
  dataSource: PlaylistRepositoryProvider,
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

export async function getGenresByPlaylistIds(
  dataSource: PlaylistRepositoryProvider,
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

export async function listMyPlaylists(
  dataSource: DataSource,
  userId: string,
  genreId?: string | null
): Promise<PlaylistListItem[]> {
  const qb = dataSource
    .getRepository(Playlist)
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
  return mapPlaylistList(dataSource, playlists);
}

export async function listPublicPlaylistsByUser(
  dataSource: DataSource,
  userId: string
): Promise<PlaylistListItem[]> {
  const playlists = await dataSource.getRepository(Playlist).find({
    where: { userId, isPublic: "Y" },
    order: { updatedAt: "DESC", createdAt: "DESC" },
  });
  return mapPlaylistList(dataSource, playlists);
}

async function mapPlaylistList(
  dataSource: PlaylistRepositoryProvider,
  playlists: Playlist[]
): Promise<PlaylistListItem[]> {
  const ids = playlists.map((playlist) => playlist.id);
  const [counts, genresMap, engagement] = await Promise.all([
    getPlaylistTrackCounts(dataSource, ids),
    getGenresByPlaylistIds(dataSource, ids),
    getPlaylistEngagementCounts(dataSource, ids),
  ]);
  return playlists.map((playlist) =>
    toPlaylistListItem(
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
  return value ? value.trim().slice(0, 100) : "";
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
    qb.andWhere(
      searchField === "author"
        ? "LOWER(user.nickname) LIKE :keyword"
        : "LOWER(playlist.title) LIKE :keyword",
      { keyword }
    );
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
  const playlists = await qb
    .orderBy("playlist.updatedAt", "DESC")
    .addOrderBy("playlist.createdAt", "DESC")
    .skip((currentPage - 1) * PUBLIC_PLAYLIST_PAGE_SIZE)
    .take(PUBLIC_PLAYLIST_PAGE_SIZE)
    .getMany();

  const items = await mapPlaylistList(dataSource, playlists);
  return {
    playlists: items.map((playlist, index) => ({
      ...playlist,
      ownerNickname:
        playlists[index].user?.nickname ?? playlists[index].userId,
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
  const playlist = await dataSource.getRepository(Playlist).findOne({
    where: { id: playlistId },
  });
  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }
  if (viewerId !== playlist.userId && playlist.isPublic !== "Y") {
    throw new ServiceError("비공개 플레이리스트입니다.", 403);
  }

  const [tracks, genresMap, engagement, owner] = await Promise.all([
    dataSource.getRepository(PlaylistTrack).find({
      where: { playlistId: playlist.id },
      order: { position: "ASC", createdAt: "ASC" },
    }),
    getGenresByPlaylistIds(dataSource, [playlist.id]),
    getPlaylistEngagementCounts(dataSource, [playlist.id]),
    dataSource.getRepository(User).findOne({
      where: { id: playlist.userId },
      select: ["id", "nickname"],
    }),
  ]);

  return {
    ...toPlaylistListItem(
      playlist,
      tracks.length,
      genresMap.get(playlist.id) ?? [],
      engagement.likeCounts.get(playlist.id) ?? 0,
      engagement.commentCounts.get(playlist.id) ?? 0
    ),
    ownerNickname: owner?.nickname?.trim() || playlist.userId,
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
