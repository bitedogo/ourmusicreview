import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const albums = await repo.find({
      order: { displayDate: "DESC" },
    });

    return apiOk({
      albums: albums.map((a) => ({
        displayDate: formatDateForApi(a.displayDate),
        albumId: a.albumId ?? null,
        title: a.title,
        artist: a.artist,
        imageUrl: a.imageUrl ?? null,
        description: a.description ?? null,
      })),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await request.json();
    const { displayDate, title, artist, imageUrl, description, albumId } = body;

    if (!displayDate || !title || !artist) {
      return apiError("날짜, 제목, 아티스트는 필수입니다.", { status: 400 });
    }

    const date = parseDateFromApi(displayDate);
    if (!date) {
      return apiError("날짜 형식이 올바르지 않습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);

    const existing = await repo.findOne({ where: { displayDate: date } });
    const albumIdStr = albumId != null ? String(albumId).trim() || undefined : undefined;
    let entity: TodayAlbum;

    if (existing) {
      existing.albumId = albumIdStr;
      existing.title = String(title).trim();
      existing.artist = String(artist).trim();
      existing.imageUrl = imageUrl ? String(imageUrl).trim() || undefined : undefined;
      existing.description = description != null ? String(description).trim() || undefined : undefined;
      entity = existing;
    } else {
      entity = repo.create({
        displayDate: date,
        albumId: albumIdStr,
        title: String(title).trim(),
        artist: String(artist).trim(),
        imageUrl: imageUrl ? String(imageUrl).trim() || undefined : undefined,
        description: description != null ? String(description).trim() || undefined : undefined,
      });
    }

    await repo.save(entity);

    return apiOk(
      {
        album: {
          displayDate: formatDateForApi(entity.displayDate),
          albumId: entity.albumId ?? null,
          title: entity.title,
          artist: entity.artist,
          imageUrl: entity.imageUrl ?? null,
          description: entity.description ?? null,
        },
      },
      { message: existing ? "수정되었습니다." : "등록되었습니다." }
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "저장 중 오류가 발생했습니다.",
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
