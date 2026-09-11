/** 주간 신보 조회·등록 비즈니스 로직 */

import { LessThan, MoreThanOrEqual, type DataSource } from "typeorm";
import { getAlbumById } from "@/src/lib/album-lookup";
import { WeeklyReleaseAlbum } from "@/src/lib/db/entities/WeeklyReleaseAlbum";
import { isUniqueViolation } from "@/src/lib/db/pg-error";
import { ServiceError } from "@/src/lib/http/service-error";
import { classifyItunesReleaseType } from "@/src/lib/itunes/albums";
import type { AddManualNewReleaseInput } from "./contracts";
import { generateManualCollectionId } from "./manual";
import {
  type NewReleaseAdminAlbum,
  type NewReleaseAdminBucket,
  type NewReleaseAlbum,
  type NewReleasesHomeData,
} from "./types";
import {
  bucketReleaseDate,
  getKstTodayIso,
  getNewReleaseWeekWindows,
  isIsoDate,
  isUpcomingReleaseDate,
  type NewReleaseWeekWindows,
} from "./weeks";

function toAlbum(row: WeeklyReleaseAlbum): NewReleaseAlbum {
  return {
    id: row.id,
    collectionId: row.collectionId,
    title: row.title,
    artist: row.artist,
    artistId: row.artistId ?? null,
    imageUrl: row.imageUrl ?? null,
    releaseDate: row.releaseDate,
    source: row.source === "manual" ? "manual" : "itunes",
  };
}

function adminBucket(
  releaseDate: string,
  weeks: NewReleaseWeekWindows
): NewReleaseAdminBucket {
  const bucket = bucketReleaseDate(releaseDate, weeks);
  if (bucket) return bucket;
  const date = releaseDate.slice(0, 10);
  if (isIsoDate(date) && date < weeks.today) return "past";
  return "upcoming";
}

function toAdminAlbum(row: WeeklyReleaseAlbum): NewReleaseAdminAlbum {
  return {
    ...toAlbum(row),
    weekBucket: adminBucket(row.releaseDate, getNewReleaseWeekWindows()),
  };
}

function normalizeCoverUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ServiceError("커버 이미지 URL이 올바르지 않습니다.", 400);
  }
  if (parsed.protocol !== "https:") {
    throw new ServiceError("커버 이미지는 https URL만 사용할 수 있습니다.", 400);
  }
  return trimmed;
}

export async function purgeExpiredNewReleases(
  dataSource: DataSource,
  todayIso: string = getKstTodayIso()
): Promise<number> {
  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const result = await repo.delete({
    releaseDate: LessThan(todayIso),
  });
  return result.affected ?? 0;
}

export function emptyNewReleasesHomeData(): NewReleasesHomeData {
  return { albums: [] };
}

export async function getHomeNewReleases(
  dataSource: DataSource
): Promise<NewReleasesHomeData> {
  const todayIso = getKstTodayIso();
  await purgeExpiredNewReleases(dataSource, todayIso);
  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const rows = await repo.find({
    where: { releaseDate: MoreThanOrEqual(todayIso) },
    order: { releaseDate: "ASC", title: "ASC" },
  });

  return { albums: rows.map(toAlbum) };
}

export async function listAdminNewReleases(
  dataSource: DataSource
): Promise<{ albums: NewReleaseAdminAlbum[] }> {
  const weeks = getNewReleaseWeekWindows();
  await purgeExpiredNewReleases(dataSource, weeks.today);
  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const rows = await repo.find({
    where: { releaseDate: MoreThanOrEqual(weeks.today) },
    order: { releaseDate: "ASC", title: "ASC" },
  });

  return {
    albums: rows.map((row) => ({
      ...toAlbum(row),
      weekBucket: adminBucket(row.releaseDate, weeks),
    })),
  };
}

export async function addNewReleaseAlbum(
  dataSource: DataSource,
  collectionId: string
): Promise<NewReleaseAdminAlbum> {
  const trimmed = collectionId.trim();
  if (!trimmed) {
    throw new ServiceError("유효한 앨범(collectionId)을 선택해 주세요.", 400);
  }

  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const existing = await repo.findOne({ where: { collectionId: trimmed } });
  if (existing) {
    throw new ServiceError("이미 신보에 등록된 앨범입니다.", 400);
  }

  const albumInfo = await getAlbumById(trimmed);
  if (!albumInfo) {
    throw new ServiceError("앨범 정보를 가져올 수 없습니다.", 400);
  }

  const releaseType = classifyItunesReleaseType({
    collectionName: albumInfo.title,
  });
  if (releaseType !== "album") {
    throw new ServiceError("앨범만 등록할 수 있습니다.", 400);
  }

  const releaseDate = albumInfo.releaseDate.slice(0, 10);
  if (!isIsoDate(releaseDate)) {
    throw new ServiceError("발매일이 있는 앨범만 등록할 수 있습니다.", 400);
  }
  if (!isUpcomingReleaseDate(releaseDate)) {
    throw new ServiceError("오늘 이후 발매 앨범만 등록할 수 있습니다.", 400);
  }

  const entity = repo.create({
    id: crypto.randomUUID(),
    collectionId: albumInfo.collectionId,
    category: "K",
    title: albumInfo.title,
    artist: albumInfo.artist,
    artistId: albumInfo.artistId,
    imageUrl: albumInfo.imageUrl ?? undefined,
    releaseDate,
    source: "itunes",
  });
  try {
    await repo.save(entity);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ServiceError("이미 신보에 등록된 앨범입니다.", 400);
    }
    throw error;
  }
  return toAdminAlbum(entity);
}

export async function addManualNewReleaseAlbum(
  dataSource: DataSource,
  input: AddManualNewReleaseInput
): Promise<NewReleaseAdminAlbum> {
  if (!isUpcomingReleaseDate(input.releaseDate)) {
    throw new ServiceError("오늘 이후 발매 앨범만 등록할 수 있습니다.", 400);
  }

  const imageUrl = normalizeCoverUrl(input.imageUrl);
  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const entity = repo.create({
    id: crypto.randomUUID(),
    collectionId: generateManualCollectionId(),
    category: "K",
    title: input.title,
    artist: input.artist,
    artistId: null,
    imageUrl: imageUrl ?? undefined,
    releaseDate: input.releaseDate,
    source: "manual",
  });
  try {
    await repo.save(entity);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ServiceError("이미 신보에 등록된 앨범입니다.", 400);
    }
    throw error;
  }
  return toAdminAlbum(entity);
}

export async function removeNewReleaseAlbum(
  dataSource: DataSource,
  id: string
): Promise<void> {
  if (!id.trim()) {
    throw new ServiceError("삭제할 항목 id가 필요합니다.", 400);
  }

  const repo = dataSource.getRepository(WeeklyReleaseAlbum);
  const entity = await repo.findOne({ where: { id: id.trim() } });
  if (!entity) {
    throw new ServiceError("해당 항목을 찾을 수 없습니다.", 404);
  }
  await repo.remove(entity);
}
