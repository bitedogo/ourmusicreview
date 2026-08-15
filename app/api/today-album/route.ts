/** GET 오늘의 앨범 */

import { LessThanOrEqual } from "typeorm";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";
import {
  formatTodayAlbumIsoDate,
  getTodayKstDate,
  shiftUtcDate,
} from "@/src/lib/today-album/dates";
import type {
  TodayAlbumArchiveItem,
  TodayAlbumPayload,
} from "@/src/lib/today-album/types";

export type { TodayAlbumPayload };

function toAlbumPayload(entity: TodayAlbum): TodayAlbumPayload {
  return {
    displayDate: formatTodayAlbumIsoDate(entity.displayDate),
    albumId: entity.albumId ?? null,
    title: entity.title,
    artist: entity.artist,
    imageUrl: entity.imageUrl ?? null,
    description: entity.description ?? null,
  };
}

function toArchiveItem(entity: TodayAlbum): TodayAlbumArchiveItem {
  return {
    displayDate: formatTodayAlbumIsoDate(entity.displayDate),
    albumId: entity.albumId ?? null,
    title: entity.title,
    artist: entity.artist,
    imageUrl: entity.imageUrl ?? null,
  };
}

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const today = getTodayKstDate();
    const yesterday = shiftUtcDate(today, -1);
    const twoDaysAgo = shiftUtcDate(today, -2);

    const [todayAlbum, yesterdayAlbum, previousAlbums] = await Promise.all([
      repo.findOne({ where: { displayDate: today } }),
      repo.findOne({ where: { displayDate: yesterday } }),
      repo.find({
        where: { displayDate: LessThanOrEqual(twoDaysAgo) },
        order: { displayDate: "DESC" },
        select: ["displayDate", "albumId", "title", "artist", "imageUrl"],
      }),
    ]);

    const archive = previousAlbums.map(toArchiveItem);
    const latestPrevious = archive[0];

    return publicCachedJson(
      {
        ok: true,
        albums: {
          today: todayAlbum ? toAlbumPayload(todayAlbum) : null,
          yesterday: yesterdayAlbum ? toAlbumPayload(yesterdayAlbum) : null,
          previous: latestPrevious
            ? { ...latestPrevious, description: null }
            : null,
        },
        archive,
      },
      60,
      300
    );
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "오늘의 앨범 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
