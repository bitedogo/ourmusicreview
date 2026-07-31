/** 이메일 OTP 발급·검증 헬퍼 */

import {
  createOtpCode,
  expiresAt,
  hashToken,
  isExpired,
  normalizeOtpInput,
  OTP_TTL_MS,
} from "@/src/lib/auth/email-tokens";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { sendTemplatedEmail } from "@/src/lib/email/resend";
import {
  findIdEmailContent,
  passwordResetEmailContent,
  verificationEmailContent,
} from "@/src/lib/email/templates";

export const EMAIL_AUTH_MESSAGES = {
  otpInvalid: "인증번호가 올바르지 않거나 만료되었습니다.",
  otpRequired: "인증번호 6자리를 입력해주세요.",
  mailFailed: "메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
  verificationMailFailed:
    "인증 메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.",
  findIdGeneric:
    "등록된 이메일이면 아이디 안내 메일을 보냈습니다. 메일함을 확인해 주세요.",
  findPasswordGeneric:
    "입력한 정보와 일치하는 계정이 있으면 인증번호 메일을 보냈습니다.",
  resendVerificationGeneric:
    "해당 계정이 미인증 상태이면 인증번호를 다시 보냈습니다.",
} as const;

export async function getUserRepository() {
  const dataSource = await initializeDatabase();
  return dataSource.getRepository(User);
}

export function parseOtpCode(raw: string): string | null {
  const code = normalizeOtpInput(raw);
  return code.length === 6 ? code : null;
}

export function matchesStoredOtp(
  storedHash: string | null | undefined,
  expires: Date | null | undefined,
  rawCode: string
): boolean {
  const code = parseOtpCode(rawCode);
  if (!code || !storedHash || isExpired(expires)) return false;
  return storedHash === hashToken(code);
}

export async function sendEmailVerificationOtp(user: User): Promise<void> {
  const repo = await getUserRepository();
  const otp = createOtpCode();

  await repo.update(
    { id: user.id },
    {
      emailVerificationToken: hashToken(otp),
      emailVerificationExpiresAt: expiresAt(OTP_TTL_MS),
    }
  );

  await sendTemplatedEmail(
    user.email,
    verificationEmailContent({ nickname: user.nickname, code: otp })
  );
}

export async function sendPasswordResetOtp(user: User): Promise<void> {
  const repo = await getUserRepository();
  const otp = createOtpCode();

  await repo.update(
    { id: user.id },
    {
      passwordResetToken: hashToken(otp),
      passwordResetExpiresAt: expiresAt(OTP_TTL_MS),
    }
  );

  await sendTemplatedEmail(
    user.email,
    passwordResetEmailContent({
      name: user.name ?? user.nickname,
      code: otp,
    })
  );
}

export async function sendFindIdEmail(user: User): Promise<void> {
  await sendTemplatedEmail(
    user.email,
    findIdEmailContent({
      name: user.name ?? user.nickname,
      userId: user.id,
    })
  );
}
