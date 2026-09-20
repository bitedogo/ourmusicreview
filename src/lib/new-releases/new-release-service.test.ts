import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { LessThan, MoreThanOrEqual } from "typeorm";
import { WeeklyReleaseAlbum } from "@/src/lib/db/entities/WeeklyReleaseAlbum";

const { getAlbumByIdMock, classifyItunesReleaseTypeMock } = vi.hoisted(() => ({
  getAlbumByIdMock: vi.fn(),
  classifyItunesReleaseTypeMock: vi.fn(),
}));

vi.mock("@/src/lib/album-lookup", () => ({
  getAlbumById: getAlbumByIdMock,
}));

vi.mock("@/src/lib/itunes/albums", () => ({
  classifyItunesReleaseType: classifyItunesReleaseTypeMock,
}));

vi.mock("./weeks", async () => {
  const actual = await vi.importActual<typeof import("./weeks")>("./weeks");
  return {
    ...actual,
    getKstTodayIso: () => "2026-09-09",
    getNewReleaseWeekWindows: () =>
      actual.getNewReleaseWeekWindows("2026-09-09"),
  };
});

import {
  addManualNewReleaseAlbum,
  addNewReleaseAlbum,
  getHomeNewReleases,
  listAdminNewReleases,
  purgeExpiredNewReleases,
  removeNewReleaseAlbum,
} from "./new-release-service";

