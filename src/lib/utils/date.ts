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
