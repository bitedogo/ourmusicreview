import { describe, expect, it, vi } from "vitest";
import { fetchArtistAutocomplete, isAbortError } from "./search";

describe("isAbortError", () => {
  it("AbortError만 중단으로 본다", () => {
    const abort = new Error("Aborted");
    abort.name = "AbortError";
    expect(isAbortError(abort)).toBe(true);
    expect(isAbortError(new Error("network"))).toBe(false);
    expect(isAbortError("AbortError")).toBe(false);
  });
});

describe("fetchArtistAutocomplete", () => {
  it("두 글자 미만이면 요청하지 않는다", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(fetchArtistAutocomplete("아")).resolves.toEqual({
      results: [],
      throttled: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
