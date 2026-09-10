import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchItunesOutcome,
  isItunesCoolingDown,
  resetItunesHttpStateForTests,
} from "./http";

describe("fetchItunesOutcome", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    resetItunesHttpStateForTests();
  });

  it("429 이후 쿨다운 동안 iTunes를 다시 치지 않는다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response("rate limited", { status: 429 }));
    vi.stubGlobal("fetch", fetchMock);

    const first = await fetchItunesOutcome("https://itunes.apple.com/search?term=a");
    expect(first).toEqual({ results: [], ok: false, throttled: true });
    expect(isItunesCoolingDown()).toBe(true);

    const second = await fetchItunesOutcome("https://itunes.apple.com/search?term=b");
    expect(second.throttled).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("브라우저 User-Agent 대신 서버용 UA를 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ results: [] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchItunesOutcome("https://itunes.apple.com/search?term=a");
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("User-Agent")).toBe("ORU/1.0");
  });
});
