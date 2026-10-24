import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { createComment, listComments } from "./comment-service";

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
  return { dataSource, playlistRepository };
}

describe("플레이리스트 댓글 가시성", () => {
  it("비공개 플레이리스트 댓글 목록은 타인이 볼 수 없다", async () => {
    const { dataSource } = privatePlaylistSource();

    await expect(
      listComments(dataSource, {
        playlistId: "pl-1",
        viewerUserId: "other",
      })
    ).rejects.toMatchObject({
      message: "비공개 플레이리스트입니다.",
      status: 403,
    });
  });

  it("비공개 플레이리스트에는 타인이 댓글을 달 수 없다", async () => {
    const { dataSource } = privatePlaylistSource();

    await expect(
      createComment(dataSource, "other", {
        playlistId: "pl-1",
        content: "몰래 남긴 댓글",
      })
    ).rejects.toMatchObject({
      message: "비공개 플레이리스트입니다.",
      status: 403,
    });
  });
});
