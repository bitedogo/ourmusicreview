export function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, "")
    .replace(/[^a-z0-9가-힣]/g, "")
    .trim();
}

export function looseMatch(a: string, b: string): boolean {
  const normalizedA = normalizeForMatch(a);
  const normalizedB = normalizeForMatch(b);
  if (!normalizedA || !normalizedB) return false;
  return (
    normalizedA === normalizedB ||
    normalizedA.includes(normalizedB) ||
    normalizedB.includes(normalizedA)
  );
}
