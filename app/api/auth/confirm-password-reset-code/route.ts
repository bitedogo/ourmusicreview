/** POST 비밀번호 재설정 인증번호 선검증 */

import {
  EMAIL_AUTH_MESSAGES,
  confirmPasswordResetOtp,
} from "@/src/lib/auth/email-otp";
import { accountEmailOtpSchema } from "@/src/lib/auth/contracts";
import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { parseJsonBody } from "@/src/lib/http/schema";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  return handleApi("인증번호 확인 중 오류가 발생했습니다.", async () => {
    const parsed = await parseJsonBody(request, accountEmailOtpSchema);
    const email = parsed.email.toLowerCase();
    const dataSource = await initializeDatabase();
    await enforceRateLimit(dataSource, {
      scope: "password-reset-otp",
      key: `${getRequestIp(request)}:${parsed.id}:${email}`,
      limit: 6,
      windowSeconds: 600,
      blockSeconds: 1800,
    });

    try {
      await confirmPasswordResetOtp(parsed.id, email, parsed.code);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.otpInvalid;
      return apiError(message, { status: 400 });
    }

    return apiOk({}, { message: "인증번호가 확인되었습니다." });
  });
}
