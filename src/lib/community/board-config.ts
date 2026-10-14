/** 커뮤니티 게시판 슬러그·카테고리·라벨 설정 */

import type { PostCategory } from "@/src/lib/db/entities/Post";
import type { BoardSlug } from "@/src/lib/navigation/routes";

export type { BoardSlug };
export type BoardSearchField = "title" | "author";

export const PAGE_SIZE_BOARD = 15;

export const POST_CATEGORIES = ["K", "I", "M", "W", "N"] as const satisfies readonly PostCategory[];
export const USER_WRITE_CATEGORIES = ["K", "I", "M", "W"] as const satisfies readonly PostCategory[];

export const BOARD_SLUG_BY_CATEGORY: Record<PostCategory, BoardSlug> = {
  K: "domestic",
  I: "overseas",
  M: "market",
  W: "workroom",
  N: "notice",
};

export const BOARD_CATEGORY_BY_SLUG: Record<BoardSlug, PostCategory> = {
  domestic: "K",
  overseas: "I",
  market: "M",
  workroom: "W",
  notice: "N",
};

export const BOARD_CATEGORY_LABEL: Record<PostCategory, string> = {
  K: "국내게시판",
  I: "해외게시판",
  M: "장터게시판",
  W: "워크룸",
  N: "공지사항",
};

export type BoardListLayout = "feed" | "table";

export interface BoardMeta {
  slug: BoardSlug;
  title: string;
  description: string;
  category: PostCategory;
  listLayout: BoardListLayout;
  adminOnlyWrite?: boolean;
}

export const BOARD_CONFIG: Record<BoardSlug, BoardMeta> = {
  domestic: {
    slug: "domestic",
    title: BOARD_CATEGORY_LABEL.K,
    description: "국내 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "K",
    listLayout: "feed",
  },
  overseas: {
    slug: "overseas",
    title: BOARD_CATEGORY_LABEL.I,
    description: "해외 음악에 대한 이야기와 정보를 자유롭게 나눠보세요.",
    category: "I",
    listLayout: "feed",
  },
  market: {
    slug: "market",
    title: BOARD_CATEGORY_LABEL.M,
    description:
      "음반, 굿즈, 공연 티켓 등 음악 관련 물품을<span class=\"md:inline block\"> </span>자유롭게 거래해보세요.",
    category: "M",
    listLayout: "table",
  },
  workroom: {
    slug: "workroom",
    title: BOARD_CATEGORY_LABEL.W,
    description:
      "작업 중인 음악, 가사, 아이디어를 공유하고<span class=\"md:inline block\"> </span>피드백을 받아보세요.",
    category: "W",
    listLayout: "feed",
  },
  notice: {
    slug: "notice",
    title: BOARD_CATEGORY_LABEL.N,
    description: "ORU 서비스 관련 공지사항을 확인하세요.",
    category: "N",
    listLayout: "table",
    adminOnlyWrite: true,
  },
};

export function isBoardSlug(value: string): value is BoardSlug {
  return Object.prototype.hasOwnProperty.call(BOARD_CATEGORY_BY_SLUG, value);
}

export function isPostCategory(value: string): value is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(value);
}

export function isUserWriteCategory(
  value: string
): value is Exclude<PostCategory, "N"> {
  return (USER_WRITE_CATEGORIES as readonly string[]).includes(value);
}

export function getBoardCategoryLabel(category: PostCategory): string {
  return BOARD_CATEGORY_LABEL[category];
}

export function boardSlugFromCategory(category: PostCategory): BoardSlug {
  return BOARD_SLUG_BY_CATEGORY[category];
}
