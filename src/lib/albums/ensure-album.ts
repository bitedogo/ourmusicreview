/** 앨범 참조 생성 시 사용하는 공통 조회·정규화 로직 */

import type { DataSource, EntityManager } from "typeorm";
import { Album } from "@/src/lib/db/entities/Album";
import { isUniqueViolation } from "@/src/lib/db/pg-error";
import { ServiceError } from "@/src/lib/http/service-error";

type RepositoryProvider = DataSource | EntityManager;

export interface EnsureAlbumInput {
  title?: unknown;
  artist?: unknown;
  imageUrl?: unknown;
  releaseDate?: unknown;
}

export async function ensureAlbum(
  dataSource: RepositoryProvider,
  albumId: string,
  input: EnsureAlbumInput,
  missingMetadataMessage: string
): Promise<Album> {
  const albumRepository = dataSource.getRepository(Album);
  const existing = await albumRepository.findOne({ where: { albumId } });
  if (existing) return existing;

  const title =
    typeof input.title === "string" ? input.title.trim() : undefined;
  const artist =
    typeof input.artist === "string" ? input.artist.trim() : undefined;
  const imageUrl =
    typeof input.imageUrl === "string" && input.imageUrl.length > 0
      ? input.imageUrl
      : undefined;

  if (!title || !artist) {
    throw new ServiceError(missingMetadataMessage, 400);
  }

  let releaseDate: Date | undefined;
  if (input.releaseDate) {
    const parsed = new Date(input.releaseDate as string | number | Date);
    if (!Number.isNaN(parsed.getTime())) {
      releaseDate = parsed;
    }
  }

  const created = albumRepository.create({
    albumId,
    title,
    artist,
    imageUrl,
    releaseDate,
    category: "I",
  });

  try {
    return await albumRepository.save(created);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const raced = await albumRepository.findOne({ where: { albumId } });
    if (!raced) throw error;
    return raced;
  }
}
