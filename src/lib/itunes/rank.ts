/** 아티스트 검색 결과 랭킹 */

import { normalizeForMatch } from "@/src/lib/text/match";
import {
  expandArtistSearchTerms,
  shareArtistAliasGroup,
} from "@/src/lib/search/artist-aliases";
import type { ItunesArtistResult } from "./types";

/** 정규화 시 한자·특수문자 등이 섞여 잘못 매칭되는 이름 (예: 倍源iu → iu) */
function isNoisyArtistName(artistName: string): boolean {
  return /[^\s\-_.·'’a-zA-Z0-9가-힣]/.test(artistName);
}

function aliasLabels(query: string): string[] {
  return expandArtistSearchTerms(query).map((label) => label.trim()).filter(Boolean);
}

export function artistNameRelevance(query: string, artistName: string): number {
  const q = normalizeForMatch(query);
  const name = normalizeForMatch(artistName);
  if (!q || !name) return 0;

  const noisy = isNoisyArtistName(artistName);
  const trimmedName = artistName.trim();
  const labels = aliasLabels(query);

  // 별칭 표기와 대소문자까지 동일 (IU, 아이유)
  if (labels.some((label) => label === trimmedName)) return 100;
  // 대소문자만 다른 iu / Iu 등
  if (
    labels.some((label) => label.toLowerCase() === trimmedName.toLowerCase())
  ) {
    return 96;
  }

  if (name === q) {
    // 정규화만 같은 노이즈 이름(倍源iu, 由 -iu- 등)은 제외
    if (noisy) return 0;
    return 90;
  }

  if (shareArtistAliasGroup(query, artistName)) {
    if (noisy) return 0;
    return 80;
  }

  if (noisy) return 0;
  if (name.startsWith(q)) return 70;
  if (name.includes(q)) return 40;
  return 0;
}

export function rankArtistsByQuery(
  artists: ItunesArtistResult[],
  query: string,
): ItunesArtistResult[] {
  return artists
    .map((artist) => ({
      artist,
      score: artistNameRelevance(query, artist.artistName),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.artist.artistName.length - b.artist.artistName.length ||
        a.artist.artistName.localeCompare(b.artist.artistName),
    )
    .map((entry) => entry.artist);
}
