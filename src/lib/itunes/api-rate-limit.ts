/** 공개 iTunes API 프록시 IP rate limit */

import { enforceRateLimit, getRequestIp } from "@/src/lib/auth/rate-limit";
import { initializeDatabase } from "@/src/lib/db";

const ITUNES_API_LIMIT = 90;
const ITUNES_API_WINDOW_SECONDS = 60;
const ITUNES_API_BLOCK_SECONDS = 60;

export async function enforceItunesProxyRateLimit(request: Request): Promise<void> {
  const dataSource = await initializeDatabase();
  const ip = getRequestIp(request);
  await enforceRateLimit(dataSource, {
    scope: "itunes-proxy-ip",
    key: ip,
    limit: ITUNES_API_LIMIT,
    windowSeconds: ITUNES_API_WINDOW_SECONDS,
    blockSeconds: ITUNES_API_BLOCK_SECONDS,
  });
}
