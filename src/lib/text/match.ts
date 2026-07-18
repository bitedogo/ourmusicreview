/** 텍스트 매칭·하이라이트 유틸 */

export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9가-힣]/g, "")
    .trim();
}

/**
 * 괄호/대괄호 안 내용과 " - ..." 접미를 제거한 순수 앨범명.
 * 예: "Abbey Road (Remastered)" → "Abbey Road"
 */
export function pureAlbumTitle(value: string): string {
  return value
    .replace(/\(.*?\)/g, " ")
    .replace(/\[.*?\]/g, " ")
    .replace(/\s*[-–—]\s+.+$/u, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DELUXE_PATTERN = /\b(deluxe|super\s*deluxe)\b/i;

export function isDeluxeAlbumTitle(title: string): boolean {
  return DELUXE_PATTERN.test(title);
}

/** 중복 제거용 키: 순수 앨범명을 문자만 남겨 비교 (디럭스는 원본과 별도 유지) */
export function albumTitleDedupeKey(title: string): string {
  const base = pureAlbumTitle(title)
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "");
  if (!base) return "";
  // 디럭스판은 정규 앨범과 같은 키로 합치지 않음
  return isDeluxeAlbumTitle(title) ? `${base}__deluxe` : base;
}

const ALBUM_VARIANT_PATTERN =
  /\b(remaster(?:ed)?|expanded|anniversary|edition|live|bonus|extended|instrumental|acoustic|remix(?:ed)?|explicit|clean|mono|stereo)\b/gi;

/** 제목에서 10th / 20th / 30th 같은 기념 회차 추출 */
export function albumAnniversaryOrdinal(title: string): number | null {
  const match = title.match(/\b(\d{1,3})(?:st|nd|rd|th)\b/i);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** 변형판일수록 점수가 높음 → 중복 시 점수가 낮은(원본에 가까운) 쪽을 남김 */
export function albumVariantPenalty(title: string): number {
  let penalty = 0;
  if (/\(/.test(title) || /\[/.test(title)) penalty += 10;
  if (/\s[-–—]\s/.test(title)) penalty += 10;
  const matches = title.match(ALBUM_VARIANT_PATTERN);
  if (matches) penalty += matches.length * 20;

  // 30th > 20th > 10th 순으로 패널티 ↑ → 더 오래된 기념판(10th) 우선
  const ordinal = albumAnniversaryOrdinal(title);
  if (ordinal != null) penalty += 25 + ordinal;

  return penalty;
}

export function looseMatch(a: string, b: string): boolean {
  const normalizedA = normalizeForMatch(a);
  const normalizedB = normalizeForMatch(b);
  if (!normalizedA || !normalizedB) return false;
  return (
    normalizedA === normalizedB ||
    normalizedA.includes(normalizedB) ||
    normalizedB.includes(normalizedA)
  );
}
