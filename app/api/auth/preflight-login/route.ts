/** POST 로그인 전 자격·이메일 인증·정지 상태 확인 */

import { getUserRepository } from "@/src/lib/auth/email-otp";
import { verifyPassword } from "@/src/lib/auth/password";
import { sanitizeText } from "@/src/lib/auth/validation";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";
import {
  formatSuspensionMessage,
  refreshExpiredSuspension,
} from "@/src/lib/users/user-sanction-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = sanitizeText(body?.id);
    const password = sanitizeText(body?.password);

    if (!id || !password) {
      return apiOk({ status: "invalid" as const });
    }

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { id } });

    if (!user || typeof user.password !== "string" || !user.password) {
      return apiOk({ status: "invalid" as const });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return apiOk({ status: "invalid" as const });
    }

    if (!user.emailVerifiedAt) {
      return apiOk({ status: "unverified" as const });
    }

    const dataSource = await initializeDatabase();
    await refreshExpiredSuspension(dataSource.getRepository(User), user);

    if (user.accountStatus === "SUSPENDED") {
      const until = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
      return apiOk({
        status: "suspended" as const,
        message: formatSuspensionMessage(until, user.suspendReason ?? null),
        suspendedUntil: until ? until.toISOString() : null,
      });
    }

    return apiOk({ status: "ready" as const });
  } catch {
    return apiError("로그인 확인 중 오류가 발생했습니다.", { status: 500 });
  }
}
