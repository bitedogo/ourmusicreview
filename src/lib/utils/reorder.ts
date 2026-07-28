/** 목록 순서 변경(드래그) 유틸 */

import type { Repository } from "typeorm";

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

/** 삭제 등으로 빈 자리가 생긴 목록의 position을 1부터 다시 순번 매겨 일괄 저장한다. */
export async function reindexPositions<T extends { position: number }>(
  repo: Repository<T>,
  items: T[]
): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    items[i].position = i + 1;
  }
  await repo.save(items);
}

/** 주어진 id 순서(order)대로 position을 1부터 재배정해 저장한다. 목록에 없는 id는 무시한다. */
export async function applyPositionOrder<T extends { id: string; position: number }>(
  repo: Repository<T>,
  entities: T[],
  order: string[]
): Promise<void> {
  const byId = new Map(entities.map((entity) => [entity.id, entity]));

  for (let i = 0; i < order.length; i++) {
    const id = String(order[i]);
    const entity = byId.get(id);
    if (entity) {
      entity.position = i + 1;
      await repo.save(entity);
    }
  }
}
