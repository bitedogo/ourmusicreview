/** 날짜 포맷·파싱 유틸 */

export function formatDateYYYYMMDD(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}.${m}.${day}`;
  } catch {
    return String(dateInput);
  }
}

/** 리뷰 카드용 — YYYY. MM. DD */
export function formatDateDottedSpaced(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}. ${m}. ${day}`;
  } catch {
    return String(dateInput);
  }
}

/** 앨범 발매일 — YYYY-MM-DD면 그대로 점 표기, 그 외는 Date 파싱 */
export function formatAlbumReleaseDate(
  dateInput: string | null | undefined,
): string {
  if (!dateInput) return "0000.00.00";
  const raw = dateInput.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10).replace(/-/g, ".");
  }
  return formatDateYYYYMMDD(raw);
}
