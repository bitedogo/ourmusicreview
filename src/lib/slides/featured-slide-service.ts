/** 관리자 홈 Featured 슬라이드 목록 관리 비즈니스 로직 */

import type { DataSource } from "typeorm";
import { FeaturedSlideAlbum } from "@/src/lib/db/entities/FeaturedSlideAlbum";
import { getAlbumById } from "@/src/lib/album-lookup";
import { ServiceError } from "@/src/lib/http/service-error";
import { applyPositionOrder, reindexPositions } from "@/src/lib/utils/reorder";

export const FEATURED_SLIDE_MIN_COUNT = 10;
export const FEATURED_SLIDE_MAX_COUNT = 30;

export interface FeaturedSlideAlbumDto {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

export interface FeaturedSlideListResult {
  albums: FeaturedSlideAlbumDto[];
}

function toDto(row: FeaturedSlideAlbum): FeaturedSlideAlbumDto {
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

export async function listFeaturedSlideAlbums(
  dataSource: DataSource
): Promise<FeaturedSlideListResult> {
  const repo = dataSource.getRepository(FeaturedSlideAlbum);
  const rows = await repo.find({ order: { position: "ASC" } });
  return { albums: rows.map(toDto) };
}

export async function addFeaturedSlideAlbum(
  dataSource: DataSource,
  collectionId: string
): Promise<FeaturedSlideAlbumDto> {
  const trimmed = collectionId.trim();
  if (!trimmed) {
    throw new ServiceError("유효한 앨범(collectionId)을 선택해 주세요.", 400);
  }

  const repo = dataSource.getRepository(FeaturedSlideAlbum);
  const currentCount = await repo.count();
  if (currentCount >= FEATURED_SLIDE_MAX_COUNT) {
    throw new ServiceError(`최대 ${FEATURED_SLIDE_MAX_COUNT}개까지 등록할 수 있습니다.`, 400);
  }

  const existing = await repo.findOne({
    where: { collectionId: trimmed },
  });
  if (existing) {
    throw new ServiceError("이미 슬라이드바에 등록된 앨범입니다.", 400);
  }

  const albumInfo = await getAlbumById(trimmed);
  if (!albumInfo) {
    throw new ServiceError("앨범 정보를 가져올 수 없습니다.", 400);
  }

  const position = currentCount + 1;
  const entity = repo.create({
    id: crypto.randomUUID(),
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

export async function removeFeaturedSlideAlbum(
  dataSource: DataSource,
  id: string
): Promise<void> {
  if (!id.trim()) {
    throw new ServiceError("삭제할 항목 id가 필요합니다.", 400);
  }

  const repo = dataSource.getRepository(FeaturedSlideAlbum);
  const currentCount = await repo.count();
  if (currentCount <= FEATURED_SLIDE_MIN_COUNT) {
    throw new ServiceError(`최소 ${FEATURED_SLIDE_MIN_COUNT}개는 유지해야 합니다.`, 400);
  }

  const entity = await repo.findOne({ where: { id: id.trim() } });
  if (!entity) {
    throw new ServiceError("해당 항목을 찾을 수 없습니다.", 404);
  }

  await repo.remove(entity);

  const remaining = await repo.find({ order: { position: "ASC" } });
  await reindexPositions(repo, remaining);
}

export async function reorderFeaturedSlideAlbums(
  dataSource: DataSource,
  order: unknown
): Promise<void> {
  if (!Array.isArray(order) || order.some((x: unknown) => typeof x !== "string")) {
    throw new ServiceError("order는 id 문자열 배열이어야 합니다.", 400);
  }

  const repo = dataSource.getRepository(FeaturedSlideAlbum);
  const all = await repo.find();
  await applyPositionOrder(repo, all, order as string[]);
}
