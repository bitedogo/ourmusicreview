/** POST 회원가입용 이메일 인증번호 발송 */

import {
  EMAIL_AUTH_MESSAGES,
  sendSignupEmailOtp,
} from "@/src/lib/auth/email-otp";
import { emailRequestSchema } from "@/src/lib/auth/contracts";
import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { parseJsonBody } from "@/src/lib/http/schema";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  return handleApi("인증번호 발송 중 오류가 발생했습니다.", async () => {
    const { email: rawEmail } = await parseJsonBody(request, emailRequestSchema);
    const email = rawEmail.toLowerCase();
    const dataSource = await initializeDatabase();
    const ip = getRequestIp(request);
    await Promise.all([
      enforceRateLimit(dataSource, {
        scope: "signup-email",
        key: email,
        limit: 3,
        windowSeconds: 600,
        blockSeconds: 1800,
      }),
      enforceRateLimit(dataSource, {
        scope: "signup-email-ip",
        key: ip,
        limit: 10,
        windowSeconds: 600,
        blockSeconds: 1800,
      }),
    ]);

    try {
      await sendSignupEmailOtp(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.mailFailed;
      if (message === EMAIL_AUTH_MESSAGES.emailAlreadyUsed) {
        return apiError(message, { status: 409 });
      }
      if (message === EMAIL_AUTH_MESSAGES.emailBlocked) {
        return apiError(message, { status: 403 });
      }
      return apiError(EMAIL_AUTH_MESSAGES.verificationMailFailed, {
        status: 502,
      });
    }

    return apiOk(
      { email },
      { message: "인증번호를 이메일로 보냈습니다. 10분 안에 입력해 주세요." }
    );
  });
}
