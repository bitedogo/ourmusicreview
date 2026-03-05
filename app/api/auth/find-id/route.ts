import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "해당 이메일로 등록된 계정이 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      id: user.id,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "아이디 찾기 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
