/** 대분류 장르 대표 이미지 · 원형 표시 순서 (public/genres) */

export const SPECIAL_GENRE_ALL = "all";
export const SPECIAL_GENRE_COMPREHENSIVE = "comprehensive";

/** Rock → HipHop → R&B → Pop → Jazz → Electronic → 종합 → All */
export const ROOT_GENRE_ORDER = [
  "rock",
  "hiphop",
  "rnb",
  "pop",
  "jazz",
  "electronic",
] as const;

/** 원형 하단 라벨 (영어 표기) */
export const GENRE_CIRCLE_LABELS: Record<string, string> = {
  rock: "Rock",
  hiphop: "HipHop",
  rnb: "R&B",
  pop: "Pop",
  jazz: "Jazz",
  electronic: "Electronic",
  [SPECIAL_GENRE_COMPREHENSIVE]: "종합",
  [SPECIAL_GENRE_ALL]: "All",
};

export const GENRE_COVER_IMAGES: Record<string, string> = {
  rock: "/genres/rock.png",
  hiphop: "/genres/hiphop.png",
  rnb: "/genres/rnb.png",
  pop: "/genres/pop.png",
  jazz: "/genres/jazz.png",
  electronic: "/genres/electronic.png",
  [SPECIAL_GENRE_COMPREHENSIVE]: "/genres/comprehensive.png",
  [SPECIAL_GENRE_ALL]: "/genres/all.png",
};

export interface GenreCircleItem {
  id: string;
  label: string;
  imageUrl: string;
  kind: "genre" | "special";
}

export function getGenreCoverImage(genreId: string): string | null {
  return GENRE_COVER_IMAGES[genreId] ?? null;
}

export function getGenreCircleLabel(genreId: string): string | null {
  return GENRE_CIRCLE_LABELS[genreId] ?? null;
}

/** 소분류 목록 앞에 '종합'(대분류 태그)을 붙임 */
export function withComprehensiveSubgenre<
  T extends { id: string; nameKo: string; nameEn: string; parentId: string | null },
>(root: { id: string; children: T[] }): Array<T | {
  id: string;
  nameKo: string;
  nameEn: string;
  parentId: string;
}> {
  return [
    {
      id: root.id,
      nameKo: "종합",
      nameEn: "General",
      parentId: root.id,
    },
    ...root.children,
  ];
}

export function sortRootGenres<T extends { id: string }>(genres: T[]): T[] {
  const order = new Map(ROOT_GENRE_ORDER.map((id, index) => [id, index]));
  return [...genres].sort((a, b) => {
    const ai = order.get(a.id as (typeof ROOT_GENRE_ORDER)[number]);
    const bi = order.get(b.id as (typeof ROOT_GENRE_ORDER)[number]);
    if (ai == null && bi == null) return 0;
    if (ai == null) return 1;
    if (bi == null) return -1;
    return ai - bi;
  });
}

/** DB 대분류만(종합·All 제외) + 특수 칩용 종합/All 원형 목록 */
export function buildGenreCircles<
  T extends { id: string; nameKo?: string; children?: { id: string }[] },
>(genres: T[]): GenreCircleItem[] {
  const sorted = sortRootGenres(
    genres.filter(
      (genre) =>
        genre.id !== SPECIAL_GENRE_COMPREHENSIVE &&
        genre.id !== SPECIAL_GENRE_ALL
    )
  );
  return [
    ...sorted.map((genre) => ({
      id: genre.id,
      label: GENRE_CIRCLE_LABELS[genre.id] ?? genre.nameKo ?? genre.id,
      imageUrl: GENRE_COVER_IMAGES[genre.id] ?? "",
      kind: "genre" as const,
    })),
    {
      id: SPECIAL_GENRE_COMPREHENSIVE,
      label: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_COMPREHENSIVE],
      imageUrl: GENRE_COVER_IMAGES[SPECIAL_GENRE_COMPREHENSIVE],
      kind: "special" as const,
    },
    {
      id: SPECIAL_GENRE_ALL,
      label: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_ALL],
      imageUrl: GENRE_COVER_IMAGES[SPECIAL_GENRE_ALL],
      kind: "special" as const,
    },
  ];
}

/**
 * 예전 버그로 대분류 전체가 저장된 경우 → 종합 한 장르로 표시.
 * 소분류 종합(= 대분류 ID 하나)은 대분류 이름 그대로 유지.
 */
export function collapsePlaylistGenresForDisplay<
  T extends { id: string; nameKo: string; parentId?: string | null },
>(genres: T[]): T[] {
  if (genres.length === 0) return genres;

  if (
    genres.length === 1 &&
    genres[0].id === SPECIAL_GENRE_COMPREHENSIVE
  ) {
    return [
      {
        ...genres[0],
        nameKo: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_COMPREHENSIVE],
      },
    ];
  }

  const ids = new Set(genres.map((g) => g.id));
  const isLegacyAllRoots =
    ROOT_GENRE_ORDER.length > 0 &&
    genres.length === ROOT_GENRE_ORDER.length &&
    ROOT_GENRE_ORDER.every((id) => ids.has(id)) &&
    genres.every((g) =>
      (ROOT_GENRE_ORDER as readonly string[]).includes(g.id)
    );

  if (isLegacyAllRoots) {
    return [
      {
        ...genres[0],
        id: SPECIAL_GENRE_COMPREHENSIVE,
        nameKo: GENRE_CIRCLE_LABELS[SPECIAL_GENRE_COMPREHENSIVE],
      } as T,
    ];
  }

  return genres;
}
