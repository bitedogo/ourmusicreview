import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { In } from "typeorm";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post, PostCategory } from "@/src/lib/db/entities/Post";
import { Comment } from "@/src/lib/db/entities/Comment";
import type { NoticeCategory } from "@/src/lib/community/types";
import {
  NOTICE_CATEGORY_COLOR,
  NOTICE_CATEGORY_LABEL,
} from "@/src/lib/community/notice-category";
import Link from "next/link";
import { getPaginationItems } from "@/src/lib/utils/pagination";
import { BoardSearchControls } from "./board-search-controls";

type BoardType = "domestic" | "overseas" | "market" | "workroom" | "notice";
type BoardSearchField = "title" | "author";

interface BoardMeta {
  title: string;
  description: string;
  category: PostCategory;
  adminOnlyWrite?: boolean;
}

const BOARD_CONFIG: Record<BoardType, BoardMeta> = {
  domestic: {
    title: "국내게시판",
    description: "국내 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "K",
  },
  overseas: {
    title: "해외게시판",
    description: "해외 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "I",
  },
  market: {
    title: "장터게시판",
    description: "음반, 굿즈, 공연 티켓 등 음악 관련 물품을<span class=\"md:inline block\"> </span>자유롭게 거래해보세요.",
    category: "M",
  },
  workroom: {
    title: "워크룸",
    description: "작업 중인 음악, 가사, 아이디어를 공유하고<span class=\"md:inline block\"> </span>피드백을 받아보세요.",
    category: "W",
  },
  notice: {
    title: "공지사항",
    description: "ORU 서비스 관련 공지사항을 확인하세요.",
    category: "N",
    adminOnlyWrite: true,
  },
};

const PAGE_SIZE_BOARD = 15;

function getNoticeCategoryLabel(post: { noticeCategory?: NoticeCategory | null }): string | null {
  if (!post.noticeCategory || !(post.noticeCategory in NOTICE_CATEGORY_LABEL)) return null;
  return NOTICE_CATEGORY_LABEL[post.noticeCategory as NoticeCategory];
}

function getNoticeCategoryColor(post: { noticeCategory?: NoticeCategory | null }): string | null {
  if (!post.noticeCategory || !(post.noticeCategory in NOTICE_CATEGORY_COLOR)) return null;
  return NOTICE_CATEGORY_COLOR[post.noticeCategory as NoticeCategory];
}

