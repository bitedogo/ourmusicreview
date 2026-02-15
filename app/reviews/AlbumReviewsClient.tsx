"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type SortType = "latest" | "likes" | "comments";

interface AlbumReviewItem {
  id: string;
  content: string;
  rating: number;
  albumId: string;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  } | null;
  user: { id: string; nickname: string } | null;
}

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: "latest", label: "최신순" },
  { value: "likes", label: "좋아요 순" },
  { value: "comments", label: "댓글 많은 순" },
];

export function AlbumReviewsClient() {
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sortFromUrl = (searchParams.get("sort") as SortType) || "latest";

  const [reviews, setReviews] = useState<AlbumReviewItem[]>([]);
  const [sort, setSort] = useState<SortType>(sortFromUrl);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncFromUrl = useCallback(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const s = (searchParams.get("sort") as SortType) || "latest";
    setPage(p);
    setSort(s);
  }, [searchParams]);

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    async function fetchReviews() {
      try {
        setIsLoading(true);
        setError(null);
        const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
        const currentSort = (searchParams.get("sort") as SortType) || "latest";
        const response = await fetch(
          `/api/reviews/list?sort=${currentSort}&page=${currentPage}`
        );
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setError(data?.error ?? "리뷰를 불러오지 못했습니다.");
          setReviews([]);
          return;
        }

        setReviews(data.reviews ?? []);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
        setTotal(data.total ?? 0);
        setPage(data.page ?? 1);
      } catch {
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">앨범 리뷰</h1>
      </section>

      <div className="flex gap-2 border-b border-zinc-200 pb-2">
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={`/reviews?sort=${opt.value}&page=1`}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              sort === opt.value
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">리뷰를 불러오는 중...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 승인된 앨범 리뷰가 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/review/${encodeURIComponent(review.id)}?from=reviews&sort=${sort}&page=${page}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {review.album?.imageUrl && (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      src={review.album.imageUrl}
                      alt={review.album.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {review.album?.artist}
                      </p>
                      <h3 className="line-clamp-1 text-sm font-bold text-zinc-900">
                        {review.album?.title}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-zinc-900">
                        {Number(review.rating).toFixed(1)}
                      </span>
                      <span className="ml-1 text-[10px] text-zinc-500">/ 10.0</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {review.user && (
                      <span className="font-medium text-zinc-600">{review.user.nickname}</span>
                    )}
                    <span>좋아요 {review.likeCount}</span>
                    <span>댓글 {review.commentCount}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                    {(review.content ?? "").replace(/<[^>]*>/g, "").trim() || "내용 없음"}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && !isLoading && !error && (
        <nav className="flex flex-wrap items-center justify-center gap-1 pt-4">
          {page > 1 && (
            <Link
              href={`/reviews?sort=${sort}&page=${page - 1}`}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              이전
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/reviews?sort=${sort}&page=${p}`}
              className={`rounded px-3 py-1.5 text-sm ${
                p === page
                  ? "bg-zinc-900 font-medium text-white"
                  : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link
              href={`/reviews?sort=${sort}&page=${page + 1}`}
              className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              다음
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
