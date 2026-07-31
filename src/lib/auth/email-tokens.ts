/** 이메일 OTP·토큰 유틸 */

import { createHash, randomInt } from "node:crypto";
import {
  normalizeOtpInput,
  OTP_CODE_LENGTH,
} from "@/src/lib/auth/otp-input";

export { normalizeOtpInput, OTP_CODE_LENGTH };

/** 인증번호 유효 시간 */
export const OTP_TTL_MS = 1000 * 60 * 10; // 10분
/** 가입 전 이메일 인증 유효(확인 후 가입까지) */
export const SIGNUP_VERIFIED_TTL_MS = 1000 * 60 * 30; // 30분

/** 혼동 문자(0/O, 1/I) 제외 · 영문 대문자 + 숫자 */
const OTP_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function createOtpCode(length: number = OTP_CODE_LENGTH): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += OTP_ALPHABET[randomInt(OTP_ALPHABET.length)];
  }
  return code;
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken.toUpperCase()).digest("hex");
}

export function expiresAt(ttlMs: number = OTP_TTL_MS): Date {
  return new Date(Date.now() + ttlMs);
}

export function isExpired(expires: Date | null | undefined): boolean {
  if (!expires) return true;
  return expires.getTime() <= Date.now();
}
