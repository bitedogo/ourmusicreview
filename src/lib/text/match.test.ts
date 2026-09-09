import { describe, expect, it } from "vitest";
import {
  albumTitleDedupeKey,
  albumVariantPenalty,
  isRemasterAlbumTitle,
} from "./match";

describe("albumTitleDedupeKey", () => {
  it("원본과 리마스터·디럭스를 서로 다른 키로 둔다", () => {
    const original = albumTitleDedupeKey("The Rise and Fall of Ziggy Stardust");
    const remaster = albumTitleDedupeKey(
      "The Rise and Fall of Ziggy Stardust (2012 Remaster)",
    );
    const deluxe = albumTitleDedupeKey(
      "The Rise and Fall of Ziggy Stardust (Deluxe)",
    );

    expect(original).toBeTruthy();
    expect(remaster).not.toBe(original);
    expect(deluxe).not.toBe(original);
    expect(remaster).not.toBe(deluxe);
  });

  it("리마스터 제목을 감지한다", () => {
    expect(isRemasterAlbumTitle("Heroes (2017 Remaster)")).toBe(true);
    expect(isRemasterAlbumTitle("Heroes")).toBe(false);
  });
});

describe("albumVariantPenalty", () => {
  it("원제목은 0, 리마스터는 더 높다", () => {
    expect(albumVariantPenalty("Heroes")).toBe(0);
    expect(albumVariantPenalty("Heroes (2017 Remaster)")).toBeGreaterThan(0);
  });
});
