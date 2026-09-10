/** 관리자 직접 등록 신보 — iTunes collectionId와 겹치지 않는 식별자 */

export const MANUAL_COLLECTION_ID_PREFIX = "m-";

export function generateManualCollectionId(): string {
  return `${MANUAL_COLLECTION_ID_PREFIX}${crypto.randomUUID().replaceAll("-", "")}`;
}

export function isManualCollectionId(collectionId: string): boolean {
  return collectionId.startsWith(MANUAL_COLLECTION_ID_PREFIX);
}

export function shouldPurgeManualRelease(
  source: string,
  releaseDate: string,
  todayIso: string
): boolean {
  const date = releaseDate.slice(0, 10);
  return source === "manual" && date < todayIso;
}
