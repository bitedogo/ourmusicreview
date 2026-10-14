import { describe, expect, it } from "vitest";
import {
  BOARD_CATEGORY_BY_SLUG,
  BOARD_CONFIG,
  BOARD_SLUG_BY_CATEGORY,
  POST_CATEGORIES,
  boardSlugFromCategory,
  getBoardCategoryLabel,
  isBoardSlug,
  isPostCategory,
  isUserWriteCategory,
} from "./board-config";

describe("board-config", () => {
  it("카테고리·슬러그·설정이 서로 맞는다", () => {
    for (const category of POST_CATEGORIES) {
      const slug = BOARD_SLUG_BY_CATEGORY[category];
      expect(BOARD_CATEGORY_BY_SLUG[slug]).toBe(category);
      expect(BOARD_CONFIG[slug].category).toBe(category);
      expect(BOARD_CONFIG[slug].title).toBe(getBoardCategoryLabel(category));
      expect(boardSlugFromCategory(category)).toBe(slug);
    }
    expect(BOARD_CONFIG.domestic.listLayout).toBe("feed");
    expect(BOARD_CONFIG.workroom.listLayout).toBe("feed");
    expect(BOARD_CONFIG.market.listLayout).toBe("table");
    expect(BOARD_CONFIG.notice.listLayout).toBe("table");
  });

  it("슬러그·카테고리 가드가 유효값만 통과한다", () => {
    expect(isBoardSlug("domestic")).toBe(true);
    expect(isBoardSlug("unknown")).toBe(false);
    expect(isPostCategory("K")).toBe(true);
    expect(isPostCategory("X")).toBe(false);
    expect(isPostCategory("k")).toBe(false);
    expect(isUserWriteCategory("W")).toBe(true);
    expect(isUserWriteCategory("N")).toBe(false);
  });
});
