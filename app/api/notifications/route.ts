/** GET/PATCH 내 알림 목록·읽음 처리 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  listNotifications,
  markAllNotificationsRead,
} from "@/src/lib/notifications/notification-service";

export async function GET(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";
    const dataSource = await initializeDatabase();
    const result = await listNotifications(
      dataSource,
      session.user.id,
      limit,
      unreadOnly
    );
    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "알림 목록 조회 중 오류가 발생했습니다.");
  }
}

export async function PATCH() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await markAllNotificationsRead(dataSource, session.user.id);
    return apiOk({}, { message: "모든 알림을 읽음 처리했습니다." });
  } catch (error) {
    return handleRouteError(error, "알림 읽음 처리 중 오류가 발생했습니다.");
  }
}
