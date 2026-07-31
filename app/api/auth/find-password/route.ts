/** POST 비밀번호 재설정 인증번호 발송 */

import {
  EMAIL_AUTH_MESSAGES,
  getUserRepository,
  sendPasswordResetOtp,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const id = sanitizeText(body?.id);

    if (!email || !id) {
      return apiError("이메일과 아이디를 모두 입력해주세요.", { status: 400 });
    }

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { id, email } });

    if (user?.password) {
      try {
        await sendPasswordResetOtp(user);
      } catch {
        return apiError(EMAIL_AUTH_MESSAGES.mailFailed, { status: 502 });
      }
    }

    return apiOk({ email, id }, { message: EMAIL_AUTH_MESSAGES.findPasswordGeneric });
  } catch {
    return apiError("비밀번호 재설정 중 오류가 발생했습니다.", { status: 500 });
  }
}
