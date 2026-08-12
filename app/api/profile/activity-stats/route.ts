/** GET 프로필 활동 통계 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { getProfileActivityStats } from "@/src/lib/profile/profile-content-service";

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const stats = await getProfileActivityStats(dataSource, session.user.id);
    return apiOk(stats);
  } catch (error) {
    return handleRouteError(error, "활동 통계 조회 중 오류가 발생했습니다.");
  }
}
