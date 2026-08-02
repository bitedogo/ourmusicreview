/** 공개 플레이리스트 목록 페이지 (내비 미노출 · URL 직접 진입) */

import { Suspense } from "react";
import { PlaylistListClient } from "./PlaylistListClient";
import {
  REVIEW_LIST_CONTENT_CLASS,
  REVIEW_PAGE_TITLE_CLASS,
} from "@/src/components/reviews/review-page-styles";

export default function PlaylistPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-4 pb-10 pt-[61px] sm:px-6">
          <div className={REVIEW_LIST_CONTENT_CLASS}>
            <section>
              <h1 className={REVIEW_PAGE_TITLE_CLASS}>플레이리스트</h1>
            </section>
            <div className="mt-5 py-12 text-center text-sm text-zinc-500">
              플레이리스트를 불러오는 중...
            </div>
          </div>
        </div>
      }
    >
      <PlaylistListClient />
    </Suspense>
  );
}
