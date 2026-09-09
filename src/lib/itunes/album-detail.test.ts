import { describe, expect, it } from "vitest";
import {
  mergeAlbumLookups,
  parseAlbumLookupResults,
  pickCrossStoreAlbumMatch,
} from "./album-detail";

describe("parseAlbumLookupResults", () => {
  it("컬렉션만 있으면 트랙은 비운다", () => {
    const parsed = parseAlbumLookupResults([
      {
        wrapperType: "collection",
        collectionId: 1,
        collectionName: "Ziggy",
        artistName: "David Bowie",
      },
    ]);
    expect(parsed.collection?.collectionName).toBe("Ziggy");
    expect(parsed.tracks).toEqual([]);
  });

  it("트랙을 디스크·번호 순으로 정렬한다", () => {
    const parsed = parseAlbumLookupResults([
      {
        wrapperType: "collection",
        collectionId: 1,
        collectionName: "Ziggy",
        artistName: "David Bowie",
      },
      {
        wrapperType: "track",
        trackId: 2,
        trackName: "Moonage",
        trackNumber: 2,
        discNumber: 1,
      },
      {
        wrapperType: "track",
        trackId: 1,
        trackName: "Five Years",
        trackNumber: 1,
        discNumber: 1,
      },
    ]);
    expect(parsed.tracks.map((track) => track.title)).toEqual(["Five Years", "Moonage"]);
  });
});

describe("mergeAlbumLookups", () => {
  it("KR 곡이 없으면 US 트랙을 쓴다", () => {
    const merged = mergeAlbumLookups(
      {
        collection: { wrapperType: "collection", collectionName: "지기", primaryGenreName: "록" },
        tracks: [],
      },
      {
        collection: { wrapperType: "collection", collectionName: "Ziggy", primaryGenreName: "Rock" },
        tracks: [
          {
            id: "1",
            trackNumber: 1,
            discNumber: 1,
            title: "Five Years",
            durationMs: 1000,
            artists: ["David Bowie"],
            explicit: false,
            previewUrl: null,
          },
        ],
      },
    );
    expect(merged.collection?.collectionName).toBe("지기");
    expect(merged.tracks).toHaveLength(1);
    expect(merged.tracks[0]?.title).toBe("Five Years");
  });

  it("KR 곡이 있으면 KR 트랙을 유지한다", () => {
    const merged = mergeAlbumLookups(
      {
        collection: { wrapperType: "collection", collectionName: "꽃" },
        tracks: [
          {
            id: "9",
            trackNumber: 1,
            discNumber: 1,
            title: "좋은 날",
            durationMs: 1000,
            artists: ["아이유"],
            explicit: false,
            previewUrl: null,
          },
        ],
      },
      {
        collection: { wrapperType: "collection", collectionName: "Flower" },
        tracks: [
          {
            id: "9",
            trackNumber: 1,
            discNumber: 1,
            title: "Good Day",
            durationMs: 1000,
            artists: ["IU"],
            explicit: false,
            previewUrl: null,
          },
        ],
      },
    );
    expect(merged.tracks[0]?.title).toBe("좋은 날");
  });
});

describe("pickCrossStoreAlbumMatch", () => {
  const oasis = { wrapperType: "collection", artistName: "Oasis" };

  it("원본은 디럭스가 아니라 같은 제목의 US 앨범을 고른다", () => {
    const id = pickCrossStoreAlbumMatch(
      { collectionId: 207010732, collectionName: "Be Here Now", artistName: "Oasis" },
      [
        { ...oasis, collectionId: 1523139329, collectionName: "Be Here Now (Deluxe Remastered Edition)" },
        { ...oasis, collectionId: 1517475368, collectionName: "Be Here Now" },
      ],
    );
    expect(id).toBe(1517475368);
  });

  it("디럭스는 원본이 아니라 디럭스 키와 맞는 앨범을 고른다", () => {
    const id = pickCrossStoreAlbumMatch(
      {
        collectionId: 1135095475,
        collectionName: "Be Here Now (Remastered - Deluxe)",
        artistName: "Oasis",
      },
      [
        { ...oasis, collectionId: 1517475368, collectionName: "Be Here Now" },
        { ...oasis, collectionId: 1523139329, collectionName: "Be Here Now (Deluxe Remastered Edition)" },
      ],
    );
    expect(id).toBe(1523139329);
  });

  it("같은 collectionId는 건너뛴다", () => {
    const id = pickCrossStoreAlbumMatch(
      { collectionId: 1517475368, collectionName: "Be Here Now", artistName: "Oasis" },
      [{ ...oasis, collectionId: 1517475368, collectionName: "Be Here Now" }],
    );
    expect(id).toBeNull();
  });
});
