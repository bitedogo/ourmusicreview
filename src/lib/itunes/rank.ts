/** 아티스트 검색 결과 랭킹 */

import { normalizeForMatch } from "@/src/lib/text/match";
import { shareArtistAliasGroup } from "@/src/lib/search/artist-aliases";
import type { ItunesArtistResult } from "./types";

export function artistNameRelevance(query: string, artistName: string): number {
  const q = normalizeForMatch(query);
  const name = normalizeForMatch(artistName);
  if (!q || !name) return 0;
  if (name === q) return 100;
  if (shareArtistAliasGroup(query, artistName)) return 95;
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
        a.artist.artistName.localeCompare(b.artist.artistName),
    )
    .map((entry) => entry.artist);
}
