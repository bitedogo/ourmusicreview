import { describe, expect, it } from "vitest";
import { formatDateYYYYMMDD, formatMonthDay, formatRelativeTimeKo } from "./date";

describe("formatRelativeTimeKo", () => {
  const now = new Date("2026-09-26T12:00:00Z");

  it("가까운 시각은 상대 표기로 돌린다", () => {
    expect(formatRelativeTimeKo(new Date(now.getTime() - 30 * 1000), now)).toBe(
      "방금 전"
    );
    expect(
      formatRelativeTimeKo(new Date(now.getTime() - 20 * 60 * 1000), now)
    ).toBe("20분 전");
    expect(
      formatRelativeTimeKo(new Date(now.getTime() - 3 * 60 * 60 * 1000), now)
    ).toBe("3시간 전");
    expect(
      formatRelativeTimeKo(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), now)
    ).toBe("2일 전");
  });

  it("일주일 이상은 날짜로 돌린다", () => {
    const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const lastYear = new Date("2025-12-31T12:00:00Z");
    expect(formatRelativeTimeKo(eightDaysAgo, now)).toBe(
      formatMonthDay(eightDaysAgo)
    );
    expect(formatRelativeTimeKo(lastYear, now)).toBe(
      formatDateYYYYMMDD(lastYear)
    );
  });
});
