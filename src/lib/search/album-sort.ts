import type { SearchAlbumResult } from "./types";

export type AlbumListSort = "newest" | "oldest" | "popular";

export const ALBUM_LIST_SORT_OPTIONS: { value: AlbumListSort; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "oldest", label: "과거순" },
  { value: "popular", label: "인기순" },
];

export const DEFAULT_ALBUM_LIST_SORT: AlbumListSort = "oldest";

function releaseTime(album: Pick<SearchAlbumResult, "releaseDate">): number {
  if (!album.releaseDate) return 0;
  const time = new Date(album.releaseDate).getTime();
  return Number.isFinite(time) ? time : 0;
}

export function parseAlbumListSort(value: string | null | undefined): AlbumListSort {
  if (value === "newest" || value === "oldest" || value === "popular") return value;
  return DEFAULT_ALBUM_LIST_SORT;
}

export function sortSearchAlbums<T extends SearchAlbumResult>(
  albums: T[],
  sort: AlbumListSort,
): T[] {
  return [...albums].sort((a, b) => {
    const timeA = releaseTime(a);
    const timeB = releaseTime(b);

    if (sort === "newest") return timeB - timeA;
    if (sort === "oldest") return timeA - timeB;

    const popA = a.popularityScore ?? 0;
    const popB = b.popularityScore ?? 0;
    if (popA !== popB) return popB - popA;
    return timeB - timeA;
  });
}
