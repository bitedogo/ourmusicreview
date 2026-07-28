/** GET DB 연결 테스트 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { getServerEnv } from "@/src/lib/env";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const env = getServerEnv();
    if (env.nodeEnv === "production") {
      return apiError("지원하지 않는 요청입니다.", { status: 404 });
    }

    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();

    await dataSource.query("SELECT 1");

    return apiOk({
      message: "DB 연결 성공",
      database: "PostgreSQL (Supabase)",
    });
  } catch {
    return apiError("DB 상태 점검 중 오류가 발생했습니다.", { status: 500 });
  }
}
