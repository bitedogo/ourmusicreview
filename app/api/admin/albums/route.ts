/** GET/POST 관리자 오늘의 앨범 목록·등록 */

import { requireAdminApi } from "@/src/lib/auth/session";
import {
  listTodayAlbums,
  upsertTodayAlbum,
} from "@/src/lib/admin/today-album-admin-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const albums = await listTodayAlbums(dataSource);
    return apiOk({ albums });
  } catch (error) {
    return handleRouteError(error, "목록 조회 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await request.json();
    const dataSource = await initializeDatabase();
    const result = await upsertTodayAlbum(dataSource, body);

    return apiOk(
      { album: result.album },
      { message: result.created ? "등록되었습니다." : "수정되었습니다." }
    );
  } catch (error) {
    return handleRouteError(error, "저장 중 오류가 발생했습니다.");
  }
}
