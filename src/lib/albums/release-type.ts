/** 앨범/싱글 발매 유형 */

import { classifyItunesReleaseType } from "@/src/lib/itunes/albums";

export const ALBUM_RELEASE_TYPES = ["album", "single"] as const;
export type AlbumReleaseType = (typeof ALBUM_RELEASE_TYPES)[number];

export function isAlbumReleaseType(value: unknown): value is AlbumReleaseType {
  return value === "album" || value === "single";
}

export function parseAlbumReleaseType(
  value: string | null | undefined
): AlbumReleaseType {
  return value === "single" ? "single" : "album";
}

export function classifyAlbumReleaseTypeFromTitle(title: string): AlbumReleaseType {
  return classifyItunesReleaseType({ collectionName: title });
}

export function resolveAlbumReleaseType(
  title: string,
  incoming?: unknown
): AlbumReleaseType {
  if (isAlbumReleaseType(incoming)) return incoming;
  return classifyAlbumReleaseTypeFromTitle(title);
}
