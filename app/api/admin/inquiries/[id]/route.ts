/** GET/PATCH 관리자 문의 상세·종료 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  closeInquiry,
  getAdminInquiryDetail,
} from "@/src/lib/inquiries/inquiry-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdminApi();
    if (response) return response;

    const { id } = await context.params;
    const dataSource = await initializeDatabase();
    const inquiry = await getAdminInquiryDetail(
      dataSource,
      id,
      session.user.id
    );
    return apiOk({ inquiry });
  } catch (error) {
    return handleRouteError(error, "문의 조회 중 오류가 발생했습니다.");
  }
}

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await context.params;
    const dataSource = await initializeDatabase();
    const inquiry = await closeInquiry(dataSource, id);
    return apiOk({ inquiry }, { message: "문의를 종료했습니다." });
  } catch (error) {
    return handleRouteError(error, "문의 종료 중 오류가 발생했습니다.");
  }
}
