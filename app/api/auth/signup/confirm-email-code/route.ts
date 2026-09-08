/** POST 회원가입용 이메일 인증번호 확인 */

import {
  EMAIL_AUTH_MESSAGES,
  confirmSignupEmailOtp,
} from "@/src/lib/auth/email-otp";
import { emailOtpSchema } from "@/src/lib/auth/contracts";
import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { parseJsonBody } from "@/src/lib/http/schema";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  return handleApi("이메일 인증 중 오류가 발생했습니다.", async () => {
    const parsed = await parseJsonBody(request, emailOtpSchema);
    const email = parsed.email.toLowerCase();
    const dataSource = await initializeDatabase();
    await enforceRateLimit(dataSource, {
      scope: "signup-otp",
      key: `${getRequestIp(request)}:${email}`,
      limit: 6,
      windowSeconds: 600,
      blockSeconds: 1800,
    });

    try {
      await confirmSignupEmailOtp(email, parsed.code);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.otpInvalid;
      return apiError(message, { status: 400 });
    }

    return apiOk({}, { message: "이메일 인증이 완료되었습니다." });
  });
}
