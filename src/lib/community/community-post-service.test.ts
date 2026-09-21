import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import type { PostCategory } from "@/src/lib/db/entities/Post";
import type { NoticeCategory } from "@/src/lib/community/types";
import {
  createCommunityPost,
  updateCommunityPost,
} from "./community-post-service";

function createPostFixture(overrides?: {
  category?: PostCategory;
  noticeCategory?: NoticeCategory | null;
  userId?: string;
  isGlobal?: "Y" | "N";
}) {
  const post = {
    id: "post-1",
    title: "제목",
    content: "내용",
    category: overrides?.category ?? "K",
    noticeCategory: overrides?.noticeCategory ?? null,
    userId: overrides?.userId ?? "user-1",
    isGlobal: overrides?.isGlobal ?? "N",
  };
  const postRepository = {
    findOne: vi.fn().mockResolvedValue(post),
    save: vi.fn(async (value: typeof post) => value),
    create: vi.fn((value: unknown) => value),
  };
  const dataSource = {
    getRepository: vi.fn(() => postRepository),
  } as unknown as DataSource;

  return { dataSource, postRepository, post };
}

describe("createCommunityPost", () => {
  it("비관리자는 공지(N)로 작성할 수 없다", async () => {
    const { dataSource } = createPostFixture();

    await expect(
      createCommunityPost(
        dataSource,
        { userId: "user-1", nickname: "닉", isAdmin: false },
        { title: "제목", content: "내용", category: "N", noticeCategory: "EVENT" }
      )
    ).rejects.toMatchObject({
      message: "공지사항 작성 권한이 없습니다.",
      status: 403,
    });
  });
});

describe("updateCommunityPost", () => {
  it("비관리자는 일반 글을 공지(N)로 바꿀 수 없다", async () => {
    const { dataSource, postRepository, post } = createPostFixture({
      category: "W",
    });

    await expect(
      updateCommunityPost(
        dataSource,
        post.id,
        { userId: post.userId, isAdmin: false },
        { category: "N", noticeCategory: "EVENT" }
      )
    ).rejects.toMatchObject({
      message: "공지사항 작성 권한이 없습니다.",
      status: 403,
    });
    expect(postRepository.save).not.toHaveBeenCalled();
  });

  it("본인 글은 허용된 게시판 카테고리로 유지·수정할 수 있다", async () => {
    const { dataSource, post } = createPostFixture({ category: "W" });

    const updated = await updateCommunityPost(
      dataSource,
      post.id,
      { userId: post.userId, isAdmin: false },
      { title: "수정", category: "W" }
    );

    expect(updated.category).toBe("W");
    expect(updated.title).toBe("수정");
  });

  it("허용되지 않은 카테고리는 기존 값을 유지한다", async () => {
    const { dataSource, post } = createPostFixture({ category: "W" });

    const updated = await updateCommunityPost(
      dataSource,
      post.id,
      { userId: post.userId, isAdmin: false },
      { category: "X" as PostCategory }
    );

    expect(updated.category).toBe("W");
  });

  it("관리자는 공지 카테고리와 함께 N으로 올릴 수 있다", async () => {
    const { dataSource, post } = createPostFixture({ category: "K" });

    const updated = await updateCommunityPost(
      dataSource,
      post.id,
      { userId: "admin-1", isAdmin: true },
      { category: "N", noticeCategory: "EVENT" }
    );

    expect(updated.category).toBe("N");
    expect(updated.noticeCategory).toBe("EVENT");
  });

  it("관리자가 공지로 올릴 때 공지 유형이 없으면 거절한다", async () => {
    const { dataSource, post } = createPostFixture({ category: "K" });

    await expect(
      updateCommunityPost(
        dataSource,
        post.id,
        { userId: "admin-1", isAdmin: true },
        { category: "N" }
      )
    ).rejects.toMatchObject({ status: 400 });
  });

  it("공지에서 일반 게시판으로 내리면 noticeCategory를 지운다", async () => {
    const { dataSource, post } = createPostFixture({
      category: "N",
      noticeCategory: "EVENT",
    });

    const updated = await updateCommunityPost(
      dataSource,
      post.id,
      { userId: "admin-1", isAdmin: true },
      { category: "K" }
    );

    expect(updated.category).toBe("K");
    expect(updated.noticeCategory).toBeNull();
  });

  it("본문에 남은 audio 태그를 저장하지 않는다", async () => {
    const { dataSource, postRepository } = createPostFixture();

    await createCommunityPost(
      dataSource,
      { userId: "user-1", nickname: "닉", isAdmin: false },
      {
        title: "데모",
        content: '<p>인트로</p><p><audio src="/old.mp3" controls></audio></p>',
        category: "W",
      }
    );

    expect(postRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        content: "<p>인트로</p><p></p>",
        category: "W",
      })
    );
  });
});
