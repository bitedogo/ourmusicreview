/** 전체 리뷰 목록 페이지 */

import { Suspense } from "react";
import {
  ReviewListClient,
  type ReviewListInitialData,
} from "@/src/components/reviews/review-list-client";
import {
  REVIEW_LIST_CONTENT_CLASS,
  REVIEW_PAGE_TITLE_CLASS,
} from "@/src/components/reviews/review-page-styles";
import { withDatabaseRead } from "@/src/lib/db";
import { getReviewList } from "@/src/lib/reviews/review-list-service";

function first(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const result = await withDatabaseRead((dataSource) =>
    getReviewList(dataSource, {
      sort: first(query.sort),
      page: first(query.page),
      searchField: first(query.searchField),
      q: first(query.q),
    })
  );
  const initialData = JSON.parse(
    JSON.stringify({
      reviews: result.reviews,
      sort: result.sort,
      searchField: result.searchField,
      q: result.q,
      page: result.page,
      totalPages: result.totalPages,
    })
  ) as ReviewListInitialData;

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
      <ReviewListClient initialData={initialData} />
    </Suspense>
  );
}
