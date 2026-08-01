/** 환경 변수 로드·검증 */

interface ServerEnv {
  databaseUrl: string;
  nextAuthSecret: string;
  nextAuthUrl?: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  nodeEnv: "development" | "production" | "test";
  googleClientId: string;
  googleClientSecret: string;
}

interface EmailEnv {
  resendApiKey: string;
  resendFrom: string;
}

interface ClientEnv {
  nextPublicSupabaseUrl: string;
  nextPublicSupabaseAnonKey: string;
}

function requireEnv(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`[ENV] ${name} 환경 변수가 필요합니다.`);
  }
  return value;
}

function getNodeEnv(): ServerEnv["nodeEnv"] {
  const env = process.env.NODE_ENV;
  if (env === "production" || env === "test") {
    return env;
  }
  return "development";
}

export function getServerEnv(): ServerEnv {
  return {
    databaseUrl: requireEnv("DATABASE_URL", process.env.DATABASE_URL),
    nextAuthSecret: requireEnv("NEXTAUTH_SECRET", process.env.NEXTAUTH_SECRET),
    nextAuthUrl: process.env.NEXTAUTH_URL,
    supabaseUrl: requireEnv("SUPABASE_URL", process.env.SUPABASE_URL),
    supabaseServiceRoleKey: requireEnv(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    googleClientId: requireEnv("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID),
    googleClientSecret: requireEnv(
      "GOOGLE_CLIENT_SECRET",
      process.env.GOOGLE_CLIENT_SECRET
    ),
    nodeEnv: getNodeEnv(),
  };
}

/** 메일 발송 시에만 필요 — 인증/DB 부팅과 분리 */
export function getEmailEnv(): EmailEnv {
  return {
    resendApiKey: requireEnv("RESEND_API_KEY", process.env.RESEND_API_KEY),
    resendFrom:
      process.env.RESEND_FROM?.trim() || "ORU <onboarding@resend.dev>",
  };
}

export function getClientEnv(): ClientEnv {
  return {
    nextPublicSupabaseUrl: requireEnv(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    nextPublicSupabaseAnonKey: requireEnv(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
  };
}
