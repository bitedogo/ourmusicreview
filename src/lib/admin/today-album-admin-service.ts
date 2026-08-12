/** 관리자 오늘의 앨범 */

import type { DataSource } from "typeorm";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { ServiceError } from "@/src/lib/http/service-error";

export function formatTodayAlbumDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseTodayAlbumDate(s: string): Date {
  const match = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    throw new ServiceError("날짜 형식이 올바르지 않습니다.", 400);
  }
  const [, y, m, d] = match;
  const date = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10));
  if (isNaN(date.getTime())) {
    throw new ServiceError("날짜 형식이 올바르지 않습니다.", 400);
  }
  return date;
}

function toAlbumDto(entity: TodayAlbum) {
  return {
    displayDate: formatTodayAlbumDate(entity.displayDate),
    albumId: entity.albumId ?? null,
    title: entity.title,
    artist: entity.artist,
    imageUrl: entity.imageUrl ?? null,
    description: entity.description ?? null,
  };
}

export async function listTodayAlbums(dataSource: DataSource) {
  const albums = await dataSource.getRepository(TodayAlbum).find({
    order: { displayDate: "DESC" },
  });
  return albums.map(toAlbumDto);
}

export async function upsertTodayAlbum(
  dataSource: DataSource,
  input: {
    displayDate: unknown;
    title: unknown;
    artist: unknown;
    imageUrl?: unknown;
    description?: unknown;
    albumId?: unknown;
  }
) {
  if (!input.displayDate || !input.title || !input.artist) {
    throw new ServiceError("날짜, 제목, 아티스트는 필수입니다.", 400);
  }

  const date = parseTodayAlbumDate(String(input.displayDate));
  const repo = dataSource.getRepository(TodayAlbum);
  const existing = await repo.findOne({ where: { displayDate: date } });
  const albumIdStr =
    input.albumId != null ? String(input.albumId).trim() || undefined : undefined;

  let entity: TodayAlbum;
  if (existing) {
    existing.albumId = albumIdStr;
    existing.title = String(input.title).trim();
    existing.artist = String(input.artist).trim();
    existing.imageUrl = input.imageUrl
      ? String(input.imageUrl).trim() || undefined
      : undefined;
    existing.description =
      input.description != null
        ? String(input.description).trim() || undefined
        : undefined;
    entity = existing;
  } else {
    entity = repo.create({
      displayDate: date,
      albumId: albumIdStr,
      title: String(input.title).trim(),
      artist: String(input.artist).trim(),
      imageUrl: input.imageUrl
        ? String(input.imageUrl).trim() || undefined
        : undefined,
      description:
        input.description != null
          ? String(input.description).trim() || undefined
          : undefined,
    });
  }

  await repo.save(entity);
  return {
    album: toAlbumDto(entity),
    created: !existing,
  };
}

export async function updateTodayAlbum(
  dataSource: DataSource,
  displayDateRaw: string,
  input: {
    title: unknown;
    artist: unknown;
    imageUrl?: unknown;
    description?: unknown;
    albumId?: unknown;
  }
) {
  if (!input.title || !input.artist) {
    throw new ServiceError("제목, 아티스트는 필수입니다.", 400);
  }

  const date = parseTodayAlbumDate(decodeURIComponent(displayDateRaw));
  const repo = dataSource.getRepository(TodayAlbum);
  const entity = await repo.findOne({ where: { displayDate: date } });
  if (!entity) {
    throw new ServiceError("해당 날짜의 앨범을 찾을 수 없습니다.", 404);
  }

  entity.albumId =
    input.albumId != null ? String(input.albumId).trim() || undefined : undefined;
  entity.title = String(input.title).trim();
  entity.artist = String(input.artist).trim();
  entity.imageUrl = input.imageUrl
    ? String(input.imageUrl).trim() || undefined
    : undefined;
  entity.description =
    input.description != null
      ? String(input.description).trim() || undefined
      : undefined;

  await repo.save(entity);
  return { album: toAlbumDto(entity) };
}

export async function deleteTodayAlbum(
  dataSource: DataSource,
  displayDateRaw: string
) {
  const date = parseTodayAlbumDate(decodeURIComponent(displayDateRaw));
  const repo = dataSource.getRepository(TodayAlbum);
  const entity = await repo.findOne({ where: { displayDate: date } });
  if (!entity) {
    throw new ServiceError("해당 날짜의 앨범을 찾을 수 없습니다.", 404);
  }
  await repo.remove(entity);
}
