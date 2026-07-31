/** POST 회원가입용 이메일 인증번호 발송 */

import {
  EMAIL_AUTH_MESSAGES,
  sendSignupEmailOtp,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    try {
      await sendSignupEmailOtp(email);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : EMAIL_AUTH_MESSAGES.mailFailed;
      if (message === EMAIL_AUTH_MESSAGES.emailAlreadyUsed) {
        return apiError(message, { status: 409 });
      }
      return apiError(EMAIL_AUTH_MESSAGES.verificationMailFailed, {
        status: 502,
      });
    }

    return apiOk(
      { email },
      { message: "인증번호를 이메일로 보냈습니다. 10분 안에 입력해 주세요." }
    );
  } catch {
    return apiError("인증번호 발송 중 오류가 발생했습니다.", { status: 500 });
  }
}
