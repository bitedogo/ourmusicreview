/** 디자이너·개발자 가이드 공통 비밀번호 게이트 */

export const GUIDE_GATE_COOKIE = "oru_guide_gate";
export const GUIDE_GATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const GUIDE_GATE_PASSWORD = process.env.GUIDE_GATE_PASSWORD?.trim() || "123456";

export function safeGuideNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return "/designer";
  }
  if (next === "/designer" || next.startsWith("/designer/")) {
    return next;
  }
  if (next === "/developer" || next.startsWith("/developer/")) {
    return next;
  }
  return "/designer";
}

export function isGuidePath(pathname: string): boolean {
  return (
    pathname === "/designer" ||
    pathname.startsWith("/designer/") ||
    pathname === "/developer" ||
    pathname.startsWith("/developer/")
  );
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return diff === 0;
}

export function isGuideGatePassword(input: string): boolean {
  return timingSafeEqual(input, GUIDE_GATE_PASSWORD);
}

export async function createGuideGateToken(): Promise<string> {
  const data = new TextEncoder().encode(`oru-guide-gate:${GUIDE_GATE_PASSWORD}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

export async function isGuideGateTokenValid(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;
  const expected = await createGuideGateToken();
  return timingSafeEqual(value, expected);
}
