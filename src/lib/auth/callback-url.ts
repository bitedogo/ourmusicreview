/** 로그인 후 복귀 주소 — 외부 URL·인증 루프 차단 */

const DEFAULT_CALLBACK = "/";

const LOOP_PREFIXES = [
  "/auth/signin",
  "/auth/signup",
  "/auth/callback",
  "/auth/post-login",
];

function isAllowedHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  for (const envName of ["NEXT_PUBLIC_SITE_URL", "NEXTAUTH_URL"] as const) {
    const raw = process.env[envName];
    if (!raw) continue;
    try {
      if (new URL(raw).hostname === hostname) return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

function toInternalPath(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("http://") || value.startsWith("https://")) {
    try {
      const parsed = new URL(value);
      if (!isAllowedHost(parsed.hostname)) return null;
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return null;
    }
  }

  if (value.startsWith("//") || value.includes("\\") || value.includes("://")) {
    return null;
  }

  if (!value.startsWith("/")) return null;
  return value;
}

export function resolveAuthCallbackUrl(raw: string | null | undefined): string {
  if (!raw) return DEFAULT_CALLBACK;

  const path = toInternalPath(raw);
  if (!path || path.startsWith("//")) return DEFAULT_CALLBACK;

  if (
    LOOP_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}?`)
    )
  ) {
    return DEFAULT_CALLBACK;
  }

  return path;
}

export function buildSigninHref(callbackPath?: string | null): string {
  const callbackUrl = resolveAuthCallbackUrl(callbackPath);
  if (callbackUrl === DEFAULT_CALLBACK) return "/auth/signin";
  return `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`;
}

export function getCurrentReturnPath(): string {
  if (typeof window === "undefined") return DEFAULT_CALLBACK;
  return `${window.location.pathname}${window.location.search}`;
}

export const ADMIN_HOME_PATH = "/admin";

export function resolveLoginLandingUrl(
  role: string | null | undefined,
  callbackUrl?: string | null
): string {
  if (role === "ADMIN") return ADMIN_HOME_PATH;
  return resolveAuthCallbackUrl(callbackUrl);
}

export function buildPostLoginHref(callbackUrl?: string | null): string {
  const next = resolveAuthCallbackUrl(callbackUrl);
  if (next === DEFAULT_CALLBACK) return "/auth/post-login";
  return `/auth/post-login?next=${encodeURIComponent(next)}`;
}
