import { describe, expect, it } from "vitest";
import {
  parseAlbumReleaseType,
  resolveAlbumReleaseType,
} from "./release-type";

describe("parseAlbumReleaseType", () => {
  it("single만 싱글로 읽고 나머지는 앨범이다", () => {
    expect(parseAlbumReleaseType("single")).toBe("single");
    expect(parseAlbumReleaseType("album")).toBe("album");
    expect(parseAlbumReleaseType(null)).toBe("album");
    expect(parseAlbumReleaseType("ep")).toBe("album");
  });
});

describe("resolveAlbumReleaseType", () => {
  it("명시된 타입을 우선한다", () => {
    expect(resolveAlbumReleaseType("Song - Single", "album")).toBe("album");
    expect(resolveAlbumReleaseType("Random Access Memories", "single")).toBe(
      "single"
    );
  });

  it("타입이 없으면 제목의 - Single로 분류한다", () => {
    expect(resolveAlbumReleaseType("Not Like Us - Single")).toBe("single");
    expect(resolveAlbumReleaseType("To Pimp a Butterfly")).toBe("album");
  });
});
