/** OTP 입력 정규화 (클라이언트 공용) */

export function normalizeOtpInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}
