/** 디자이너·개발자 가이드 공통 비밀번호 게이트 */

export const GUIDE_GATE_COOKIE = "oru_guide_gate";
export const GUIDE_GATE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function getGuidePassword(): string | null {
  return process.env.GUIDE_GATE_PASSWORD?.trim() || null;
}

function getGuideSigningSecret(): string | null {
  return (
    process.env.GUIDE_GATE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    null
  );
}

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
  const password = getGuidePassword();
  return password ? timingSafeEqual(input, password) : false;
}

export async function createGuideGateToken(): Promise<string> {
  const secret = getGuideSigningSecret();
  if (!secret || !getGuidePassword()) {
    throw new Error("[ENV] GUIDE_GATE_PASSWORD와 서명 비밀키가 필요합니다.");
  }
  const expiresAt = Math.floor(Date.now() / 1000) + GUIDE_GATE_MAX_AGE_SECONDS;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(String(expiresAt))
  );
  const digest = Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return `${expiresAt}.${digest}`;
}

export async function isGuideGateTokenValid(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;
  const [expiresRaw, signature] = value.split(".");
  const expiresAt = Number(expiresRaw);
  const secret = getGuideSigningSecret();
  if (
    !secret ||
    !signature ||
    !Number.isInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const expectedBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(expiresRaw)
  );
  const expected = Array.from(new Uint8Array(expectedBuffer), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  return timingSafeEqual(signature, expected);
}
