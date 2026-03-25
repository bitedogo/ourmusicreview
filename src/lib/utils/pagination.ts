/** delta=2 → 현재 기준 최대 5개 연속 페이지 번호 + 1·끝·ellipsis */
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
