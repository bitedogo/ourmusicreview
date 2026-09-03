/** GET 관리자 문의 목록 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { listAdminInquiries } from "@/src/lib/inquiries/inquiry-service";
import type { InquiryStatus } from "@/src/lib/inquiries/types";
import { INQUIRY_STATUSES } from "@/src/lib/inquiries/types";

function parseStatus(value: string | null): InquiryStatus | undefined {
  if (!value) return undefined;
  return INQUIRY_STATUSES.includes(value as InquiryStatus)
    ? (value as InquiryStatus)
    : undefined;
}

export async function GET(request: Request) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const status = parseStatus(searchParams.get("status"));

    const dataSource = await initializeDatabase();
    const data = await listAdminInquiries(dataSource, page, 20, status);
    return apiOk(data);
  } catch (error) {
    return handleRouteError(error, "문의 목록 조회 중 오류가 발생했습니다.");
  }
}
