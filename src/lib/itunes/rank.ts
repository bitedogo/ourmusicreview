/** 아티스트 검색 결과 랭킹 */

import { normalizeForMatch } from "@/src/lib/text/match";
import {
  expandArtistSearchTerms,
  shareArtistAliasGroup,
} from "@/src/lib/search/artist-aliases";
import type { ItunesArtistResult } from "./types";

/** 곡 검색에서 아티스트 후보로 쓸 최소 이름 일치 점수 (곡 제목 오탐 제외) */
export const SONG_ARTIST_MATCH_MIN = 90;

export interface ArtistCatalogSignals {
  songHits: number;
  songFirstIndex: number;
  usArtistIndex: number;
}

export function emptyCatalogSignals(): ArtistCatalogSignals {
  return {
    songHits: 0,
    songFirstIndex: Number.POSITIVE_INFINITY,
    usArtistIndex: Number.POSITIVE_INFINITY,
  };
}

/** 정규화 시 한자·특수문자 등이 섞여 잘못 매칭되는 이름 (예: 倍源iu → iu) */
function isNoisyArtistName(artistName: string): boolean {
  return /[^\s\-_.·'’a-zA-Z0-9가-힣]/.test(artistName);
}

function aliasLabels(query: string): string[] {
  return expandArtistSearchTerms(query).map((label) => label.trim()).filter(Boolean);
}

/** 별칭 그룹의 공식 표기만. 사용자가 친 원문은 제외 */
function canonicalAliasLabels(query: string): string[] {
  const trimmed = query.trim();
  return aliasLabels(query).filter((label) => label !== trimmed);
}

export function artistNameRelevance(query: string, artistName: string): number {
  const q = normalizeForMatch(query);
  const name = normalizeForMatch(artistName);
  if (!q || !name) return 0;

  const noisy = isNoisyArtistName(artistName);
  const trimmedName = artistName.trim();
  const labels = aliasLabels(query);
  const canonical = canonicalAliasLabels(query);

  // 별칭 공식 표기와 대소문자까지 동일 (Nirvana, 아이유) — 입력 원문 "nirvana"는 제외
  if (canonical.some((label) => label === trimmedName)) return 100;
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

export function catalogPopularity(signals: ArtistCatalogSignals): number {
  const song =
    signals.songHits > 0
      ? signals.songHits * 20 + Math.max(0, 80 - signals.songFirstIndex)
      : 0;
  const usCatalog = Number.isFinite(signals.usArtistIndex)
    ? Math.max(0, 20 - signals.usArtistIndex)
    : 0;
  return song + usCatalog;
}

function completenessBonus(artist: ItunesArtistResult): number {
  return (artist.primaryGenreName ? 2 : 0) + (artist.artworkUrl100 ? 1 : 0);
}

export function rankArtistsByQuery(
  artists: ItunesArtistResult[],
  query: string,
  signalsById: ReadonlyMap<string, ArtistCatalogSignals> = new Map(),
): ItunesArtistResult[] {
  return artists
    .map((artist) => ({
      artist,
      relevance: artistNameRelevance(query, artist.artistName),
      popularity:
        catalogPopularity(
          signalsById.get(artist.artistId) ?? emptyCatalogSignals(),
        ) + completenessBonus(artist),
    }))
    .filter((entry) => entry.relevance > 0)
    .sort(
      (a, b) =>
        b.relevance - a.relevance ||
        b.popularity - a.popularity ||
        a.artist.artistName.length - b.artist.artistName.length ||
        a.artist.artistName.localeCompare(b.artist.artistName),
    )
    .map((entry) => entry.artist);
}
