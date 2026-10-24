import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  assertPlaylistReadable,
  assertPlaylistVisibleToViewer,
} from "./playlist-access";

function playlistSource(
  playlist: { id: string; userId: string; isPublic: "Y" | "N" } | null
) {
  const playlistRepository = {
    findOne: vi.fn().mockResolvedValue(playlist),
  };
  const dataSource = {
    getRepository: vi.fn(() => playlistRepository),
  } as unknown as DataSource;
  return { dataSource, playlistRepository };
}

describe("assertPlaylistVisibleToViewer", () => {
  it("공개 플레이리스트는 누구나 볼 수 있다", () => {
    expect(() =>
      assertPlaylistVisibleToViewer(
        { userId: "owner", isPublic: "Y" },
        null
      )
    ).not.toThrow();
  });

  it("비공개 플레이리스트는 소유자만 볼 수 있다", () => {
    expect(() =>
      assertPlaylistVisibleToViewer(
        { userId: "owner", isPublic: "N" },
        "owner"
      )
    ).not.toThrow();

    expect(() =>
      assertPlaylistVisibleToViewer(
        { userId: "owner", isPublic: "N" },
        "other"
      )
    ).toThrow(ServiceError);
  });
});

describe("assertPlaylistReadable", () => {
  it("없는 플레이리스트는 404", async () => {
    const { dataSource, playlistRepository } = playlistSource(null);

    await expect(
      assertPlaylistReadable(dataSource, "missing", "user-1")
    ).rejects.toMatchObject({
      message: "플레이리스트를 찾을 수 없습니다.",
      status: 404,
    });
    expect(playlistRepository.findOne).toHaveBeenCalled();
    expect(dataSource.getRepository).toHaveBeenCalledWith(Playlist);
  });

  it("비공개 플레이리스트는 타인에게 403", async () => {
    const { dataSource } = playlistSource({
      id: "pl-1",
      userId: "owner",
      isPublic: "N",
    });

    await expect(
      assertPlaylistReadable(dataSource, "pl-1", "other")
    ).rejects.toMatchObject({
      message: "비공개 플레이리스트입니다.",
      status: 403,
    });
  });

  it("비공개여도 소유자는 통과한다", async () => {
    const { dataSource } = playlistSource({
      id: "pl-1",
      userId: "owner",
      isPublic: "N",
    });

    await expect(
      assertPlaylistReadable(dataSource, "pl-1", "owner")
    ).resolves.toBeUndefined();
  });
});