function createRepo(overrides: Record<string, unknown> = {}) {
  return {
    find: vi.fn().mockResolvedValue([]),
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn((value) => value),
    save: vi.fn(async (value) => value),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
    remove: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createDataSource(repo: ReturnType<typeof createRepo>) {
  return {
    getRepository: vi.fn(() => repo),
  } as unknown as DataSource;
}

describe("getHomeNewReleases", () => {
  it("오늘 이후 등록분만 조회하고 purge는 하지 않는다", async () => {
    const repo = createRepo({
      find: vi.fn().mockResolvedValue([
        {
          id: "1",
          collectionId: "100",
          title: "Far Ahead",
          artist: "A",
          artistId: null,
          imageUrl: null,
          releaseDate: "2026-10-16",
          source: "itunes",
        },
      ]),
    });
    const dataSource = createDataSource(repo);

    const result = await getHomeNewReleases(dataSource);

    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.find).toHaveBeenCalledWith({
      where: { releaseDate: MoreThanOrEqual("2026-09-09") },
      order: { releaseDate: "ASC", title: "ASC" },
    });
    expect(result.albums).toHaveLength(1);
    expect(result.albums[0]?.title).toBe("Far Ahead");
  });
});

describe("listAdminNewReleases", () => {
  it("관리자 목록 조회에서는 purge하지 않는다", async () => {
    const repo = createRepo({
      find: vi.fn().mockResolvedValue([]),
    });
    const dataSource = createDataSource(repo);

    await listAdminNewReleases(dataSource);

    expect(repo.delete).not.toHaveBeenCalled();
    expect(repo.find).toHaveBeenCalledWith({
      where: { releaseDate: MoreThanOrEqual("2026-09-09") },
      order: { releaseDate: "ASC", title: "ASC" },
    });
  });
});

describe("purgeExpiredNewReleases", () => {
  it("오늘 이전 발매는 출처와 상관없이 삭제한다", async () => {
    const repo = createRepo();
    const dataSource = createDataSource(repo);

    await expect(purgeExpiredNewReleases(dataSource)).resolves.toBe(1);
    expect(repo.delete).toHaveBeenCalledWith({
      releaseDate: LessThan("2026-09-09"),
    });
  });
});

describe("addNewReleaseAlbum", () => {
  beforeEach(() => {
    getAlbumByIdMock.mockReset();
    classifyItunesReleaseTypeMock.mockReset();
    classifyItunesReleaseTypeMock.mockReturnValue("album");
  });

  it("오늘 이후 앨범만 등록한다", async () => {
    getAlbumByIdMock.mockResolvedValue({
      collectionId: "123",
      artistId: "9",
      title: "Future",
      artist: "Artist",
      imageUrl: "https://example.com/a.jpg",
      releaseDate: "2026-09-20",
      genre: "Pop",
    });
    const repo = createRepo();
    const dataSource = createDataSource(repo);

    const album = await addNewReleaseAlbum(dataSource, "123");

    expect(album.collectionId).toBe("123");
    expect(album.weekBucket).toBe("upcoming");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(repo.delete).toHaveBeenCalledWith({
      releaseDate: LessThan("2026-09-09"),
    });
  });

  it("이미 등록된 collectionId는 거절한다", async () => {
    const repo = createRepo({
      findOne: vi.fn().mockResolvedValue({ id: "exists" }),
    });
    const dataSource = createDataSource(repo);

    await expect(addNewReleaseAlbum(dataSource, "123")).rejects.toMatchObject({
      status: 400,
      message: "이미 신보에 등록된 앨범입니다.",
    });
    expect(getAlbumByIdMock).not.toHaveBeenCalled();
  });

  it("unique 충돌은 중복 등록 오류로 바꾼다", async () => {
    getAlbumByIdMock.mockResolvedValue({
      collectionId: "123",
      artistId: null,
      title: "Future",
      artist: "Artist",
      imageUrl: null,
      releaseDate: "2026-09-20",
      genre: "Pop",
    });
    const repo = createRepo({
      save: vi.fn().mockRejectedValue({ code: "23505" }),
    });
    const dataSource = createDataSource(repo);

    await expect(addNewReleaseAlbum(dataSource, "123")).rejects.toMatchObject({
      status: 400,
      message: "이미 신보에 등록된 앨범입니다.",
    });
  });
});

describe("addManualNewReleaseAlbum", () => {
  it("https 커버와 미래 발매일만 허용한다", async () => {
    const repo = createRepo();
    const dataSource = createDataSource(repo);

    await expect(
      addManualNewReleaseAlbum(dataSource, {
        source: "manual",
        title: "Manual",
        artist: "Artist",
        releaseDate: "2026-09-08",
        imageUrl: null,
      })
    ).rejects.toMatchObject({ status: 400 });

    await expect(
      addManualNewReleaseAlbum(dataSource, {
        source: "manual",
        title: "Manual",
        artist: "Artist",
        releaseDate: "2026-09-15",
        imageUrl: "http://insecure.example/a.jpg",
      })
    ).rejects.toMatchObject({ status: 400 });

    const album = await addManualNewReleaseAlbum(dataSource, {
      source: "manual",
      title: "Manual",
      artist: "Artist",
      releaseDate: "2026-09-15",
      imageUrl: "https://cdn.example/a.jpg",
    });
    expect(album.source).toBe("manual");
    expect(album.imageUrl).toBe("https://cdn.example/a.jpg");
    expect(repo.save).toHaveBeenCalledOnce();
    expect(repo.delete).toHaveBeenCalledWith({
      releaseDate: LessThan("2026-09-09"),
    });
  });
});

describe("removeNewReleaseAlbum", () => {
  it("없는 id는 404로 실패한다", async () => {
    const repo = createRepo();
    const dataSource = createDataSource(repo);

    await expect(removeNewReleaseAlbum(dataSource, "missing")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("삭제 후 만료분도 정리한다", async () => {
    const entity = { id: "11111111-1111-4111-8111-111111111111" } as WeeklyReleaseAlbum;
    const repo = createRepo({
      findOne: vi.fn().mockResolvedValue(entity),
    });
    const dataSource = createDataSource(repo);

    await removeNewReleaseAlbum(dataSource, entity.id);
    expect(repo.remove).toHaveBeenCalledWith(entity);
    expect(repo.delete).toHaveBeenCalledWith({
      releaseDate: LessThan("2026-09-09"),
    });
  });
});
