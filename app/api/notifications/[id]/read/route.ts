/** POST 단건 알림 읽음 처리 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { markNotificationRead } from "@/src/lib/notifications/notification-service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { id } = await params;
    const dataSource = await initializeDatabase();
    await markNotificationRead(dataSource, session.user.id, id);
    return apiOk({}, { message: "알림을 읽음 처리했습니다." });
  } catch (error) {
    return handleRouteError(error, "알림 읽음 처리 중 오류가 발생했습니다.");
  }
}
