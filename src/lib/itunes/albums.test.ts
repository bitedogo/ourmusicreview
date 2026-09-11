import { describe, expect, it } from "vitest";
import { classifyItunesReleaseType, isBlockedItunesAlbumTitle } from "./albums";

describe("isBlockedItunesAlbumTitle", () => {
  it("Discovery는 COVER 부분 문자열로 막지 않는다", () => {
    expect(isBlockedItunesAlbumTitle("Discovery")).toBe(false);
    expect(isBlockedItunesAlbumTitle("DISCOVERY")).toBe(false);
  });

  it("커버·트리뷰트 제목은 막는다", () => {
    expect(isBlockedItunesAlbumTitle("Very Disco (8-bit Tribute to Daft Punk)")).toBe(
      true,
    );
    expect(isBlockedItunesAlbumTitle("Daft Punk Cover Album")).toBe(true);
    expect(isBlockedItunesAlbumTitle("Homework (Fanmade)")).toBe(true);
  });
});

describe("classifyItunesReleaseType", () => {
  it("제목에 - Single이 있으면 싱글이다", () => {
    expect(classifyItunesReleaseType({ collectionName: "Not Like Us - Single" })).toBe(
      "single"
    );
  });

  it("collectionType이 single이면 싱글이다", () => {
    expect(
      classifyItunesReleaseType({
        collectionName: "Espresso",
        collectionType: "Single",
      })
    ).toBe("single");
  });

  it("트랙이 2곡 이하면 싱글이다", () => {
    expect(
      classifyItunesReleaseType({
        collectionName: "Espresso",
        trackCount: 1,
      })
    ).toBe("single");
  });

  it("그 외는 앨범이다", () => {
    expect(
      classifyItunesReleaseType({
        collectionName: "Short n' Sweet",
        trackCount: 12,
      })
    ).toBe("album");
  });
});
