/** GET 오늘의 앨범 */

import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";
import type { TodayAlbumPayload } from "@/src/lib/today-album/types";

export type { TodayAlbumPayload };

function getTodayKST(): Date {
  const kstDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  return new Date(`${kstDateStr}T00:00:00.000Z`);
}

function shiftDate(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDateForApi(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toAlbumPayload(entity: TodayAlbum): TodayAlbumPayload {
  return {
    displayDate: formatDateForApi(entity.displayDate),
    albumId: entity.albumId ?? null,
    title: entity.title,
    artist: entity.artist,
    imageUrl: entity.imageUrl ?? null,
    description: entity.description ?? null,
  };
}

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const today = getTodayKST();
    const yesterday = shiftDate(today, -1);
    const twoDaysAgo = shiftDate(today, -2);

    const [todayAlbum, yesterdayAlbum, previousAlbum] = await Promise.all([
      repo.findOne({ where: { displayDate: today } }),
      repo.findOne({ where: { displayDate: yesterday } }),
      repo.findOne({ where: { displayDate: twoDaysAgo } }),
    ]);

    return publicCachedJson(
      {
        ok: true,
        albums: {
          today: todayAlbum ? toAlbumPayload(todayAlbum) : null,
          yesterday: yesterdayAlbum ? toAlbumPayload(yesterdayAlbum) : null,
          previous: previousAlbum ? toAlbumPayload(previousAlbum) : null,
        },
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
