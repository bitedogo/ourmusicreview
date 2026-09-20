/** POST 닉네임 변경 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { sanitizeText, validateNickname } from "@/src/lib/auth/validation";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { isUniqueViolation } from "@/src/lib/db/pg-error";
import { apiError, apiOk } from "@/src/lib/http/response";

const NICKNAME_TAKEN_MESSAGE = "이미 사용 중인 닉네임입니다.";

interface Body {
  nickname?: string;
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as Body;
    const nickname = sanitizeText(body?.nickname);
    const nickError = validateNickname(nickname);
    if (nickError) {
      return apiError(nickError, { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    if (user.nickname === nickname) {
      return apiOk({ nickname: user.nickname });
    }

    const taken = await userRepository
      .createQueryBuilder("user")
      .where("LOWER(BTRIM(user.nickname)) = LOWER(:nickname)", { nickname })
      .andWhere("user.id != :userId", { userId: user.id })
      .getOne();

    if (taken) {
      return apiError(NICKNAME_TAKEN_MESSAGE, { status: 409 });
    }

    user.nickname = nickname;
    try {
      await userRepository.save(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        return apiError(NICKNAME_TAKEN_MESSAGE, { status: 409 });
      }
      throw error;
    }

    return apiOk({ nickname: user.nickname });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "닉네임 변경 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
