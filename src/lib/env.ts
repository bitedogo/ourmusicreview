interface ServerEnv {
  databaseUrl: string;
  nextAuthSecret: string;
  nextAuthUrl?: string;
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  nodeEnv: "development" | "production" | "test";
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
    nodeEnv: getNodeEnv(),
  };
}
