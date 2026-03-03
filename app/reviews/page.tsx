import { Suspense } from "react";
import { AlbumReviewsClient } from "./AlbumReviewsClient";

export default function ReviewsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
          <section>
            <h1 className="text-xl font-semibold tracking-tight">앨범 리뷰</h1>
          </section>
          <div className="py-12 text-center text-sm text-zinc-500">
            리뷰를 불러오는 중...
          </div>
        </div>
      }
    >
      <AlbumReviewsClient />
    </Suspense>
  );
}
