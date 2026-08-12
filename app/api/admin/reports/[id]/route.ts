/** PATCH 관리자 신고 처리 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { resolveAdminReport } from "@/src/lib/admin/report-admin-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const dataSource = await initializeDatabase();
    const resolved = await resolveAdminReport(
      dataSource,
      id,
      body?.action as string | undefined
    );

    return apiOk(resolved.result, { message: resolved.message });
  } catch (error) {
    return handleRouteError(error, "신고 처리 중 오류가 발생했습니다.");
  }
}
