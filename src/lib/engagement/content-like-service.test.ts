import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import {
  getContentLikeStatus,
  toggleContentLike,
} from "./content-like-service";

function privatePlaylistSource() {
  const playlistRepository = {
    findOne: vi.fn().mockResolvedValue({
      id: "pl-1",
      userId: "owner",
      isPublic: "N",
    }),
  };
  const dataSource = {
    getRepository: vi.fn((entity) => {
      if (entity === Playlist) return playlistRepository;
      throw new Error(`unexpected repository ${String(entity)}`);
    }),
  } as unknown as DataSource;
  return { dataSource };
}

describe("플레이리스트 좋아요 가시성", () => {
  it("비공개 플레이리스트 좋아요 상태는 타인이 조회할 수 없다", async () => {
    const { dataSource } = privatePlaylistSource();

    await expect(
      getContentLikeStatus(
        dataSource,
        { postId: null, reviewId: null, playlistId: "pl-1" },
        "other"
      )
    ).rejects.toMatchObject({
      message: "비공개 플레이리스트입니다.",
      status: 403,
    });
  });

  it("비공개 플레이리스트는 타인이 좋아요할 수 없다", async () => {
    const { dataSource } = privatePlaylistSource();

    await expect(
      toggleContentLike(
        dataSource,
        "other",
        { postId: null, reviewId: null, playlistId: "pl-1" }
      )
    ).rejects.toMatchObject({
      message: "비공개 플레이리스트입니다.",
      status: 403,
    });
  });
});
