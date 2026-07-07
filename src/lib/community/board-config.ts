import type { PostCategory } from "@/src/lib/db/entities/Post";

export const BOARD_CATEGORY_LABEL: Record<PostCategory, string> = {
  K: "국내게시판",
  I: "해외게시판",
  M: "장터게시판",
  W: "워크룸",
  N: "공지사항",
};

export function getBoardCategoryLabel(category: PostCategory): string {
  return BOARD_CATEGORY_LABEL[category];
}
