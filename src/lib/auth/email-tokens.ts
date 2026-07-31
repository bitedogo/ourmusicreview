/** 이메일 OTP·토큰 유틸 */

import { createHash, randomInt } from "node:crypto";
import { normalizeOtpInput } from "@/src/lib/auth/otp-input";

export { normalizeOtpInput };

/** 인증번호 유효 시간 */
export const OTP_TTL_MS = 1000 * 60 * 10; // 10분

export function createOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function expiresAt(ttlMs: number = OTP_TTL_MS): Date {
  return new Date(Date.now() + ttlMs);
}

export function isExpired(expires: Date | null | undefined): boolean {
  if (!expires) return true;
  return expires.getTime() <= Date.now();
}
