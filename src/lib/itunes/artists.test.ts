import { afterEach, describe, expect, it, vi } from "vitest";
import { resetArtistSearchStateForTests, searchArtists } from "./artists";
import { resetItunesHttpStateForTests } from "./http";

function artistSearchResponse(artistName: string, artistId: number) {
  return new Response(
    JSON.stringify({
      results: [
        {
          artistId,
          artistName,
          artistLinkUrl: "https://example.com",
          primaryGenreName: "Pop",
        },
      ],
    }),
    { status: 200 },
  );
}

describe("searchArtists", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetItunesHttpStateForTests();
    resetArtistSearchStateForTests();
  });

  it("고유한 강한 매치면 자동완성에서 KR 아티스트 검색만 한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(artistSearchResponse("Radiohead", 12345));
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchArtists("Radiohead", { limit: 5, light: true });

    expect(results).toEqual([
      expect.objectContaining({ artistId: "12345", artistName: "Radiohead" }),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("entity=musicArtist");
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("country=KR");
  });

  it("KR에 강한 매치가 없으면 US 카탈로그도 본다", async () => {
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url.includes("country=KR")) {
        return artistSearchResponse("radiohead two", 99);
      }
      return artistSearchResponse("Radiohead", 12345);
    });
    vi.stubGlobal("fetch", fetchMock);

    const results = await searchArtists("Radiohead", { limit: 5, light: true });

    expect(results[0]).toEqual(
      expect.objectContaining({ artistId: "12345", artistName: "Radiohead" }),
    );
    expect(fetchMock.mock.calls.some((call) => String(call[0]).includes("country=KR"))).toBe(true);
    expect(fetchMock.mock.calls.some((call) => !String(call[0]).includes("country=KR"))).toBe(true);
  });
});
