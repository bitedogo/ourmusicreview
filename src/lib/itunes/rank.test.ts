import { describe, expect, it } from "vitest";
import type { ItunesArtistResult } from "./types";
import {
  artistNameRelevance,
  emptyCatalogSignals,
  rankArtistsByQuery,
  type ArtistCatalogSignals,
} from "./rank";

function artist(
  artistId: string,
  artistName: string,
  primaryGenreName?: string,
): ItunesArtistResult {
  return { artistId, artistName, primaryGenreName };
}

describe("artistNameRelevance", () => {
  it("소문자 입력에서도 별칭 공식 표기 Nirvana를 더 높게 친다", () => {
    expect(artistNameRelevance("nirvana", "Nirvana")).toBe(100);
    expect(artistNameRelevance("nirvana", "nirvana")).toBe(96);
  });

  it("곡 제목만 같은 다른 아티스트는 이름 일치로 보지 않는다", () => {
    expect(artistNameRelevance("nirvana", "Sam Smith")).toBe(0);
  });
});

describe("rankArtistsByQuery", () => {
  const famous = artist("112018", "Nirvana", "얼터너티브");
  const ukBand = artist("256176428", "Nirvana", "록");
  const hiphop = artist("1811614609", "Nirvana", "힙합/랩");
  const junk = artist("1584775376", "nirvana");

  it("같은 이름이어도 artistId를 합치지 않고 곡 인기 신호를 1등으로 올린다", () => {
    const signals = new Map<string, ArtistCatalogSignals>([
      [
        famous.artistId,
        { songHits: 8, songFirstIndex: 0, usArtistIndex: 0 },
      ],
      [
        ukBand.artistId,
        { ...emptyCatalogSignals(), usArtistIndex: 14 },
      ],
    ]);

    const ranked = rankArtistsByQuery(
      [junk, ukBand, hiphop, famous],
      "nirvana",
      signals,
    );

    expect(ranked.map((item) => item.artistId)).toEqual([
      famous.artistId,
      ukBand.artistId,
      hiphop.artistId,
      junk.artistId,
    ]);
    expect(ranked).toHaveLength(4);
  });

  it("대문자 검색어도 같은 유명한 artistId를 1등으로 둔다", () => {
    const signals = new Map<string, ArtistCatalogSignals>([
      [
        famous.artistId,
        { songHits: 8, songFirstIndex: 0, usArtistIndex: 0 },
      ],
    ]);

    const ranked = rankArtistsByQuery([ukBand, famous], "Nirvana", signals);
    expect(ranked[0]?.artistId).toBe(famous.artistId);
  });
});
