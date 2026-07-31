/** POST 아이디 찾기 — 이메일로 아이디 발송 */

import {
  EMAIL_AUTH_MESSAGES,
  getUserRepository,
  sendFindIdEmail,
} from "@/src/lib/auth/email-otp";
import { sanitizeText, validateEmail } from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = sanitizeText(body?.email).toLowerCase();
    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { email } });

    if (user) {
      try {
        await sendFindIdEmail(user);
      } catch {
        return apiError(EMAIL_AUTH_MESSAGES.mailFailed, { status: 502 });
      }
    }

    return apiOk({}, { message: EMAIL_AUTH_MESSAGES.findIdGeneric });
  } catch {
    return apiError("아이디 찾기 중 오류가 발생했습니다.", { status: 500 });
  }
}
