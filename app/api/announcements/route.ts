/** GET/PATCH 헤더 공지 목록·읽음 처리 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { listNoticeAnnouncements } from "@/src/lib/community/community-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  countUnreadAnnouncements,
  markAnnouncementsSeen,
} from "@/src/lib/notifications/announcement-read-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "10");
    const dataSource = await initializeDatabase();
    const items = await listNoticeAnnouncements(dataSource, limit);
    const session = await getAppSession();
    const unreadCount = session?.user?.id
      ? await countUnreadAnnouncements(dataSource, session.user.id)
      : 0;
    return apiOk({ items, unreadCount });
  } catch (error) {
    return handleRouteError(error, "공지 알림 조회 중 오류가 발생했습니다.");
  }
}

export async function PATCH() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await markAnnouncementsSeen(dataSource, session.user.id);
    return apiOk({}, { message: "공지를 읽음 처리했습니다." });
  } catch (error) {
    return handleRouteError(error, "공지 읽음 처리 중 오류가 발생했습니다.");
  }
}
