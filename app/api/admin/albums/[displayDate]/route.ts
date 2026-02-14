import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";

function parseDateFromApi(s: string): Date | null {
  const match = String(s).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(parseInt(y!, 10), parseInt(m!, 10) - 1, parseInt(d!, 10));
  if (isNaN(date.getTime())) return null;
  return date;
}

function formatDateForApi(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ displayDate: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { displayDate } = await params;
    const decoded = decodeURIComponent(displayDate);
    const date = parseDateFromApi(decoded);

    if (!date) {
      return NextResponse.json(
        { ok: false, error: "날짜 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, artist, imageUrl, description } = body;

    if (!title || !artist) {
      return NextResponse.json(
        { ok: false, error: "제목, 아티스트는 필수입니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);
    const entity = await repo.findOne({ where: { displayDate: date } });

    if (!entity) {
      return NextResponse.json(
        { ok: false, error: "해당 날짜의 앨범을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    entity.title = String(title).trim();
    entity.artist = String(artist).trim();
    entity.imageUrl = imageUrl ? String(imageUrl).trim() || undefined : undefined;
    entity.description = description != null ? String(description).trim() || undefined : undefined;

    await repo.save(entity);

    return NextResponse.json({
      ok: true,
      message: "수정되었습니다.",
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
            : "수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ displayDate: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { displayDate } = await params;
    const decoded = decodeURIComponent(displayDate);
    const date = parseDateFromApi(decoded);

    if (!date) {
      return NextResponse.json(
        { ok: false, error: "날짜 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);
    const entity = await repo.findOne({ where: { displayDate: date } });

    if (!entity) {
      return NextResponse.json(
        { ok: false, error: "해당 날짜의 앨범을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await repo.remove(entity);

    return NextResponse.json({
      ok: true,
      message: "삭제되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
