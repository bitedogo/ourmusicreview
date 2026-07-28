/** 아티스트 별칭 인덱스·검색어 확장 */

import { ARTIST_ALIAS_GROUPS } from "@/src/lib/search/artist-alias-groups";
import { normalizeForMatch } from "@/src/lib/text/match";

interface AliasGroup {
  labels: readonly string[];
  keys: ReadonlySet<string>;
}

const HANGUL_ONLY = /^[가-힣]+$/;
const MIN_PARTIAL_LEN = 2;
const MIN_INCLUDES_LEN = 3;

function buildIndex(groups: readonly (readonly string[])[]): {
  byKey: Map<string, AliasGroup>;
  list: AliasGroup[];
} {
  const byKey = new Map<string, AliasGroup>();
  const list: AliasGroup[] = [];

  for (const raw of groups) {
    const labels = [
      ...new Set(raw.map((s) => s.trim()).filter(Boolean)),
    ];
    if (labels.length < 2) continue;

    const keys = new Set(
      labels.map((label) => normalizeForMatch(label)).filter(Boolean),
    );
    const group: AliasGroup = { labels, keys };
    list.push(group);

    for (const key of keys) {
      byKey.set(key, group);
    }
  }

  return { byKey, list };
}

const { byKey: ALIAS_BY_KEY, list: ALIAS_LIST } = buildIndex(ARTIST_ALIAS_GROUPS);

function keyMatchesQuery(key: string, query: string): boolean {
  if (key.startsWith(query)) return true;
  return query.length >= MIN_INCLUDES_LEN && key.includes(query);
}

/** 쿼리와 연결된 별칭 그룹 (exact → partial) */
function resolveGroups(query: string): AliasGroup[] {
  const q = normalizeForMatch(query);
  if (!q) return [];

  const exact = ALIAS_BY_KEY.get(q);
  if (exact) return [exact];
  if (q.length < MIN_PARTIAL_LEN) return [];

  return ALIAS_LIST.filter((group) =>
    [...group.keys].some((key) => keyMatchesQuery(key, q)),
  );
}

/** 같은 아티스트로 보이는 모든 표기 (원문 포함) */
export function expandArtistSearchTerms(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const out = new Set<string>([trimmed]);
  for (const group of resolveGroups(trimmed)) {
    for (const label of group.labels) out.add(label);
  }
  return [...out];
}

/**
 * iTunes API용 검색어.
 * 원문 + 라틴 표기만 — 한글 동의어 중복 호출 방지.
 */
export function expandArtistSearchTermsForItunes(term: string): string[] {
  const trimmed = term.trim();
  if (!trimmed) return [];

  return expandArtistSearchTerms(trimmed).filter((label) => {
    if (label === trimmed) return true;
    const key = normalizeForMatch(label);
    return Boolean(key) && !HANGUL_ONLY.test(key);
  });
}

/** 쿼리와 아티스트명이 같은 별칭 그룹이면 true */
export function shareArtistAliasGroup(
  query: string,
  artistName: string,
): boolean {
  const nameKey = normalizeForMatch(artistName);
  if (!nameKey) return false;
  return resolveGroups(query).some((group) => group.keys.has(nameKey));
}

export { ARTIST_ALIAS_GROUPS } from "@/src/lib/search/artist-alias-groups";
