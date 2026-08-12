/** PATCH/DELETE 관리자 오늘의 앨범 수정·삭제 */

import { requireAdminApi } from "@/src/lib/auth/session";
import {
  deleteTodayAlbum,
  updateTodayAlbum,
} from "@/src/lib/admin/today-album-admin-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ displayDate: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { displayDate } = await params;
    const body = await request.json();
    const dataSource = await initializeDatabase();
    const result = await updateTodayAlbum(dataSource, displayDate, body);

    return apiOk({ album: result.album }, { message: "수정되었습니다." });
  } catch (error) {
    return handleRouteError(error, "수정 중 오류가 발생했습니다.");
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
    const dataSource = await initializeDatabase();
    await deleteTodayAlbum(dataSource, displayDate);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (error) {
    return handleRouteError(error, "삭제 중 오류가 발생했습니다.");
  }
}
