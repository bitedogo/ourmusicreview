/** POST 인증번호 재발송 (이메일 또는 아이디) */

import {
  EMAIL_AUTH_MESSAGES,
  getUserRepository,
  sendEmailVerificationOtp,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailInput = sanitizeText(body?.email).toLowerCase();
    const idInput = sanitizeText(body?.id);

    if (!emailInput && !idInput) {
      return apiError("이메일 또는 아이디를 입력해주세요.", { status: 400 });
    }

    if (emailInput) {
      const emailError = validateEmail(emailInput);
      if (emailError) return apiError(emailError, { status: 400 });
    }

    const userRepository = await getUserRepository();
    const user = emailInput
      ? await userRepository.findOne({ where: { email: emailInput } })
      : await userRepository.findOne({ where: { id: idInput } });

    if (user && !user.emailVerifiedAt && user.password) {
      try {
        await sendEmailVerificationOtp(user);
      } catch {
        return apiError(EMAIL_AUTH_MESSAGES.verificationMailFailed, {
          status: 502,
        });
      }
    }

    return apiOk({}, { message: EMAIL_AUTH_MESSAGES.resendVerificationGeneric });
  } catch {
    return apiError("인증 메일 재발송 중 오류가 발생했습니다.", { status: 500 });
  }
}
