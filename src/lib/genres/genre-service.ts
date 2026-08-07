/** 장르 트리 조회 · 필터용 ID 확장 */

import type { DataSource } from "typeorm";
import { Genre } from "@/src/lib/db/entities/Genre";
import { ServiceError } from "@/src/lib/http/service-error";

export interface GenreDto {
  id: string;
  nameKo: string;
  nameEn: string;
  parentId: string | null;
}

export interface GenreTreeNode extends GenreDto {
  children: GenreDto[];
}

export async function listGenresFlat(
  dataSource: DataSource
): Promise<GenreDto[]> {
  const rows = await dataSource.getRepository(Genre).find({
    order: { parentId: "ASC", nameEn: "ASC" },
  });
  return rows.map((g) => ({
    id: g.id,
    nameKo: g.nameKo,
    nameEn: g.nameEn,
    parentId: g.parentId,
  }));
}

export async function getGenreTree(
  dataSource: DataSource
): Promise<GenreTreeNode[]> {
  const flat = await listGenresFlat(dataSource);
  /** 종합·All 은 특수 칩용 — 대분류 트리에서 제외 */
  const roots = flat.filter(
    (g) =>
      g.parentId == null &&
      g.id !== "comprehensive" &&
      g.id !== "all"
  );
  return roots.map((root) => ({
    ...root,
    children: flat.filter((g) => g.parentId === root.id),
  }));
}

/** 대분류면 자신 + 모든 하위 장르 ID, 소분류면 자신만.
 *  comprehensive(종합)면 '종합' 태그만 — 다른 대분류·소분류 포함하지 않음 */
export async function resolveGenreFilterIds(
  dataSource: DataSource,
  genreId: string
): Promise<string[]> {
  if (genreId === "comprehensive") {
    return ["comprehensive"];
  }

  if (genreId === "all") {
    return [];
  }

  const genreRepository = dataSource.getRepository(Genre);
  const genre = await genreRepository.findOne({ where: { id: genreId } });
  if (!genre) {
    throw new ServiceError("장르를 찾을 수 없습니다.", 404);
  }

  if (genre.parentId != null) {
    return [genre.id];
  }

  const children = await genreRepository.find({
    where: { parentId: genre.id },
    select: ["id"],
  });
  return [genre.id, ...children.map((c) => c.id)];
}

export async function assertValidGenreIds(
  dataSource: DataSource,
  genreIds: string[]
): Promise<string[]> {
  const unique = [...new Set(genreIds.map((id) => id.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const rows = await dataSource
    .getRepository(Genre)
    .createQueryBuilder("g")
    .where("g.id IN (:...ids)", { ids: unique })
    .getMany();

  if (rows.length !== unique.length) {
    throw new ServiceError("유효하지 않은 장르가 포함되어 있습니다.", 400);
  }
  return unique;
}
