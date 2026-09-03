/** POST 관리자 문의 답변 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { addInquiryReply } from "@/src/lib/inquiries/inquiry-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdminApi();
    if (response) return response;

    const { id } = await context.params;
    const body = (await request.json()) as { body?: unknown };
    const dataSource = await initializeDatabase();
    const reply = await addInquiryReply(dataSource, id, {
      userId: session.user.id,
      isAdmin: true,
    }, body.body);
    return apiOk({ reply }, { message: "답변이 등록되었습니다." });
  } catch (error) {
    return handleRouteError(error, "답변 등록 중 오류가 발생했습니다.");
  }
}
