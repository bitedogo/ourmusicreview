import { describe, expect, it } from "vitest";
import {
  mapItunesSong,
  mergeSongResults,
  sanitizePreviewUrl,
} from "./song-snapshot";

describe("sanitizePreviewUrl", () => {
  it("Apple 미리듣기 주소만 남긴다", () => {
    expect(
      sanitizePreviewUrl(
        "https://audio-ssl.itunes.apple.com/itunes-assets/preview.m4a"
      )
    ).toBe("https://audio-ssl.itunes.apple.com/itunes-assets/preview.m4a");
    expect(sanitizePreviewUrl("https://example.com/preview.m4a")).toBeNull();
    expect(sanitizePreviewUrl("http://audio-ssl.itunes.apple.com/a.m4a")).toBeNull();
  });
});

describe("mapItunesSong", () => {
  it("곡 번호와 이름이 있으면 스냅샷을 만든다", () => {
    expect(
      mapItunesSong({
        wrapperType: "track",
        kind: "song",
        trackId: 12,
        trackName: "Five Years",
        artistName: "David Bowie",
        collectionId: 34,
        collectionName: "Ziggy",
        artworkUrl100:
          "https://is1-ssl.mzstatic.com/image/thumb/Music/v4/a/100x100bb.jpg",
        previewUrl: "https://audio-ssl.itunes.apple.com/preview.m4a",
      })
    ).toMatchObject({
      trackId: "12",
      trackName: "Five Years",
      artistName: "David Bowie",
      collectionId: "34",
      previewUrl: "https://audio-ssl.itunes.apple.com/preview.m4a",
    });
  });

  it("컬렉션 행은 버린다", () => {
    expect(
      mapItunesSong({
        wrapperType: "collection",
        collectionId: 1,
        collectionName: "Ziggy",
      })
    ).toBeNull();
  });
});

describe("mergeSongResults", () => {
  it("같은 곡은 먼저 온 결과를 유지한다", () => {
    const first = {
      wrapperType: "track",
      kind: "song",
      trackId: 1,
      trackName: "US",
      artistName: "A",
    };
    const second = {
      wrapperType: "track",
      kind: "song",
      trackId: 1,
      trackName: "KR",
      artistName: "A",
    };
    const extra = {
      wrapperType: "track",
      kind: "song",
      trackId: 2,
      trackName: "Only KR",
      artistName: "B",
    };

    expect(mergeSongResults([[first], [second, extra]], 8).map((track) => track.trackName)).toEqual([
      "US",
      "Only KR",
    ]);
  });
});
