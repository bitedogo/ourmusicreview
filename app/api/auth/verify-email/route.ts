/** POST 이메일 인증번호 확인 */

import {
  EMAIL_AUTH_MESSAGES,
  getUserRepository,
  matchesStoredOtp,
  parseOtpCode,
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
    if (!parseOtpCode(code)) {
      return apiError(EMAIL_AUTH_MESSAGES.otpRequired, { status: 400 });
    }

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { email } });

    if (
      !user ||
      !matchesStoredOtp(
        user.emailVerificationToken,
        user.emailVerificationExpiresAt,
        code
      )
    ) {
      return apiError(EMAIL_AUTH_MESSAGES.otpInvalid, { status: 400 });
    }

    if (user.emailVerifiedAt) {
      return apiOk({}, { message: "이미 인증이 완료된 계정입니다." });
    }

    await userRepository.update(
      { id: user.id },
      {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      }
    );

    return apiOk(
      {},
      { message: "이메일 인증이 완료되었습니다. 로그인해 주세요." }
    );
  } catch {
    return apiError("이메일 인증 중 오류가 발생했습니다.", { status: 500 });
  }
}
