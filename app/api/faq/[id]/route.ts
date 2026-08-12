/** PATCH/DELETE FAQ 수정·삭제 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { deleteFaq, updateFaq } from "@/src/lib/faq/faq-service";
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
    await updateFaq(dataSource, id, body);

    return apiOk({});
  } catch (error) {
    return handleRouteError(error, "FAQ 수정 중 오류가 발생했습니다.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    const dataSource = await initializeDatabase();
    await deleteFaq(dataSource, id);

    return apiOk({});
  } catch (error) {
    return handleRouteError(error, "FAQ 삭제 중 오류가 발생했습니다.");
  }
}
