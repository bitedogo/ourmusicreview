/** POST 회원가입용 이메일 인증번호 확인 */

import {
  EMAIL_AUTH_MESSAGES,
  confirmSignupEmailOtp,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const code = sanitizeText(body?.code);

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    try {
      await confirmSignupEmailOtp(email, code);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.otpInvalid;
      return apiError(message, { status: 400 });
    }

    return apiOk({}, { message: "이메일 인증이 완료되었습니다." });
  } catch {
    return apiError("이메일 인증 중 오류가 발생했습니다.", { status: 500 });
  }
}
