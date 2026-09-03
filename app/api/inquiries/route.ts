/** 내 문의 목록·작성 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  createInquiry,
  listMyInquiries,
} from "@/src/lib/inquiries/inquiry-service";

export async function GET(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const dataSource = await initializeDatabase();
    const data = await listMyInquiries(dataSource, session.user.id, page);
    return apiOk(data);
  } catch (error) {
    return handleRouteError(error, "문의 목록 조회 중 오류가 발생했습니다.");
  }
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as Record<string, unknown>;
    const dataSource = await initializeDatabase();
    const item = await createInquiry(dataSource, session.user.id, body);
    return apiOk(item, { status: 201, message: "문의가 접수되었습니다." });
  } catch (error) {
    return handleRouteError(error, "문의 접수 중 오류가 발생했습니다.");
  }
}
