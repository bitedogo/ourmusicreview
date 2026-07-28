/** iTunes 응답 파싱 공통 헬퍼 */

export function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function normalizeName(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}
