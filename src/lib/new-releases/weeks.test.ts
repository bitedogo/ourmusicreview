import { describe, expect, it } from "vitest";
import {
  bucketReleaseDate,
  formatDottedDateFromIso,
  formatMonthDayFromIso,
  getFridayOnOrAfter,
  getNewReleaseWeekWindows,
  isInNewReleaseHomeWindow,
  isKstToday,
  isUpcomingReleaseDate,
} from "./weeks";

describe("getNewReleaseWeekWindows", () => {
  it("수요일에는 이번 주 금요일과 다음 주 금요일까지 잡는다", () => {
    const weeks = getNewReleaseWeekWindows("2026-09-09");
    expect(weeks.thisWeekStart).toBe("2026-09-09");
    expect(weeks.thisWeekFriday).toBe("2026-09-11");
    expect(weeks.thisWeekEnd).toBe("2026-09-11");
    expect(weeks.nextWeekStart).toBe("2026-09-12");
    expect(weeks.nextWeekFriday).toBe("2026-09-18");
    expect(weeks.nextWeekEnd).toBe("2026-09-18");
  });

  it("금요일 당일은 오늘 드랍을 이번 주에 넣는다", () => {
    const weeks = getNewReleaseWeekWindows("2026-09-11");
    expect(weeks.thisWeekStart).toBe("2026-09-11");
    expect(weeks.thisWeekEnd).toBe("2026-09-11");
    expect(weeks.nextWeekStart).toBe("2026-09-12");
    expect(weeks.nextWeekEnd).toBe("2026-09-18");
  });

  it("토요일이면 창이 다음 금요일 주차로 밀린다", () => {
    const weeks = getNewReleaseWeekWindows("2026-09-12");
    expect(weeks.thisWeekFriday).toBe("2026-09-18");
    expect(weeks.thisWeekStart).toBe("2026-09-12");
    expect(weeks.thisWeekEnd).toBe("2026-09-18");
    expect(weeks.nextWeekStart).toBe("2026-09-19");
    expect(weeks.nextWeekEnd).toBe("2026-09-25");
  });
});

describe("getFridayOnOrAfter", () => {
  it("이미 금요일이면 그날을 반환한다", () => {
    expect(getFridayOnOrAfter("2026-09-11")).toBe("2026-09-11");
  });
});

describe("bucketReleaseDate", () => {
  const weeks = getNewReleaseWeekWindows("2026-09-09");

  it("이번 주·다음 주만 넣고 나머지는 버린다", () => {
    expect(bucketReleaseDate("2026-09-10", weeks)).toBe("thisWeek");
    expect(bucketReleaseDate("2026-09-11", weeks)).toBe("thisWeek");
    expect(bucketReleaseDate("2026-09-18", weeks)).toBe("nextWeek");
    expect(bucketReleaseDate("2026-09-08", weeks)).toBeNull();
    expect(bucketReleaseDate("2026-09-19", weeks)).toBeNull();
  });
});

describe("isInNewReleaseHomeWindow", () => {
  const weeks = getNewReleaseWeekWindows("2026-09-09");

  it("지난 발매는 빼고 창 안의 날짜만 통과시킨다", () => {
    expect(isInNewReleaseHomeWindow("2026-09-08", weeks)).toBe(false);
    expect(isInNewReleaseHomeWindow("2026-09-09T00:00:00Z", weeks)).toBe(true);
    expect(isInNewReleaseHomeWindow("2026-09-18", weeks)).toBe(true);
    expect(isInNewReleaseHomeWindow("2026-09-19", weeks)).toBe(false);
  });
});

describe("isUpcomingReleaseDate", () => {
  it("오늘부터 미래만 통과하고 지난 날은 뺀다", () => {
    expect(isUpcomingReleaseDate("2026-09-08", "2026-09-09")).toBe(false);
    expect(isUpcomingReleaseDate("2026-09-09", "2026-09-09")).toBe(true);
    expect(isUpcomingReleaseDate("2026-12-01T12:00:00Z", "2026-09-09")).toBe(true);
  });
});

describe("isKstToday", () => {
  it("오늘 발매만 true다", () => {
    expect(isKstToday("2026-09-10", "2026-09-10")).toBe(true);
    expect(isKstToday("2026-09-10T00:00:00Z", "2026-09-10")).toBe(true);
    expect(isKstToday("2026-09-11", "2026-09-10")).toBe(false);
  });
});

describe("formatMonthDayFromIso", () => {
  it("카드용 짧은 발매일을 만든다", () => {
    expect(formatMonthDayFromIso("2026-09-11")).toBe("09.11");
  });
});

describe("formatDottedDateFromIso", () => {
  it("연월일을 점 표기로 만든다", () => {
    expect(formatDottedDateFromIso("2026-09-11T00:00:00Z")).toBe("2026.09.11");
  });
});
