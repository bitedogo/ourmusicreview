/** POST 콘텐츠 신고 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { createReport } from "@/src/lib/engagement/report-service";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = await request.json();
    const dataSource = await initializeDatabase();
    const result = await createReport(dataSource, session.user.id, body);

    return apiOk(result, { message: "신고가 접수되었습니다." });
  } catch (error) {
    return handleRouteError(error, "신고 접수 중 오류가 발생했습니다.");
  }
}
