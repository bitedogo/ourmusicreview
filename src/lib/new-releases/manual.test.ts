import { describe, expect, it } from "vitest";
import {
  generateManualCollectionId,
  isManualCollectionId,
  shouldPurgeManualRelease,
} from "./manual";

describe("generateManualCollectionId", () => {
  it("숫자 iTunes id와 겹치지 않는 접두사를 붙인다", () => {
    const id = generateManualCollectionId();
    expect(isManualCollectionId(id)).toBe(true);
    expect(/^\d+$/.test(id)).toBe(false);
  });
});

describe("shouldPurgeManualRelease", () => {
  it("직접 등록이고 발매일이 지났으면 지운다", () => {
    expect(shouldPurgeManualRelease("manual", "2026-09-09", "2026-09-10")).toBe(true);
    expect(shouldPurgeManualRelease("manual", "2026-09-10", "2026-09-10")).toBe(false);
    expect(shouldPurgeManualRelease("itunes", "2026-09-09", "2026-09-10")).toBe(false);
  });
});
