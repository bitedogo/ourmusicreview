import { describe, expect, it, vi } from "vitest";
import type { DataSource } from "typeorm";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Post } from "@/src/lib/db/entities/Post";
import { listBoardPosts } from "./board-post-service";

function createQueryBuilder(result: {
  getMany?: unknown[];
  getCount?: number;
}) {
  const builder: Record<string, unknown> = {};
  const chain = () => builder;
  builder.where = vi.fn(chain);
  builder.andWhere = vi.fn(chain);
  builder.orderBy = vi.fn(chain);
  builder.select = vi.fn(chain);
  builder.addSelect = vi.fn(chain);
  builder.groupBy = vi.fn(chain);
  builder.skip = vi.fn(chain);
  builder.take = vi.fn(chain);
  builder.clone = vi.fn(() => builder);
  builder.getMany = vi.fn().mockResolvedValue(result.getMany ?? []);
  builder.getCount = vi.fn().mockResolvedValue(result.getCount ?? 0);
  builder.getRawMany = vi.fn().mockResolvedValue([]);
  return builder;
}

describe("listBoardPosts", () => {
  it("고정글은 전부 두고 일반글만 DB에서 페이지네이션한다", async () => {
    const pinned = {
      id: "pin-1",
      title: "공지",
      nickname: "admin",
      createdAt: new Date("2026-09-01T00:00:00Z"),
      isGlobal: "Y",
      noticeCategory: null,
    };
    const pagePost = {
      id: "post-2",
      title: "일반",
      nickname: "user",
      createdAt: new Date("2026-09-02T00:00:00Z"),
      isGlobal: "N",
      noticeCategory: null,
    };

    const pinnedQuery = createQueryBuilder({ getMany: [pinned] });
    const otherQuery = createQueryBuilder({
      getMany: [pagePost],
      getCount: 25,
    });
    const commentQuery = createQueryBuilder({});
    commentQuery.getRawMany = vi.fn().mockResolvedValue([
      { postId: "pin-1", count: "3" },
      { postId: "post-2", count: "1" },
    ]);

    let postQueryCalls = 0;
    const postRepository = {
      createQueryBuilder: vi.fn(() => {
        postQueryCalls += 1;
        return postQueryCalls === 1 ? pinnedQuery : otherQuery;
      }),
    };
    const commentRepository = {
      createQueryBuilder: vi.fn(() => commentQuery),
    };
    const dataSource = {
      getRepository: vi.fn((entity: unknown) =>
        entity === Post ? postRepository : entity === Comment ? commentRepository : null
      ),
    } as unknown as DataSource;

    const result = await listBoardPosts(dataSource, {
      category: "K",
      page: 2,
      pageSize: 10,
      searchField: "title",
      searchQuery: "",
    });

    expect(otherQuery.skip).toHaveBeenCalledWith(10);
    expect(otherQuery.take).toHaveBeenCalledWith(10);
    expect(result.totalOtherPosts).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(2);
    expect(result.posts).toHaveLength(2);
    expect(result.posts[0]).toMatchObject({
      id: "pin-1",
      isPinned: true,
      commentCount: 3,
      rowNumber: null,
    });
    expect(result.posts[1]).toMatchObject({
      id: "post-2",
      isPinned: false,
      commentCount: 1,
      rowNumber: 15,
    });
  });
});
