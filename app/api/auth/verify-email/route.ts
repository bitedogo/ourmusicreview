/** POST 이메일 인증번호 확인 */

import {
  EMAIL_AUTH_MESSAGES,
  parseOtpCode,
} from "@/src/lib/auth/email-otp";
import { consumeEmailVerificationOtp } from "@/src/lib/auth/email-otp-consume";
import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const code = sanitizeText(body?.code);

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });
    if (!parseOtpCode(code)) {
      return apiError(EMAIL_AUTH_MESSAGES.otpRequired, { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const ip = getRequestIp(request);
    await Promise.all([
      enforceRateLimit(dataSource, {
        scope: "email-verify-final-account",
        key: `${ip}:${email}`,
        limit: 10,
        windowSeconds: 600,
        blockSeconds: 900,
      }),
      enforceRateLimit(dataSource, {
        scope: "email-verify-final-ip",
        key: ip,
        limit: 30,
        windowSeconds: 600,
        blockSeconds: 900,
      }),
    ]);
    const consumed = await consumeEmailVerificationOtp(dataSource, {
      email,
      rawCode: code,
    });
    if (!consumed) {
      return apiError(EMAIL_AUTH_MESSAGES.otpInvalid, { status: 400 });
    }

    return apiOk(
      {},
      { message: "이메일 인증이 완료되었습니다. 로그인해 주세요." }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError("이메일 인증 중 오류가 발생했습니다.", { status: 500 });
  }
}
