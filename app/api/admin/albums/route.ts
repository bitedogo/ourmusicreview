import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";

// 관리자: 전체 오늘의 앨범 목록 조회 (DISPLAY_DATE DESC)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const albums = await repo.find({
      order: { displayDate: "DESC" },
    });

    return NextResponse.json({
      ok: true,
      albums: albums.map((a) => ({
        displayDate: formatDateForApi(a.displayDate),
        title: a.title,
        artist: a.artist,
        imageUrl: a.imageUrl ?? null,
        description: a.description ?? null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 관리자: 오늘의 앨범 등록/수정 (Upsert)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { displayDate, title, artist, imageUrl, description } = body;

    if (!displayDate || !title || !artist) {
      return NextResponse.json(
        { ok: false, error: "날짜, 제목, 아티스트는 필수입니다." },
        { status: 400 }
      );
    }

    const date = parseDateFromApi(displayDate);
    if (!date) {
      return NextResponse.json(
        { ok: false, error: "날짜 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const existing = await repo.findOne({ where: { displayDate: date } });
    let entity: TodayAlbum;

    if (existing) {
      existing.title = String(title).trim();
      existing.artist = String(artist).trim();
      existing.imageUrl = imageUrl ? String(imageUrl).trim() || undefined : undefined;
      existing.description = description != null ? String(description).trim() || undefined : undefined;
      entity = existing;
    } else {
      entity = repo.create({
        displayDate: date,
        title: String(title).trim(),
        artist: String(artist).trim(),
        imageUrl: imageUrl ? String(imageUrl).trim() || undefined : undefined,
        description: description != null ? String(description).trim() || undefined : undefined,
      });
    }

    await repo.save(entity);

    return NextResponse.json({
      ok: true,
      message: existing ? "수정되었습니다." : "등록되었습니다.",
      album: {
        displayDate: formatDateForApi(entity.displayDate),
        title: entity.title,
        artist: entity.artist,
        imageUrl: entity.imageUrl ?? null,
        description: entity.description ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "저장 중 오류가 발생했습니다.",
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

function parseDateFromApi(s: string): Date | null {
  const match = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10));
  if (isNaN(date.getTime())) return null;
  return date;
}
