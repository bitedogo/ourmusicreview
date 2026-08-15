/** 오늘의 앨범 날짜 (KST 자정 = UTC Date) */

export function getTodayKstDate(): Date {
  const kstDateStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Seoul",
  });
  return new Date(`${kstDateStr}T00:00:00.000Z`);
}

export function shiftUtcDate(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function formatTodayAlbumIsoDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return String(d);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatTodayAlbumCellDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${year.slice(-2)}.${month}.${day}`;
}

export const PREVIOUS_SCROLLBAR = {
  height: 420,
  top: 54.5,
} as const;
