/** PATCH/DELETE 관리자 오늘의 앨범 수정·삭제 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { TodayAlbum } from "@/src/lib/db/entities/TodayAlbum";
import { apiError, apiOk } from "@/src/lib/http/response";

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
    const { response } = await requireAdminApi();
    if (response) return response;

    const { displayDate } = await params;
    const decoded = decodeURIComponent(displayDate);
    const date = parseDateFromApi(decoded);

    if (!date) {
      return apiError("날짜 형식이 올바르지 않습니다.", { status: 400 });
    }

    const body = await request.json();
    const { title, artist, imageUrl, description, albumId } = body;

    if (!title || !artist) {
      return apiError("제목, 아티스트는 필수입니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);
    const entity = await repo.findOne({ where: { displayDate: date } });

    if (!entity) {
      return apiError("해당 날짜의 앨범을 찾을 수 없습니다.", { status: 404 });
    }

    entity.albumId = albumId != null ? String(albumId).trim() || undefined : undefined;
    entity.title = String(title).trim();
    entity.artist = String(artist).trim();
    entity.imageUrl = imageUrl ? String(imageUrl).trim() || undefined : undefined;
    entity.description = description != null ? String(description).trim() || undefined : undefined;

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
      { message: "수정되었습니다." }
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "수정 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ displayDate: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { displayDate } = await params;
    const decoded = decodeURIComponent(displayDate);
    const date = parseDateFromApi(decoded);

    if (!date) {
      return apiError("날짜 형식이 올바르지 않습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const repo = dataSource.getRepository(TodayAlbum);
    const entity = await repo.findOne({ where: { displayDate: date } });

    if (!entity) {
      return apiError("해당 날짜의 앨범을 찾을 수 없습니다.", { status: 404 });
    }

    await repo.remove(entity);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
