import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { getServerEnv } from "@/src/lib/env";

/**
 * DB 연결 테스트용 API
 * GET /api/db-test 로 호출하여 연결 상태 확인
 */
export async function GET() {
  try {
    getServerEnv();

    const dataSource = await initializeDatabase();

    // 간단한 쿼리로 연결 테스트 (SELECT 1)
    await dataSource.query("SELECT 1");

    return NextResponse.json({
      ok: true,
      message: "DB 연결 성공",
      database: "PostgreSQL (Supabase)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isAuthError = message.includes("password") || message.includes("authentication");
    const isNetworkError = message.includes("ECONNREFUSED") || message.includes("ENOTFOUND") || message.includes("timeout");

    let hint = "";
    if (isAuthError) {
      hint = "DATABASE_URL의 비밀번호가 맞는지 Supabase Dashboard에서 확인하세요.";
    } else if (isNetworkError) {
      hint = "인터넷 연결 또는 Supabase 서버 상태를 확인하세요.";
    } else {
      hint = "Supabase Dashboard > Project Settings > Database 에서 연결 문자열을 확인하세요.";
    }

    return NextResponse.json(
      {
        ok: false,
        error: message,
        hint,
      },
      { status: 500 }
    );
  }
}
