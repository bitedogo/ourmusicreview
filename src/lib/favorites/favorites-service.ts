/** 앨범 즐겨찾기 등록·해제·조회 비즈니스 로직 */

import type { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { ensureAlbum } from "@/src/lib/albums/ensure-album";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { ServiceError } from "@/src/lib/http/service-error";
import { isUniqueViolation } from "@/src/lib/db/pg-error";

export interface ToggleFavoriteInput {
  albumId?: string;
  albumTitle?: string;
  albumArtist?: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string;
  albumReleaseType?: "album" | "single";
}

export interface AddFavoriteResult {
  favoriteId: string;
  created: boolean;
}

export async function addFavoriteAlbum(
  dataSource: DataSource,
  userId: string,
  body: ToggleFavoriteInput
): Promise<AddFavoriteResult> {
  const albumId =
    typeof body.albumId === "string" ? body.albumId.trim() : undefined;

  if (!albumId) {
    throw new ServiceError("앨범 ID는 필수입니다.", 400);
  }

  return dataSource.transaction(async (manager) => {
  const favoriteRepository = manager.getRepository(UserFavoriteAlbum);

  await ensureAlbum(
    manager,
    albumId,
    {
      title: body.albumTitle,
      artist: body.albumArtist,
      imageUrl: body.albumImageUrl,
      releaseDate: body.albumReleaseDate,
      releaseType: body.albumReleaseType,
    },
    "앨범 정보가 부족합니다. 앨범 제목과 아티스트 정보가 필요합니다."
  );

  const existing = await favoriteRepository.findOne({
    where: { userId, albumId },
  });

  if (existing) {
    return { favoriteId: existing.id, created: false };
  }

  const favoriteId = randomUUID().replace(/-/g, "").slice(0, 255);

  const favorite = favoriteRepository.create({
    id: favoriteId,
    userId,
    albumId,
  });

  try {
    await favoriteRepository.save(favorite);
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    const raced = await favoriteRepository.findOne({ where: { userId, albumId } });
    if (!raced) throw error;
    return { favoriteId: raced.id, created: false };
  }

  return { favoriteId: favorite.id, created: true };
  });
}

export async function removeFavoriteAlbum(
  dataSource: DataSource,
  userId: string,
  albumId: string | undefined
): Promise<void> {
  const trimmedAlbumId =
    typeof albumId === "string" ? albumId.trim() : undefined;

  if (!trimmedAlbumId) {
    throw new ServiceError("앨범 ID는 필수입니다.", 400);
  }

  const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

  const existing = await favoriteRepository.findOne({
    where: { userId, albumId: trimmedAlbumId },
  });

  if (!existing) {
    return;
  }

  await favoriteRepository.delete({ id: existing.id });
}

export interface UserFavoriteListItem {
  id: string;
  albumId: string;
  createdAt: Date;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl?: string | null;
    releaseDate: Date | null;
  } | null;
}

export async function getUserFavoriteAlbums(
  dataSource: DataSource,
  userId: string
): Promise<UserFavoriteListItem[]> {
  const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

  const favorites = await favoriteRepository.find({
    where: { userId },
    relations: ["album"],
    order: { createdAt: "DESC" },
  });

  return favorites.map((fav) => ({
    id: fav.id,
    albumId: fav.albumId,
    createdAt: fav.createdAt,
    album: fav.album
      ? {
          albumId: fav.album.albumId,
          title: fav.album.title,
          artist: fav.album.artist,
          imageUrl: fav.album.imageUrl,
          releaseDate: fav.album.releaseDate ?? null,
        }
      : null,
  }));
}
