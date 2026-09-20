import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/src/lib/http/client";

vi.mock("@/src/lib/reviews/client-api", () => ({
  checkReviewExists: vi.fn(),
}));

import { checkReviewExists } from "@/src/lib/reviews/client-api";
import { guardReviewWrite } from "@/src/lib/reviews/guard-review-write";

const checkReviewExistsMock = vi.mocked(checkReviewExists);

describe("guardReviewWrite", () => {
  beforeEach(() => {
    checkReviewExistsMock.mockReset();
  });

  it("없으면 ready", async () => {
    checkReviewExistsMock.mockResolvedValue({
      ok: true,
      data: { exists: false },
    });
    await expect(guardReviewWrite("1")).resolves.toEqual({ status: "ready" });
  });

  it("있으면 duplicate", async () => {
    checkReviewExistsMock.mockResolvedValue({
      ok: true,
      data: { exists: true, reviewId: "r1" },
    });
    await expect(guardReviewWrite("1")).resolves.toEqual({
      status: "duplicate",
    });
  });

  it("401이면 unauthenticated", async () => {
    checkReviewExistsMock.mockRejectedValue(
      new ApiClientError("로그인이 필요합니다.", 401, null)
    );
    await expect(guardReviewWrite("1")).resolves.toEqual({
      status: "unauthenticated",
    });
  });

  it("그 외 오류는 작성으로 안 보낸다", async () => {
    checkReviewExistsMock.mockRejectedValue(
      new ApiClientError("리뷰 중복 확인 중 오류가 발생했습니다.", 500, null)
    );
    await expect(guardReviewWrite("1")).resolves.toEqual({
      status: "error",
      message: "리뷰 중복 확인 중 오류가 발생했습니다.",
    });
  });
});
