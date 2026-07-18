/**
 * 기존 Supabase 프로필 이미지를 400x400 WebP로 일괄 압축합니다.
 *
 * 사용법:
 *   node scripts/compress-profile-images.mjs
 *   node scripts/compress-profile-images.mjs --dry-run
 *
 * 주의:
 * - Supabase egress 제한(402) 중에는 실행할 수 없습니다.
 * - Google 프로필 URL은 건너뜁니다.
 */
import { readFileSync, existsSync } from "fs";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BUCKET = "profiles";
const MAX_SIZE = 400;
const QUALITY = 85;
const DRY_RUN = process.argv.includes("--dry-run");

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv(".env.local");
loadEnv(".env");

function extractStoragePath(publicUrl, supabaseHost) {
  try {
    const url = new URL(publicUrl);
    if (url.hostname !== supabaseHost) return null;
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.pathname.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(url.pathname.slice(idx + marker.length));
  } catch {
    return null;
  }
}

function errorMessage(error) {
  if (!error) return "unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message.trim()) return error.message;

  const parts = [];
  for (const key of ["message", "error", "statusCode", "status", "name", "code"]) {
    const value = error?.[key];
    if (value != null && String(value).trim()) parts.push(String(value));
  }
  if (parts.length) return parts.join(" | ");

  try {
    const json = JSON.stringify(error);
    if (json && json !== "{}") return json;
  } catch {
    // ignore
  }
  return String(error);
}

function isQuotaRestricted(error) {
  const text = errorMessage(error).toLowerCase();
  return (
    text.includes("402") ||
    text.includes("restricted") ||
    text.includes("egress") ||
    text.includes("quota") ||
    text.includes("exceed")
  );
}

function isAlreadyCompressed(path) {
  return path.startsWith("compressed/") && path.endsWith(".webp");
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!databaseUrl || !supabaseUrl || !serviceKey) {
    throw new Error("DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  }

  const supabaseHost = new URL(supabaseUrl).hostname;
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
  const db = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await db.connect();

  const { rows } = await db.query(`
    SELECT user_id, profile_image
    FROM users
    WHERE profile_image IS NOT NULL
      AND profile_image LIKE $1
    ORDER BY created_at ASC
  `, [`https://${supabaseHost}/%`]);

  console.log(`대상: ${rows.length}명${DRY_RUN ? " (dry-run)" : ""}`);

  if (rows.length > 0) {
    const probe = await fetch(rows[0].profile_image, { method: "HEAD" });
    if (probe.status === 402) {
      await db.end();
      console.error(
        "\nSupabase Storage가 egress 한도로 제한되어 있습니다 (HTTP 402).\n" +
          "일괄 압축은 이미지를 다운로드해야 해서 지금 실행할 수 없습니다.\n" +
          "7/24 사용량 리셋(또는 플랜 업그레이드) 후 아래 명령으로 다시 실행하세요:\n" +
          "  npm run compress:profiles"
      );
      return 1;
    }
  }

  let ok = 0;
  let skipped = 0;
  let failed = 0;
  let savedBytes = 0;

  for (const row of rows) {
    const userId = row.user_id;
    const oldUrl = row.profile_image;
    const oldPath = extractStoragePath(oldUrl, supabaseHost);

    if (!oldPath) {
      console.log(`[skip] ${userId}: 경로 파싱 실패`);
      skipped += 1;
      continue;
    }

    if (isAlreadyCompressed(oldPath)) {
      console.log(`[skip] ${userId}: 이미 압축됨`);
      skipped += 1;
      continue;
    }

    try {
      const download = await supabase.storage.from(BUCKET).download(oldPath);
      if (download.error || !download.data) {
        throw download.error || new Error("download failed");
      }

      const input = Buffer.from(await download.data.arrayBuffer());
      const output = await sharp(input)
        .rotate()
        .resize(MAX_SIZE, MAX_SIZE, {
          fit: "cover",
          withoutEnlargement: true,
        })
        .webp({ quality: QUALITY })
        .toBuffer();

      const newPath = `compressed/${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
      const reduction = input.length - output.length;
      savedBytes += Math.max(0, reduction);

      console.log(
        `[${DRY_RUN ? "dry" : "ok"}] ${userId}: ${(input.length / 1024).toFixed(1)}KB → ${(output.length / 1024).toFixed(1)}KB`
      );

      if (DRY_RUN) {
        ok += 1;
        continue;
      }

      const upload = await supabase.storage.from(BUCKET).upload(newPath, output, {
        contentType: "image/webp",
        upsert: true,
      });
      if (upload.error) {
        throw upload.error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

      await db.query(`UPDATE users SET profile_image = $1 WHERE user_id = $2`, [
        publicUrl,
        userId,
      ]);

      const remove = await supabase.storage.from(BUCKET).remove([oldPath]);
      if (remove.error) {
        console.warn(`  경고: 원본 삭제 실패 (${oldPath}): ${errorMessage(remove.error)}`);
      }

      ok += 1;
    } catch (error) {
      failed += 1;
      console.error(`[fail] ${userId}: ${errorMessage(error)}`);
      if (isQuotaRestricted(error)) {
        console.error(
          "\nSupabase 서비스가 egress 한도로 제한 중입니다. 7/24 리셋 또는 플랜 업그레이드 후 다시 실행하세요."
        );
        break;
      }
    }
  }

  await db.end();

  console.log("\n--- 결과 ---");
  console.log(`성공: ${ok}`);
  console.log(`스킵: ${skipped}`);
  console.log(`실패: ${failed}`);
  console.log(`예상 절감: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
  return failed > 0 ? 1 : 0;
}

main()
  .then((code) => {
    process.exitCode = code ?? 0;
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
