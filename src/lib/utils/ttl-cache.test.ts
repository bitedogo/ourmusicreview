import { afterEach, describe, expect, it, vi } from "vitest";
import { createTtlCache } from "./ttl-cache";

describe("createTtlCache", () => {
  afterEach(() => vi.useRealTimers());

  it("TTL이 지난 항목을 제거한다", () => {
    vi.useFakeTimers();
    const cache = createTtlCache<number>(1000);
    cache.set("a", 1);
    vi.advanceTimersByTime(1001);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("최대 크기를 넘으면 가장 오래 사용하지 않은 항목을 제거한다", () => {
    const cache = createTtlCache<number>(1000, 2);
    cache.set("a", 1);
    cache.set("b", 2);
    expect(cache.get("a")).toBe(1);
    cache.set("c", 3);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("a")).toBe(1);
    expect(cache.get("c")).toBe(3);
  });
});
