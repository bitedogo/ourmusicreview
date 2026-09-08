import { describe, expect, it } from "vitest";
import {
  averageFromRatings,
  formatRating,
  normalizeReviewRating,
  toRatingNumber,
} from "./rating";

describe("normalizeReviewRating", () => {
  it("유효한 평점을 소수 한 자리로 반올림한다", () => {
    expect(normalizeReviewRating(8.26)).toBe(8.3);
    expect(normalizeReviewRating(0)).toBe(0);
    expect(normalizeReviewRating(10)).toBe(10);
  });

  it("범위 밖이거나 숫자가 아닌 입력을 거부한다", () => {
    expect(normalizeReviewRating(-0.1)).toBeUndefined();
    expect(normalizeReviewRating(10.1)).toBeUndefined();
    expect(normalizeReviewRating(Number.NaN)).toBeUndefined();
    expect(normalizeReviewRating("8.5")).toBeUndefined();
  });
});

describe("평점 직렬화 유틸", () => {
  it("PostgreSQL numeric 문자열을 숫자로 바꾼다", () => {
    expect(toRatingNumber("8.5")).toBe(8.5);
    expect(toRatingNumber("invalid")).toBeNull();
  });

  it("유효한 값만 사용해 평균을 소수 한 자리에서 버림한다", () => {
    expect(averageFromRatings(["3.5", 3.6, null])).toBe(3.5);
    expect(averageFromRatings([])).toBeNull();
  });

  it("표시 형식을 유지한다", () => {
    expect(formatRating(10)).toBe("10");
    expect(formatRating(8)).toBe("8.0");
    expect(formatRating(null)).toBe("N/A");
  });
});
