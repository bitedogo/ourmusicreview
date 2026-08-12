/** GET 관리자 리뷰 승인 대기 목록 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { listPendingReviews } from "@/src/lib/admin/review-admin-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const reviews = await listPendingReviews(dataSource);
    return apiOk({ reviews });
  } catch (error) {
    return handleRouteError(error, "리뷰 목록 조회 중 오류가 발생했습니다.");
  }
}
