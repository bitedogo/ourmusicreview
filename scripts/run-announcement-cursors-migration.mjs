/** user_announcement_cursors 마이그레이션 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

function readDatabaseUrlFromEnvLocal() {
  try {
    const envPath = join(process.cwd(), ".env.local");
    const envText = readFileSync(envPath, "utf8");
    const line = envText
      .split(/\r?\n/)
      .find((row) => row.trim().startsWith("DATABASE_URL="));
    if (!line) return undefined;

    const raw = line.slice("DATABASE_URL=".length).trim();
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

const databaseUrl =
  process.env.DATABASE_URL?.trim() ?? readDatabaseUrlFromEnvLocal();

if (!databaseUrl) {
  console.error("DATABASE_URL 환경 변수가 필요합니다.");
  process.exit(1);
}

const sqlPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "add-announcement-cursors.sql"
);
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("localhost") || databaseUrl.includes("placeholder")
      ? false
      : { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("user_announcement_cursors 마이그레이션이 완료되었습니다.");
} catch (error) {
  console.error("마이그레이션 실패:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
