/** GET DB 연결 테스트 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { getServerEnv } from "@/src/lib/env";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const env = getServerEnv();
    if (env.nodeEnv === "production") {
      return apiError("지원하지 않는 요청입니다.", { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session?.user?.id || role !== "ADMIN") {
      return apiError("권한이 없습니다.", { status: 403 });
    }

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
