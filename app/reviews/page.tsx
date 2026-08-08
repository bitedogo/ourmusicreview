/** 전체 리뷰 목록 페이지 */

import { Suspense } from "react";
import { AlbumReviewsClient } from "./AlbumReviewsClient";
import {
  REVIEW_LIST_CONTENT_CLASS,
  REVIEW_PAGE_TITLE_CLASS,
} from "@/src/components/reviews/review-page-styles";

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-4 pb-10 pt-[61px] sm:px-6">
          <div className={REVIEW_LIST_CONTENT_CLASS}>
            <section>
              <h1 className={REVIEW_PAGE_TITLE_CLASS}>앨범 리뷰</h1>
            </section>
            <div className="mt-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
              리뷰를 불러오는 중...
            </div>
          </div>
        </div>
      }
    >
      <AlbumReviewsClient />
    </Suspense>
  );
}
