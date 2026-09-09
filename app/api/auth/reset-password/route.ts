/** POST 인증번호 확인 후 새 비밀번호 설정 */

import bcrypt from "bcryptjs";
import {
  EMAIL_AUTH_MESSAGES,
  parseOtpCode,
} from "@/src/lib/auth/email-otp";
import { consumePasswordResetOtp } from "@/src/lib/auth/email-otp-consume";
import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  sanitizeText,
  validateEmail,
  validatePassword,
} from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const id = sanitizeText(body?.id);
    const code = sanitizeText(body?.code);
    const password = sanitizeText(body?.password);

    if (!email || !id) {
      return apiError("이메일과 아이디가 필요합니다.", { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    if (!parseOtpCode(code)) {
      return apiError(EMAIL_AUTH_MESSAGES.otpRequired, { status: 400 });
    }

    const pwdError = validatePassword(password);
    if (pwdError) return apiError(pwdError, { status: 400 });

    const dataSource = await initializeDatabase();
    const ip = getRequestIp(request);
    await Promise.all([
      enforceRateLimit(dataSource, {
        scope: "password-reset-final-account",
        key: `${ip}:${id}:${email}`,
        limit: 10,
        windowSeconds: 600,
        blockSeconds: 900,
      }),
      enforceRateLimit(dataSource, {
        scope: "password-reset-final-ip",
        key: ip,
        limit: 30,
        windowSeconds: 600,
        blockSeconds: 900,
      }),
    ]);
    const hashedPassword = await bcrypt.hash(password, 10);
    const consumed = await consumePasswordResetOtp(dataSource, {
      id,
      email,
      rawCode: code,
      passwordHash: hashedPassword,
    });
    if (!consumed) {
      return apiError(EMAIL_AUTH_MESSAGES.otpInvalid, { status: 400 });
    }

    return apiOk(
      {},
      { message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요." }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError("비밀번호 재설정 중 오류가 발생했습니다.", { status: 500 });
  }
}
