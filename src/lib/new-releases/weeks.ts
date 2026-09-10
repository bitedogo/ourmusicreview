/** 신보 주차 — KST 금요일 기준 이번 주·다음 주 창 */

export type NewReleaseWeekBucket = "thisWeek" | "nextWeek";

export interface NewReleaseWeekWindows {
  today: string;
  thisWeekStart: string;
  thisWeekEnd: string;
  nextWeekStart: string;
  nextWeekEnd: string;
  thisWeekFriday: string;
  nextWeekFriday: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value);
}

export function getKstTodayIso(now: Date = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

function utcDateFromIso(iso: string): Date {
  const year = Number(iso.slice(0, 4));
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return new Date(Date.UTC(year, month - 1, day));
}

export function addIsoDays(iso: string, days: number): string {
  const date = utcDateFromIso(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0=일 … 5=금 … 6=토 (캘린더 날짜 기준) */
export function isoWeekday(iso: string): number {
  return utcDateFromIso(iso).getUTCDay();
}

export function getFridayOnOrAfter(iso: string): string {
  const delta = (5 - isoWeekday(iso) + 7) % 7;
  return addIsoDays(iso, delta);
}

export function getNewReleaseWeekWindows(
  todayIso: string = getKstTodayIso()
): NewReleaseWeekWindows {
  const thisWeekFriday = getFridayOnOrAfter(todayIso);
  const nextWeekFriday = addIsoDays(thisWeekFriday, 7);
  return {
    today: todayIso,
    thisWeekStart: todayIso,
    thisWeekEnd: thisWeekFriday,
    nextWeekStart: addIsoDays(thisWeekFriday, 1),
    nextWeekEnd: nextWeekFriday,
    thisWeekFriday,
    nextWeekFriday,
  };
}

export function bucketReleaseDate(
  releaseDate: string,
  weeks: NewReleaseWeekWindows
): NewReleaseWeekBucket | null {
  const date = releaseDate.slice(0, 10);
  if (!isIsoDate(date)) return null;
  if (date >= weeks.thisWeekStart && date <= weeks.thisWeekEnd) return "thisWeek";
  if (date >= weeks.nextWeekStart && date <= weeks.nextWeekEnd) return "nextWeek";
  return null;
}

/** 홈 신보 창(오늘 ~ 다음 주 금요일)에 들어가는 발매일인지 */
export function isInNewReleaseHomeWindow(
  releaseDate: string,
  weeks: NewReleaseWeekWindows = getNewReleaseWeekWindows()
): boolean {
  return bucketReleaseDate(releaseDate, weeks) != null;
}

/** 오늘(KST) 이후 발매 — 지난 앨범 제외 */
export function isUpcomingReleaseDate(
  releaseDate: string,
  todayIso: string = getKstTodayIso()
): boolean {
  const date = releaseDate.slice(0, 10);
  return isIsoDate(date) && date >= todayIso;
}

export function isKstToday(
  releaseDate: string,
  todayIso: string = getKstTodayIso()
): boolean {
  return releaseDate.slice(0, 10) === todayIso;
}

/** YYYY-MM-DD → MM.DD */
export function formatMonthDayFromIso(iso: string): string {
  if (!isIsoDate(iso.slice(0, 10))) return iso;
  return `${iso.slice(5, 7)}.${iso.slice(8, 10)}`;
}

/** YYYY-MM-DD → YYYY.MM.DD */
export function formatDottedDateFromIso(iso: string): string {
  const date = iso.slice(0, 10);
  if (!isIsoDate(date)) return iso;
  return date.replace(/-/g, ".");
}
