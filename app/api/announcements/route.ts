/** GET 헤더 공지 알림 목록 */

import { listNoticeAnnouncements } from "@/src/lib/community/community-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "10");
    const dataSource = await initializeDatabase();
    const items = await listNoticeAnnouncements(dataSource, limit);
    return apiOk({ items });
  } catch (error) {
    return handleRouteError(error, "공지 알림 조회 중 오류가 발생했습니다.");
  }
}
