/** 지난 발매 신보 정리 — cron/수동 실행용 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

function readDatabaseUrlFromEnvLocal() {
  try {
    const envText = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    const line = envText
      .split(/\r?\n/)
      .find((row) => row.trim().startsWith("DATABASE_URL="));
    const raw = line?.slice("DATABASE_URL=".length).trim();
    if (!raw) return undefined;
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'"))
    ) {
      return raw.slice(1, -1).trim();
    }
    return raw;
  } catch {
    return undefined;
  }
}

function getKstTodayIso(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

const databaseUrl =
  process.env.DATABASE_URL?.trim() ?? readDatabaseUrlFromEnvLocal();
if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 필요합니다.");

const todayIso = getKstTodayIso();
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("localhost") || databaseUrl.includes("placeholder")
      ? false
      : { rejectUnauthorized: false },
});

await client.connect();
try {
  const result = await client.query(
    `DELETE FROM public.weekly_release_albums
     WHERE release_date < $1`,
    [todayIso]
  );
  console.log(
    `purge-expired-new-releases: deleted=${result.rowCount ?? 0} today=${todayIso}`
  );
} finally {
  await client.end();
}
