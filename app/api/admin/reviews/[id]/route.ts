/** PATCH 관리자 리뷰 승인·반려 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { moderateReview } from "@/src/lib/admin/review-admin-service";
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
    const body = await request.json();
    const dataSource = await initializeDatabase();
    const result = await moderateReview(dataSource, id, body);

    return apiOk({ review: result.review }, { message: result.message });
  } catch (error) {
    return handleRouteError(error, "리뷰 처리 중 오류가 발생했습니다.");
  }
}