export default async function BoardPage(props: {
  params: Promise<{ board: BoardType }>;
  searchParams: Promise<{ page?: string; searchField?: string; q?: string }>;
}) {
  const { board } = await props.params;
  const {
    page: pageParam,
    searchField: rawSearchField,
    q: rawQuery,
  } = await props.searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const searchField: BoardSearchField =
    rawSearchField === "author" ? "author" : "title";
  const searchQuery = (rawQuery ?? "").trim().slice(0, 100);

  const config = BOARD_CONFIG[board];
  if (!config) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.id);

  const dataSource = await initializeDatabase();
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const postsQueryBuilder = postRepository
    .createQueryBuilder("post")
    .orderBy("post.created_at", "DESC");

  if (config.category === "N") {
    postsQueryBuilder.where("post.category = :category", { category: "N" });
  } else {
    postsQueryBuilder.where(
      "(post.category = :category OR post.is_global = :isGlobal)",
      {
        category: config.category,
        isGlobal: "Y",
      }
    );
  }

  if (searchQuery) {
    if (searchField === "title") {
      postsQueryBuilder.andWhere("post.title ILIKE :keyword", {
        keyword: `%${searchQuery}%`,
      });
    } else {
      postsQueryBuilder.andWhere("post.nickname ILIKE :keyword", {
        keyword: `%${searchQuery}%`,
      });
    }
  }

  const allPosts = await postsQueryBuilder.getMany();

  const postIds = allPosts.map((post) => post.id);
  const commentCountRows =
    postIds.length > 0
      ? await commentRepository
          .createQueryBuilder("comment")
          .select("comment.post_id", "postId")
          .addSelect("COUNT(comment.id)", "count")
          .where({
            postId: In(postIds),
          })
          .groupBy("comment.post_id")
          .getRawMany<{ postId: string; count: string }>()
      : [];

  const commentCountMap = new Map<string, number>(
    commentCountRows.map((row) => [row.postId, Number(row.count)])
  );

  const postsWithMeta = allPosts.map((post) => {
    const isReleasePinned =
      post.category !== "N" && post.noticeCategory === "RELEASE_NOTE";
    return {
      ...post,
      commentCount: commentCountMap.get(post.id) ?? 0,
      isPinned: post.isGlobal === "Y", // isGlobal === 'Y'는 전체 공지 (빨간색)으로 최상단 고정
      isReleasePinned, // noticeCategory === 'RELEASE_NOTE'는 릴리즈 (초록색)으로 고정
    };
  });

  const globalPinnedPosts = postsWithMeta.filter((post) => post.isPinned);
  const releasePinnedPosts = postsWithMeta
    .filter((post) => !post.isPinned && post.isReleasePinned)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const otherPosts = postsWithMeta.filter(
    (post) => !post.isPinned && !post.isReleasePinned
  );

  const totalOtherPosts = otherPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalOtherPosts / PAGE_SIZE_BOARD));
  const currentPage = Math.min(page, totalPages);
  const paginatedOtherPosts = otherPosts.slice(
    (currentPage - 1) * PAGE_SIZE_BOARD,
    currentPage * PAGE_SIZE_BOARD
  );

  const finalPostsToRender = [
    ...globalPinnedPosts,
    ...releasePinnedPosts,
    ...paginatedOtherPosts,
  ].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    if (a.isReleasePinned && !a.isPinned && !b.isReleasePinned) return -1;
    if (!a.isReleasePinned && b.isReleasePinned && !b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const canWrite = config.adminOnlyWrite
    ? session?.user && (session.user as { role?: string }).role === "ADMIN"
    : isSignedIn;
  const writeHref = canWrite
    ? `/community/write?category=${encodeURIComponent(config.category)}`
    : config.adminOnlyWrite
      ? "#"
      : `/auth/signin?callbackUrl=${encodeURIComponent(
          `/community/write?category=${config.category}`
        )}`;

  function buildBoardHref(nextPage: number): string {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (searchQuery) {
      params.set("searchField", searchField);
      params.set("q", searchQuery);
    }
    return `/boards/${board}?${params.toString()}`;
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-10">
      <section className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {config.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500" dangerouslySetInnerHTML={{ __html: config.description }} />
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <Link
              href={writeHref}
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] whitespace-nowrap"
            >
              글쓰기
            </Link>
          )}
        </div>
      </section>

      <section>
        {totalOtherPosts === 0 &&
        globalPinnedPosts.length === 0 &&
        releasePinnedPosts.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-sm text-zinc-500">
            {searchQuery
              ? "검색 결과가 없습니다. 다른 키워드로 다시 시도해주세요."
              : (
                <>
                  아직 등록된 게시글이 없습니다.{" "}
                  <span className="font-semibold text-zinc-700">
                    첫 번째 글
                  </span>
                  을 남겨보세요.
                </>
              )}
          </div>
        ) : (
          <>
            <div className="overflow-hidden border border-zinc-200 bg-white text-xs shadow-sm">
              <table className="min-w-full table-fixed border-collapse">
                <thead className="bg-zinc-50">
                  <tr className="border-b border-zinc-200 text-zinc-700">
                    <th className="w-[60px] px-3 py-2 text-center font-semibold">
                      번호
                    </th>
                    <th className="px-3 py-2 text-left font-semibold">제목</th>
                    <th className="w-[100px] px-3 py-2 text-center font-semibold">
                      글쓴이
                    </th>
                    <th className="w-[80px] px-3 py-2 text-center font-semibold">
                      날짜
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {finalPostsToRender.map((post) => (
                    <tr
                      key={post.id}
                      className={`hover:bg-zinc-50 ${post.isPinned ? "bg-zinc-50/50" : ""}`}
                    >
                      <td className="px-3 py-2 text-center text-[11px] text-zinc-400">
                        {post.isPinned || post.isReleasePinned || config.category === "N" ? (
                          <span
                            className="inline-flex items-center justify-center"
                            title={
                              post.isReleasePinned && !post.isPinned && config.category !== "N"
                                ? "릴리즈"
                                : "공지사항"
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`h-4 w-4 ${
                                post.isReleasePinned && !post.isPinned && config.category !== "N"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
                              <path d="M14.5 8.5a5 5 0 0 1 0 7" />
                              <path d="M17.5 6a8.5 8.5 0 0 1 0 12" />
                            </svg>
                          </span>
                        ) : (
                          totalOtherPosts -
                            (currentPage - 1) * PAGE_SIZE_BOARD -
                            paginatedOtherPosts.indexOf(post)
                        )}
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <Link
                          href={`/community/${encodeURIComponent(post.id)}`}
                          className={`flex items-center gap-1.5 hover:underline ${config.category === "N" ? "font-bold text-black" : ""} ${post.isPinned ? "text-red-600 font-bold" : ""} ${post.isReleasePinned && !post.isPinned ? "text-emerald-600 font-bold" : ""}`}
                        >
                          {config.category === "N" && (() => {
                            const label = getNoticeCategoryLabel(post);
                            const color = getNoticeCategoryColor(post);
                            return label && color ? (
                              <span className={`shrink-0 font-semibold ${color}`}>
                                [{label}]
                              </span>
                            ) : null;
                          })()}
                          <span className={`line-clamp-1 ${config.category === "N" ? "font-bold text-black" : ""}`}>{post.title}</span>
                          {post.commentCount > 0 && (
                            <span className="text-[10px] font-bold text-red-500">
                              [{post.commentCount}]
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="px-3 py-2 text-center text-[11px] text-zinc-700">
                        <span
                          className={`line-clamp-1 ${post.isPinned ? "font-black" : ""}`}
                        >
                          {post.nickname}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center text-[11px] text-zinc-500">
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleDateString(
                              "ko-KR",
                              { month: "2-digit", day: "2-digit" }
                            )
                          : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              {config.category !== "N" && (
                <div className="mb-3 flex justify-start">
                  <BoardSearchControls
                    board={board}
                    initialSearchField={searchField}
                    initialQuery={searchQuery}
                  />
                </div>
              )}
              {totalPages > 1 && (
                <nav className="flex flex-wrap items-center justify-center gap-1">
                  {currentPage > 1 && (
                    <Link
                      href={buildBoardHref(currentPage - 1)}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      이전
                    </Link>
                  )}
                  {getPaginationItems(currentPage, totalPages).map((item, idx) =>
                    item === "ellipsis" ? (
                      <span
                        key={`e-${idx}`}
                        className="px-1.5 py-1.5 text-sm text-zinc-400"
                        aria-hidden
                      >
                        …
                      </span>
                    ) : (
                      <Link
                        key={item}
                        href={buildBoardHref(item)}
                        className={`rounded px-3 py-1.5 text-sm ${
                          item === currentPage
                            ? "bg-[var(--color-brand-primary)] font-medium text-white"
                            : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                        }`}
                      >
                        {item}
                      </Link>
                    )
                  )}
                  {currentPage < totalPages && (
                    <Link
                      href={buildBoardHref(currentPage + 1)}
                      className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      다음
                    </Link>
                  )}
                </nav>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
