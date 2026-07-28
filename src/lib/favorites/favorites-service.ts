/** 앨범 즐겨찾기 등록·해제·조회 비즈니스 로직 */

import type { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { Album } from "@/src/lib/db/entities/Album";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { ServiceError } from "@/src/lib/http/service-error";

export interface ToggleFavoriteInput {
  albumId?: string;
  albumTitle?: string;
  albumArtist?: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string;
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

  const albumRepository = dataSource.getRepository(Album);
  const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);

  let album = await albumRepository.findOne({ where: { albumId } });

  if (!album) {
    const albumTitle =
      typeof body.albumTitle === "string" ? body.albumTitle.trim() : undefined;
    const albumArtist =
      typeof body.albumArtist === "string" ? body.albumArtist.trim() : undefined;
    const albumImageUrl =
      typeof body.albumImageUrl === "string" && body.albumImageUrl.length > 0
        ? body.albumImageUrl
        : null;

    if (!albumTitle || !albumArtist) {
      throw new ServiceError(
        "앨범 정보가 부족합니다. 앨범 제목과 아티스트 정보가 필요합니다.",
        400
      );
    }

    let releaseDate: Date | undefined = undefined;
    if (body.albumReleaseDate) {
      const parsed = new Date(body.albumReleaseDate);
      if (!isNaN(parsed.getTime())) {
        releaseDate = parsed;
      }
    }

    const newAlbum = albumRepository.create({
      albumId,
      title: albumTitle,
      artist: albumArtist,
      imageUrl: albumImageUrl || undefined,
      releaseDate,
      category: "I",
    });

    await albumRepository.save(newAlbum);
    album = newAlbum;
  }

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

  await favoriteRepository.save(favorite);

  return { favoriteId: favorite.id, created: true };
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
