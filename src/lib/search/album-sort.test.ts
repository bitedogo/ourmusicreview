import { describe, expect, it } from "vitest";
import type { SearchAlbumResult } from "./types";
import { parseAlbumListSort, sortSearchAlbums } from "./album-sort";

function album(
  collectionId: string,
  collectionName: string,
  releaseDate: string,
  popularityScore = 0,
): SearchAlbumResult {
  return {
    collectionId,
    collectionName,
    artistName: "David Bowie",
    artworkUrl100: "",
    releaseDate,
    primaryGenreName: "Rock",
    imageUrl600: null,
    releaseType: "album",
    popularityScore,
  };
}

describe("sortSearchAlbums", () => {
  const ziggy = album("1", "Ziggy", "1972-06-16", 80);
  const blackstar = album("2", "Blackstar", "2016-01-08", 40);
  const nextDay = album("3", "The Next Day", "2013-03-08", 90);

  it("최신순·과거순·인기순으로 나눈다", () => {
    const list = [ziggy, blackstar, nextDay];
    expect(sortSearchAlbums(list, "newest").map((item) => item.collectionId)).toEqual([
      "2",
      "3",
      "1",
    ]);
    expect(sortSearchAlbums(list, "oldest").map((item) => item.collectionId)).toEqual([
      "1",
      "3",
      "2",
    ]);
    expect(sortSearchAlbums(list, "popular").map((item) => item.collectionId)).toEqual([
      "3",
      "1",
      "2",
    ]);
  });
});

describe("parseAlbumListSort", () => {
  it("알 수 없는 값은 과거순이다", () => {
    expect(parseAlbumListSort("newest")).toBe("newest");
    expect(parseAlbumListSort("nope")).toBe("oldest");
  });
});
