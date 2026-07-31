/** POST 인증번호 확인 후 새 비밀번호 설정 */

import bcrypt from "bcryptjs";
import {
  EMAIL_AUTH_MESSAGES,
  getUserRepository,
  matchesStoredOtp,
  parseOtpCode,
} from "@/src/lib/auth/email-otp";
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

    const userRepository = await getUserRepository();
    const user = await userRepository.findOne({ where: { id, email } });

    if (
      !user ||
      !matchesStoredOtp(
        user.passwordResetToken,
        user.passwordResetExpiresAt,
        code
      )
    ) {
      return apiError(EMAIL_AUTH_MESSAGES.otpInvalid, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.update(
      { id: user.id },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      }
    );

    return apiOk(
      {},
      { message: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요." }
    );
  } catch {
    return apiError("비밀번호 재설정 중 오류가 발생했습니다.", { status: 500 });
  }
}
