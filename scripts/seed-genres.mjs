/**
 * 장르 시드 데이터
 * 사용: npm run db:seed:genres
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
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

/** @type {{ id: string, nameKo: string, nameEn: string, parentId: string | null }[]} */
const GENRES = [
  { id: "hiphop", nameKo: "힙합", nameEn: "Hip-hop", parentId: null },
  { id: "rock", nameKo: "록·밴드", nameEn: "Rock", parentId: null },
  { id: "rnb", nameKo: "R&B·Soul", nameEn: "R&B & Soul", parentId: null },
  { id: "electronic", nameKo: "일렉트로닉", nameEn: "Electronic", parentId: null },
  { id: "pop", nameKo: "팝", nameEn: "Pop", parentId: null },
  { id: "jazz", nameKo: "재즈", nameEn: "Jazz", parentId: null },
  {
    id: "comprehensive",
    nameKo: "종합",
    nameEn: "Comprehensive",
    parentId: null,
  },

  { id: "experimental-hiphop", nameKo: "익스페리멘탈 힙합", nameEn: "Experimental Hip-hop", parentId: "hiphop" },
  { id: "boom-bap", nameKo: "붐뱁", nameEn: "Boom Bap", parentId: "hiphop" },
  { id: "trap", nameKo: "트랩", nameEn: "Trap", parentId: "hiphop" },
  { id: "jazz-hop", nameKo: "재즈 힙합", nameEn: "Jazz Hop", parentId: "hiphop" },
  { id: "alternative-rap", nameKo: "얼터너티브 랩", nameEn: "Alternative Rap", parentId: "hiphop" },
  { id: "memphis-rap", nameKo: "멤피스 랩", nameEn: "Memphis Rap", parentId: "hiphop" },
  { id: "cloud-rap", nameKo: "클라우드 랩", nameEn: "Cloud Rap", parentId: "hiphop" },

  { id: "shoegaze", nameKo: "슈게이징", nameEn: "Shoegaze", parentId: "rock" },
  { id: "post-rock", nameKo: "포스트 록", nameEn: "Post-rock", parentId: "rock" },
  { id: "indie-rock", nameKo: "인디 록", nameEn: "Indie Rock", parentId: "rock" },
  { id: "grunge", nameKo: "그런지", nameEn: "Grunge", parentId: "rock" },
  { id: "alternative-rock", nameKo: "얼터너티브", nameEn: "Alternative", parentId: "rock" },
  { id: "psychedelic-rock", nameKo: "사이케델릭 록", nameEn: "Psychedelic Rock", parentId: "rock" },
  { id: "math-rock", nameKo: "매스 록", nameEn: "Math Rock", parentId: "rock" },
  { id: "post-punk", nameKo: "포스트 펑크", nameEn: "Post-punk", parentId: "rock" },

  { id: "alt-rnb", nameKo: "얼터너티브 R&B", nameEn: "Alt R&B", parentId: "rnb" },
  { id: "neo-soul", nameKo: "네오 소울", nameEn: "Neo Soul", parentId: "rnb" },
  { id: "contemporary-rnb", nameKo: "컨템포러리 R&B", nameEn: "Contemporary R&B", parentId: "rnb" },
  { id: "indie-rnb", nameKo: "인디 R&B", nameEn: "Indie R&B", parentId: "rnb" },

  { id: "ambient", nameKo: "앰비언트", nameEn: "Ambient", parentId: "electronic" },
  { id: "hyperpop", nameKo: "하이퍼팝", nameEn: "Hyperpop", parentId: "electronic" },
  { id: "synthwave", nameKo: "신스웨이브", nameEn: "Synthwave", parentId: "electronic" },
  { id: "house", nameKo: "하우스", nameEn: "House", parentId: "electronic" },
  { id: "techno", nameKo: "테크노", nameEn: "Techno", parentId: "electronic" },
  { id: "idm", nameKo: "IDM", nameEn: "IDM", parentId: "electronic" },

  { id: "dream-pop", nameKo: "드림 팝", nameEn: "Dream Pop", parentId: "pop" },
  { id: "indie-pop", nameKo: "인디 팝", nameEn: "Indie Pop", parentId: "pop" },
  { id: "city-pop", nameKo: "시티 팝", nameEn: "City Pop", parentId: "pop" },
  { id: "synth-pop", nameKo: "신스 팝", nameEn: "Synth Pop", parentId: "pop" },
];

const databaseUrl =
  process.env.DATABASE_URL?.trim() ?? readDatabaseUrlFromEnvLocal();

if (!databaseUrl) {
  console.error("DATABASE_URL 환경 변수가 필요합니다.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl:
    databaseUrl.includes("localhost") || databaseUrl.includes("placeholder")
      ? false
      : { rejectUnauthorized: false },
});

try {
  await client.connect();

  // parents first, then children
  const parents = GENRES.filter((g) => g.parentId == null);
  const children = GENRES.filter((g) => g.parentId != null);

  for (const genre of [...parents, ...children]) {
    await client.query(
      `INSERT INTO public.genres (id, name_ko, name_en, parent_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         name_ko = EXCLUDED.name_ko,
         name_en = EXCLUDED.name_en,
         parent_id = EXCLUDED.parent_id`,
      [genre.id, genre.nameKo, genre.nameEn, genre.parentId]
    );
  }

  console.log(`장르 시드 완료: ${GENRES.length}개`);
} catch (error) {
  console.error("시드 실패:", error);
  process.exitCode = 1;
} finally {
  await client.end();
}
