/** GET 문의 상세 */

import { isAdmin, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { getInquiryDetail } from "@/src/lib/inquiries/inquiry-service";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { id } = await context.params;
    const dataSource = await initializeDatabase();
    const inquiry = await getInquiryDetail(dataSource, id, {
      userId: session.user.id,
      isAdmin: isAdmin(session),
    });
    return apiOk({ inquiry });
  } catch (error) {
    return handleRouteError(error, "문의 조회 중 오류가 발생했습니다.");
  }
}
