import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";

interface Body {
  nickname?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Body;
    const rawNickname =
      typeof body.nickname === "string" ? body.nickname.trim() : "";

    if (!rawNickname) {
      return NextResponse.json(
        { ok: false, error: "닉네임을 입력해주세요." },
        { status: 400 }
      );
    }

    if (rawNickname.length > 50) {
      return NextResponse.json(
        { ok: false, error: "닉네임은 50자 이하여야 합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    user.nickname = rawNickname;
    await userRepository.save(user);

    return NextResponse.json(
      {
        ok: true,
        nickname: user.nickname,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "닉네임 변경 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

