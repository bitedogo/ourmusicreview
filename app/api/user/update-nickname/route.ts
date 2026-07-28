/** POST 닉네임 변경 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";

interface Body {
  nickname?: string;
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as Body;
    const rawNickname =
      typeof body.nickname === "string" ? body.nickname.trim() : "";

    if (!rawNickname) {
      return apiError("닉네임을 입력해주세요.", { status: 400 });
    }

    if (rawNickname.length > 50) {
      return apiError("닉네임은 50자 이하여야 합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    user.nickname = rawNickname;
    await userRepository.save(user);

    return apiOk({ nickname: user.nickname });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "닉네임 변경 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

