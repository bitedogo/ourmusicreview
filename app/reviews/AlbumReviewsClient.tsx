"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type SortType = "latest" | "likes" | "comments";
type SearchField = "artist" | "album" | "author";

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

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: "artist", label: "아티스트명" },
  { value: "album", label: "앨범명" },
  { value: "author", label: "작성자명" },
];

export function AlbumReviewsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sortFromUrl = (searchParams.get("sort") as SortType) || "latest";
  const searchFieldFromUrl = (searchParams.get("searchField") as SearchField) || "artist";
  const searchQueryFromUrl = (searchParams.get("q") ?? "").trim();

  const [reviews, setReviews] = useState<AlbumReviewItem[]>([]);
  const [sort, setSort] = useState<SortType>(sortFromUrl);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchField, setSearchField] = useState<SearchField>(searchFieldFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);

  const syncFromUrl = useCallback(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const s = (searchParams.get("sort") as SortType) || "latest";
    const field = (searchParams.get("searchField") as SearchField) || "artist";
    const query = (searchParams.get("q") ?? "").trim();
    setPage(p);
    setSort(s);
    setSearchField(field);
    setSearchQuery(query);
  }, [searchParams]);

  const buildReviewsHref = useCallback(
    (nextSort: SortType, nextPage: number, field: SearchField, query: string) => {
      const params = new URLSearchParams({
        sort: nextSort,
        page: String(nextPage),
      });
      if (query.trim()) {
        params.set("searchField", field);
        params.set("q", query.trim());
      }
      return `/reviews?${params.toString()}`;
    },
    []
  );

  const removeSearch = useCallback(() => {
    router.push(buildReviewsHref(sort, 1, searchField, ""));
    setIsSearchModalOpen(false);
  }, [buildReviewsHref, router, searchField, sort]);

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildReviewsHref(sort, 1, searchField, searchQuery));
    setIsSearchModalOpen(false);
  }

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchReviews() {
      try {
        setIsLoading(true);
        setError(null);
        const currentPage = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
        const currentSort = (searchParams.get("sort") as SortType) || "latest";
        const currentSearchField = (searchParams.get("searchField") as SearchField) || "artist";
        const currentSearchQuery = (searchParams.get("q") ?? "").trim();
        const response = await fetch(
          `/api/reviews/list?sort=${currentSort}&page=${currentPage}&searchField=${currentSearchField}&q=${encodeURIComponent(currentSearchQuery)}`,
          { signal: controller.signal }
        );
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setError(data?.error ?? "리뷰를 불러오지 못했습니다.");
          setReviews([]);
          return;
        }

        setReviews(data.reviews ?? []);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
        setPage(data.page ?? 1);
      } catch (error) {
        if (controller.signal.aborted) return;
        setError(
          error instanceof Error ? error.message : "리뷰를 불러오는 중 오류가 발생했습니다."
        );
        setReviews([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    fetchReviews();
    return () => {
      controller.abort();
    };
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">앨범 리뷰</h1>
      </section>

      <div className="border-b border-zinc-200 pb-2">
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={buildReviewsHref(opt.value, 1, searchField, searchQuery)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                sort === opt.value
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {!!searchQuery && (
        <div className="flex items-center gap-2 text-xs text-zinc-600">
          <span className="rounded-full bg-zinc-100 px-2 py-1">
            {SEARCH_FIELD_OPTIONS.find((opt) => opt.value === searchField)?.label}: {searchQuery}
          </span>
          <button
            type="button"
            onClick={removeSearch}
            className="rounded-full border border-zinc-300 px-2 py-1 text-[11px] text-zinc-600 hover:bg-zinc-100"
          >
            검색 해제
          </button>
        </div>
      )}

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
              href={`/review/${encodeURIComponent(review.id)}?from=reviews&sort=${sort}&page=${page}&searchField=${searchField}&q=${encodeURIComponent(searchQuery)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {review.album?.imageUrl && (
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={review.album.imageUrl}
                      alt={review.album.title}
                      width={80}
                      height={80}
                      unoptimized
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
                      <span
                        className={`text-sm font-bold ${Number(review.rating) >= 9 ? "text-red-600" : "text-zinc-900"}`}
                      >
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

      {!isLoading && !error && (
        <div className="pt-4">
          <div className="mb-3 flex justify-start">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
            >
              검색
            </button>
          </div>
          {totalPages > 1 && (
            <nav className="flex flex-wrap items-center justify-center gap-1">
              {page > 1 && (
                <Link
                  href={buildReviewsHref(sort, page - 1, searchField, searchQuery)}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  이전
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildReviewsHref(sort, p, searchField, searchQuery)}
                  className={`rounded px-3 py-1.5 text-sm ${
                    p === page
                      ? "bg-[var(--color-brand-primary)] font-medium text-white"
                      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={buildReviewsHref(sort, page + 1, searchField, searchQuery)}
                  className="rounded border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
                >
                  다음
                </Link>
              )}
            </nav>
          )}
        </div>
      )}

      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-zinc-900">리뷰 검색</h2>
            <p className="mt-1 text-xs text-zinc-500">
              검색 기준을 선택하고 키워드를 입력해주세요.
            </p>

            <form onSubmit={applySearch} className="mt-4 space-y-4">
              <div className="flex gap-2">
                {SEARCH_FIELD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSearchField(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      searchField === option.value
                        ? "bg-[var(--color-brand-primary)] text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-brand-primary-hover)]"
                >
                  검색
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
