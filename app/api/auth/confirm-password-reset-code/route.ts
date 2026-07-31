/** POST 비밀번호 재설정 인증번호 선검증 */

import {
  EMAIL_AUTH_MESSAGES,
  confirmPasswordResetOtp,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const id = sanitizeText(body?.id);
    const code = sanitizeText(body?.code);

    if (!email || !id) {
      return apiError("이메일과 아이디를 모두 입력해주세요.", { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    try {
      await confirmPasswordResetOtp(id, email, code);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.otpInvalid;
      return apiError(message, { status: 400 });
    }

    return apiOk({}, { message: "인증번호가 확인되었습니다." });
  } catch {
    return apiError("인증번호 확인 중 오류가 발생했습니다.", { status: 500 });
  }
}
