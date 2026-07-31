/** OTP 입력 정규화 (영문·숫자, 클라이언트 공용) */

export const OTP_CODE_LENGTH = 6;

export function normalizeOtpInput(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, OTP_CODE_LENGTH);
}
