import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { enforceRateLimit, getRequestIp } from "./rate-limit";

describe("getRequestIp", () => {
  it("일반 Request의 신뢰 프록시 헤더를 읽는다", () => {
    const request = new Request("http://localhost", {
      headers: {
        "cf-connecting-ip": "203.0.113.10",
        "x-forwarded-for": "198.51.100.1",
      },
    });

    expect(getRequestIp(request)).toBe("203.0.113.10");
  });

  it("NextAuth 내부 헤더 객체에서 첫 전달 IP를 읽는다", () => {
    expect(
      getRequestIp({ "x-forwarded-for": "198.51.100.3, 10.0.0.1" }),
    ).toBe("198.51.100.3");
  });
});

describe("enforceRateLimit", () => {
  it("차단 시간이 반환되면 429 오류를 낸다", async () => {
    const dataSource = {
      query: vi.fn().mockResolvedValue([
        { request_count: 11, blocked_until: new Date(Date.now() + 60_000) },
      ]),
    } as unknown as DataSource;

    await expect(
      enforceRateLimit(dataSource, {
        scope: "login",
        key: "ip:user",
        limit: 10,
        windowSeconds: 600,
      }),
    ).rejects.toMatchObject({ status: 429 });
  });
});
