import { describe, expect, it } from "vitest";
import {
  createReviewInputSchema,
  updateReviewInputSchema,
} from "./contracts";

describe("review input contracts", () => {
  it("유효한 작성 요청을 통과시킨다", () => {
    expect(
      createReviewInputSchema.safeParse({
        albumId: "123",
        content: "<p>좋은 앨범</p>",
        rating: 8.5,
        albumReleaseType: "single",
      }).success
    ).toBe(true);
  });

  it("범위 밖 평점과 알 수 없는 필드를 거부한다", () => {
    expect(
      createReviewInputSchema.safeParse({
        albumId: "123",
        content: "review",
        rating: 11,
      }).success
    ).toBe(false);
    expect(updateReviewInputSchema.safeParse({ unexpected: true }).success).toBe(
      false
    );
  });
});
