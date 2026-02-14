import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { LessThanOrEqual } from "typeorm";

function getTodayKST(): Date {
  const kstDateStr = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
  return new Date(`${kstDateStr}T00:00:00.000Z`);
}

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const today = getTodayKST();

    const todayAlbum = await repo.findOne({
      where: {
        displayDate: today,
      },
    });

    if (todayAlbum) {
      return NextResponse.json({
        ok: true,
        album: {
          displayDate: formatDateForApi(todayAlbum.displayDate),
          title: todayAlbum.title,
          artist: todayAlbum.artist,
          imageUrl: todayAlbum.imageUrl ?? null,
          description: todayAlbum.description ?? null,
        },
      });
    }

    const pastAlbum = await repo.findOne({
      where: {
        displayDate: LessThanOrEqual(today),
      },
      order: { displayDate: "DESC" },
    });

    if (pastAlbum) {
      return NextResponse.json({
        ok: true,
        album: {
          displayDate: formatDateForApi(pastAlbum.displayDate),
          title: pastAlbum.title,
          artist: pastAlbum.artist,
          imageUrl: pastAlbum.imageUrl ?? null,
          description: pastAlbum.description ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true, album: null });
  } catch (error) {
    return NextResponse.json(
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

function formatDateForApi(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
