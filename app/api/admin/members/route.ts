import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const users = await userRepository.find({
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      ok: true,
      members: users.map((user) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "멤버 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
