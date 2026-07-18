/** 목록 순서 변경(드래그) 유틸 */

export function reorderById<T extends { id: string }>(
  items: T[],
  sourceId: string,
  targetId: string
): T[] {
  if (sourceId === targetId) return items;

  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return items;

  const next = [...items];
  const [moved] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, moved);
  return next;
}
