/**
 * Supabase Storage 공개 URL → R2 공개 URL 로 DB만 치환
 * (파일이 R2에 같은 key로 이미 있을 때. Supabase 다운로드 불필요)
 *
 * 사용:
 *   npm run media:rewrite-r2-urls -- --dry-run
 *   npm run media:rewrite-r2-urls
 *
 * 필요 env: DATABASE_URL, R2_PUBLIC_BASE_URL
 * 선택: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL (기본: DB에 있는 supabase 호스트 자동)
 */
import { readFileSync, existsSync } from "fs";
import { Client } from "pg";

const DRY_RUN = process.argv.includes("--dry-run");
const BUCKET = "profiles";

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

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} 환경 변수가 필요합니다.`);
  return value;
}

function storagePublicPrefix(supabaseOrigin) {
  return `${supabaseOrigin.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}`;
}

async function main() {
  const databaseUrl = requireEnv("DATABASE_URL");
  const r2Base = requireEnv("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const supabaseOrigin = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  if (!supabaseOrigin) {
    throw new Error("SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL 이 필요합니다.");
  }

  const oldPrefix = storagePublicPrefix(supabaseOrigin);
  const newPrefix = r2Base;

  console.log(`old: ${oldPrefix}/…`);
  console.log(`new: ${newPrefix}/…`);
  console.log(DRY_RUN ? "mode: dry-run\n" : "mode: apply\n");

  const db = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });
  await db.connect();

  const like = `${oldPrefix}%`;

  const [{ rows: users }, { rows: playlists }] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS n FROM users
       WHERE profile_image LIKE $1`,
      [like]
    ),
    db.query(
      `SELECT COUNT(*)::int AS n FROM playlists
       WHERE cover_image_url LIKE $1`,
      [like]
    ),
  ]);

  const userCount = users[0]?.n ?? 0;
  const playlistCount = playlists[0]?.n ?? 0;
  console.log(`대상: users.profile_image=${userCount}, playlists.cover_image_url=${playlistCount}`);

  if (userCount + playlistCount === 0) {
    await db.end();
    console.log("바꿀 Supabase Storage URL이 없습니다.");
    return 0;
  }

  // 스모크: R2에 파일이 있는지 한 건만 HEAD
  const { rows: sample } = await db.query(
    `SELECT cover_image_url AS url FROM playlists WHERE cover_image_url LIKE $1 LIMIT 1`,
    [like]
  );
  if (sample[0]?.url) {
    const key = sample[0].url.slice(oldPrefix.length).replace(/^\//, "");
    const probeUrl = `${newPrefix}/${key}`;
    const probe = await fetch(probeUrl, { method: "HEAD" });
    console.log(`R2 스모크 HEAD ${probe.status}: ${probeUrl}`);
    if (!probe.ok) {
      await db.end();
      console.error(
        "\nR2에서 파일을 못 찾았습니다. 버킷에 같은 경로로 파일이 있는지, R2_PUBLIC_BASE_URL이 맞는지 확인하세요.\n" +
          "예: playlists/….webp → https://<R2_PUBLIC_BASE_URL>/playlists/….webp"
      );
      return 1;
    }
  }

  if (DRY_RUN) {
    await db.end();
    console.log("\ndry-run 완료. 적용하려면: npm run media:rewrite-r2-urls");
    return 0;
  }

  const userResult = await db.query(
    `UPDATE users
     SET profile_image = replace(profile_image, $1, $2)
     WHERE profile_image LIKE $3`,
    [oldPrefix, newPrefix, like]
  );
  const playlistResult = await db.query(
    `UPDATE playlists
     SET cover_image_url = replace(cover_image_url, $1, $2)
     WHERE cover_image_url LIKE $3`,
    [oldPrefix, newPrefix, like]
  );

  await db.end();
  console.log(
    `완료: users=${userResult.rowCount ?? 0}, playlists=${playlistResult.rowCount ?? 0}`
  );
  return 0;
}

main()
  .then((code) => process.exit(code ?? 0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
