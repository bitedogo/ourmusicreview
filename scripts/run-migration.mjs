import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
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

function readMigrationNames(argument) {
  if (argument === "--all") {
    const manifestPath = join(process.cwd(), "scripts", "migration-manifest.json");
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!Array.isArray(manifest.migrations) || manifest.migrations.length === 0) {
      throw new Error("migration-manifest.json에 마이그레이션이 없습니다.");
    }
    return manifest.migrations;
  }
  if (!argument || !/^[a-z0-9-]+\.sql$/i.test(argument)) {
    throw new Error(
      "scripts/*.sql 파일명 또는 --all을 인자로 지정하세요."
    );
  }
  return [argument];
}

const migrationNames = readMigrationNames(process.argv[2]);
const databaseUrl =
  process.env.DATABASE_URL?.trim() ?? readDatabaseUrlFromEnvLocal();
if (!databaseUrl) throw new Error("DATABASE_URL 환경 변수가 필요합니다.");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("localhost") || databaseUrl.includes("placeholder")
      ? false
      : { rejectUnauthorized: false },
});

async function applyMigration(migrationArgument) {
  if (!/^[a-z0-9-]+\.sql$/i.test(migrationArgument)) {
    throw new Error(`잘못된 마이그레이션 파일명: ${migrationArgument}`);
  }

  const migrationPath = resolve(process.cwd(), "scripts", migrationArgument);
  const sql = readFileSync(migrationPath, "utf8");
  const migrationName = basename(migrationPath);
  const checksum = createHash("sha256").update(sql).digest("hex");
  const applied = await client.query(
    "SELECT checksum FROM public.schema_migrations WHERE name = $1",
    [migrationName]
  );

  if (applied.rowCount) {
    if (applied.rows[0].checksum !== checksum) {
      throw new Error(`이미 적용된 마이그레이션의 내용이 변경되었습니다: ${migrationName}`);
    }
    console.log(`이미 적용됨: ${migrationName}`);
    return;
  }

  const transactionalSql = sql
    .replace(/^\s*BEGIN;\s*/i, "")
    .replace(/\s*COMMIT;\s*$/i, "");
  await client.query("BEGIN");
  try {
    await client.query(transactionalSql);
    await client.query(
      "INSERT INTO public.schema_migrations(name, checksum) VALUES ($1, $2)",
      [migrationName, checksum]
    );
    await client.query("COMMIT");
    console.log(`적용 완료: ${migrationName}`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  }
}

try {
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      name text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
  for (const migrationName of migrationNames) {
    await applyMigration(migrationName);
  }
} catch (error) {
  console.error("마이그레이션 실패:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
