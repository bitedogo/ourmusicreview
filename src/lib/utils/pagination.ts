/** 페이지네이션 계산 유틸 */

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
  delta: number = 2
): Array<number | "ellipsis"> {
  if (totalPages < 2) return [];

  const range: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  const out: Array<number | "ellipsis"> = [];
  let prev: number | undefined;
  for (const i of range) {
    if (prev !== undefined) {
      if (i - prev === 2) {
        out.push(prev + 1);
      } else if (i - prev > 2) {
        out.push("ellipsis");
      }
    }
    out.push(i);
    prev = i;
  }
  return out;
}
