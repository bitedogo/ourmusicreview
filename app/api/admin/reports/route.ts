/** GET 관리자 신고 목록 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { listAdminReports } from "@/src/lib/admin/report-admin-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const reports = await listAdminReports(dataSource);
    return apiOk({ reports });
  } catch (error) {
    return handleRouteError(error, "신고 목록 조회 중 오류가 발생했습니다.");
  }
}
