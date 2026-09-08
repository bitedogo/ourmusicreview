/** 플레이리스트 생성·수정·삭제 비즈니스 로직 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { PlaylistGenre } from "@/src/lib/db/entities/PlaylistGenre";
import { PlaylistTrack } from "@/src/lib/db/entities/PlaylistTrack";
import { assertValidGenreIds } from "@/src/lib/genres/genre-service";
import { ServiceError } from "@/src/lib/http/service-error";
import type {
  CreatePlaylistInput,
  UpdatePlaylistInput,
} from "@/src/lib/playlists/contracts";
import {
  getGenresByPlaylistIds,
  getPlaylistEngagementCounts,
  toPlaylistListItem,
  type PlaylistGenreDto,
  type PlaylistListItem,
  type PlaylistRepositoryProvider,
} from "@/src/lib/playlists/playlist-query-service";

export {
  getPlaylistDetail,
  listMyPlaylists,
  listPublicPlaylists,
  listPublicPlaylistsByUser,
} from "@/src/lib/playlists/playlist-query-service";
export type {
  PlaylistDetail,
  PlaylistGenreDto,
  PlaylistListItem,
  PublicPlaylistListItem,
  PublicPlaylistListParams,
  PublicPlaylistListResult,
  PublicPlaylistSearchField,
} from "@/src/lib/playlists/playlist-query-service";

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

async function replacePlaylistGenres(
  dataSource: PlaylistRepositoryProvider,
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

  return dataSource.transaction(async (manager) => {
    const playlistRepository = manager.getRepository(Playlist);
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
        ? await replacePlaylistGenres(manager, playlist.id, input.genreIds)
        : [];
    return toPlaylistListItem(playlist, 0, genres);
  });
}

export async function updatePlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string,
  input: UpdatePlaylistInput
): Promise<PlaylistListItem> {
  return dataSource.transaction(async (manager) => {
    const playlistRepository = manager.getRepository(Playlist);
    const playlist = await playlistRepository.findOne({
      where: { id: playlistId },
      lock: { mode: "pessimistic_write" },
    });

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
      const nextDescription =
        normalizeOptionalText(input.description, 2000) ?? null;
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
      const nextCover =
        normalizeOptionalText(input.coverImageUrl, 1000) ?? null;
      if (playlist.coverImageUrl !== nextCover) {
        playlist.coverImageUrl = nextCover;
        changed = true;
      }
    }

    if (input.genreIds !== undefined) {
      genres = await replacePlaylistGenres(
        manager,
        playlist.id,
        input.genreIds
      );
      changed = true;
    }

    if (!changed) {
      throw new ServiceError("수정된 내용이 없습니다.", 400);
    }

    await playlistRepository.save(playlist);
    const trackCount = await manager
      .getRepository(PlaylistTrack)
      .count({ where: { playlistId: playlist.id } });

    if (genres === undefined) {
      const genresMap = await getGenresByPlaylistIds(manager, [playlist.id]);
      genres = genresMap.get(playlist.id) ?? [];
    }

    const engagement = await getPlaylistEngagementCounts(manager, [
      playlist.id,
    ]);
    return toPlaylistListItem(
      playlist,
      trackCount,
      genres,
      engagement.likeCounts.get(playlist.id) ?? 0,
      engagement.commentCounts.get(playlist.id) ?? 0
    );
  });
}

export async function deletePlaylist(
  dataSource: DataSource,
  playlistId: string,
  requesterId: string
): Promise<void> {
  const playlistRepository = dataSource.getRepository(Playlist);
  const playlist = await playlistRepository.findOne({
    where: { id: playlistId },
  });
  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }
  if (playlist.userId !== requesterId) {
    throw new ServiceError("삭제 권한이 없습니다.", 403);
  }
  await playlistRepository.remove(playlist);
}
