import { describe, expect, it } from "vitest";
import { isBlockedItunesAlbumTitle } from "./albums";

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
