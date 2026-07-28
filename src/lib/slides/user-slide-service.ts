/** 유저 마이페이지 슬라이드(명반) 목록 관리 비즈니스 로직 */

import type { DataSource } from "typeorm";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import { getAlbumById } from "@/src/lib/album-lookup";
import { ServiceError } from "@/src/lib/http/service-error";
import { applyPositionOrder, reindexPositions } from "@/src/lib/utils/reorder";

export const USER_SLIDE_MIN_FOR_SLIDE = 15;
export const USER_SLIDE_MAX_COUNT = 30;

export interface UserSlideAlbumDto {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

export interface UserSlideListResult {
  albums: UserSlideAlbumDto[];
  count: number;
  minForSlide: number;
  maxCount: number;
}

function toDto(row: UserSlideAlbum): UserSlideAlbumDto {
  return {
    id: row.id,
    position: row.position,
    collectionId: row.collectionId,
    title: row.title,
    artist: row.artist,
    imageUrl: row.imageUrl ?? null,
    releaseDate: row.releaseDate ?? "",
    genre: row.genre ?? "",
  };
}

export async function listUserSlideAlbums(
  dataSource: DataSource,
  userId: string
): Promise<UserSlideListResult> {
  const repo = dataSource.getRepository(UserSlideAlbum);
  const rows = await repo.find({
    where: { userId },
    order: { position: "ASC" },
  });
  const albums = rows.map(toDto);

  return {
    albums,
    count: albums.length,
    minForSlide: USER_SLIDE_MIN_FOR_SLIDE,
    maxCount: USER_SLIDE_MAX_COUNT,
  };
}

export async function addUserSlideAlbum(
  dataSource: DataSource,
  userId: string,
  collectionId: string
): Promise<UserSlideAlbumDto> {
  const trimmed = collectionId.trim();
  if (!trimmed) {
    throw new ServiceError("유효한 앨범을 선택해 주세요.", 400);
  }

  const repo = dataSource.getRepository(UserSlideAlbum);

  const currentCount = await repo.count({ where: { userId } });
  if (currentCount >= USER_SLIDE_MAX_COUNT) {
    throw new ServiceError(`최대 ${USER_SLIDE_MAX_COUNT}개까지 등록할 수 있습니다.`, 400);
  }

  const existing = await repo.findOne({
    where: { userId, collectionId: trimmed },
  });
  if (existing) {
    throw new ServiceError("이미 등록된 앨범입니다.", 400);
  }

  const albumInfo = await getAlbumById(trimmed);
  if (!albumInfo) {
    throw new ServiceError("앨범 정보를 가져올 수 없습니다.", 400);
  }

  const position = currentCount + 1;
  const entity = repo.create({
    id: crypto.randomUUID(),
    userId,
    position,
    collectionId: albumInfo.collectionId,
    title: albumInfo.title,
    artist: albumInfo.artist,
    imageUrl: albumInfo.imageUrl ?? undefined,
    releaseDate: albumInfo.releaseDate || undefined,
    genre: albumInfo.genre || undefined,
  });
  await repo.save(entity);

  return toDto(entity);
}

export async function removeUserSlideAlbum(
  dataSource: DataSource,
  userId: string,
  id: string
): Promise<void> {
  if (!id.trim()) {
    throw new ServiceError("삭제할 항목 id가 필요합니다.", 400);
  }

  const repo = dataSource.getRepository(UserSlideAlbum);
  const entity = await repo.findOne({ where: { id: id.trim(), userId } });
  if (!entity) {
    throw new ServiceError("해당 항목을 찾을 수 없습니다.", 404);
  }

  await repo.remove(entity);

  const remaining = await repo.find({
    where: { userId },
    order: { position: "ASC" },
  });
  await reindexPositions(repo, remaining);
}

export async function reorderUserSlideAlbums(
  dataSource: DataSource,
  userId: string,
  order: unknown
): Promise<void> {
  if (!Array.isArray(order) || order.some((x: unknown) => typeof x !== "string")) {
    throw new ServiceError("order는 id 문자열 배열이어야 합니다.", 400);
  }

  const repo = dataSource.getRepository(UserSlideAlbum);
  const all = await repo.find({ where: { userId } });
  await applyPositionOrder(repo, all, order as string[]);
}
