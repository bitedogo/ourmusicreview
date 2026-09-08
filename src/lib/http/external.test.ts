import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ExternalHttpError, fetchExternalJson } from "./external";

describe("fetchExternalJson", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("응답 스키마를 검증한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ value: 3 }), { status: 200 })
      )
    );
    await expect(
      fetchExternalJson(
        "https://example.com",
        {},
        {
          provider: "test",
          retries: 0,
          schema: z.object({ value: z.number() }),
        }
      )
    ).resolves.toEqual({ value: 3 });
  });

  it("유효하지 않은 응답을 공급자 오류로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ value: "invalid" }), { status: 200 })
      )
    );
    await expect(
      fetchExternalJson(
        "https://example.com",
        {},
        {
          provider: "test",
          retries: 0,
          schema: z.object({ value: z.number() }),
        }
      )
    ).rejects.toBeInstanceOf(ExternalHttpError);
  });
});
