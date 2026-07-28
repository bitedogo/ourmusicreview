/** 게시판 종류 및 설정 상수 */

import type { PostCategory } from "@/src/lib/db/entities/Post";

export type BoardType = "domestic" | "overseas" | "market" | "workroom" | "notice";
export type BoardSearchField = "title" | "author";

export interface BoardMeta {
  title: string;
  description: string;
  category: PostCategory;
  adminOnlyWrite?: boolean;
}

export const BOARD_CONFIG: Record<BoardType, BoardMeta> = {
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

export const PAGE_SIZE_BOARD = 15;
