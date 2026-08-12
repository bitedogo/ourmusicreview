/** GET/POST/PATCH FAQ 목록·등록·정렬 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import {
  createFaq,
  listFaqs,
  reorderFaqs,
} from "@/src/lib/faq/faq-service";
import { publicCachedJson } from "@/src/lib/http/cache";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const faqs = await listFaqs(dataSource);

    return publicCachedJson(
      {
        ok: true,
        data: { faqs },
      },
      30,
      120
    );
  } catch (error) {
    return handleRouteError(error, "FAQ를 불러오는 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await request.json();
    const dataSource = await initializeDatabase();
    const result = await createFaq(dataSource, body);

    return apiOk(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "FAQ 등록 중 오류가 발생했습니다.");
  }
}

export async function PATCH(request: Request) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const body = await request.json();
    const dataSource = await initializeDatabase();
    await reorderFaqs(dataSource, body?.order);

    return apiOk({});
  } catch (error) {
    return handleRouteError(error, "FAQ 순서 저장 중 오류가 발생했습니다.");
  }
}
