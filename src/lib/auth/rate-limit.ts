import { createHash } from "node:crypto";
import type { DataSource } from "typeorm";
import { ServiceError } from "@/src/lib/http/service-error";

interface RateLimitOptions {
  scope: string;
  key: string;
  limit: number;
  windowSeconds: number;
  blockSeconds?: number;
}

export function getRequestIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

export async function enforceRateLimit(
  dataSource: DataSource,
  options: RateLimitOptions
): Promise<void> {
  const keyHash = createHash("sha256")
    .update(options.key.toLowerCase())
    .digest("hex");
  const blockSeconds = options.blockSeconds ?? options.windowSeconds;

  try {
    const rows = await dataSource.query<
      Array<{ request_count: number; blocked_until: Date | null }>
    >(
      `
      INSERT INTO public.auth_rate_limits
        (scope, key_hash, request_count, window_started_at, blocked_until)
      VALUES ($1, $2, 1, now(), NULL)
      ON CONFLICT (scope, key_hash) DO UPDATE SET
        request_count = CASE
          WHEN auth_rate_limits.window_started_at
            < now() - ($3 * interval '1 second') THEN 1
          ELSE auth_rate_limits.request_count + 1
        END,
        window_started_at = CASE
          WHEN auth_rate_limits.window_started_at
            < now() - ($3 * interval '1 second') THEN now()
          ELSE auth_rate_limits.window_started_at
        END,
        blocked_until = CASE
          WHEN auth_rate_limits.blocked_until > now()
            THEN auth_rate_limits.blocked_until
          WHEN (
            CASE
              WHEN auth_rate_limits.window_started_at
                < now() - ($3 * interval '1 second') THEN 1
              ELSE auth_rate_limits.request_count + 1
            END
          ) > $4 THEN now() + ($5 * interval '1 second')
          ELSE NULL
        END
      RETURNING request_count, blocked_until
      `,
      [
        options.scope,
        keyHash,
        options.windowSeconds,
        options.limit,
        blockSeconds,
      ]
    );

    if (rows[0]?.blocked_until && new Date(rows[0].blocked_until) > new Date()) {
      throw new ServiceError("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", 429);
    }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    const code = (error as { code?: string })?.code;
    if (code === "42P01") {
      console.warn("[rate-limit] migration is not applied");
      return;
    }
    throw error;
  }
}
