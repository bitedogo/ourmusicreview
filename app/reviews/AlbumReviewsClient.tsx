"use client";
/** 전체 리뷰 목록 클라이언트 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReviewPreviewText } from "@/src/lib/utils/editor";
import { AlbumReviewPreviewCard } from "@/src/components/reviews/AlbumReviewPreviewCard";
import { ReviewSearchButton } from "@/src/components/reviews/ReviewSearchButton";
import { REVIEW_PAGE_TITLE_CLASS } from "@/src/components/reviews/review-page-styles";
import {
  ReviewSortToggle,
  type ReviewSortType,
} from "@/src/components/reviews/ReviewSortToggle";
import { PaginationNav } from "@/src/components/common/PaginationNav";

type SortType = ReviewSortType;
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
  const [isSortExpanded, setIsSortExpanded] = useState(false);
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
    <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-4 pb-10 pt-[61px] sm:px-6">
      <section className="flex flex-col gap-[28px]">
        <h1 className={REVIEW_PAGE_TITLE_CLASS}>앨범 리뷰</h1>
        <div className="flex items-center justify-between gap-3">
          <ReviewSortToggle
            sort={sort}
            expanded={isSortExpanded}
            onExpandedChange={setIsSortExpanded}
            buildHref={(nextSort) =>
              buildReviewsHref(nextSort, 1, searchField, searchQuery)
            }
          />
          <ReviewSearchButton onClick={() => setIsSearchModalOpen(true)} />
        </div>
      </section>

      {!!searchQuery && (
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
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
        <div className="mt-5 py-12 text-center text-sm text-zinc-500">리뷰를 불러오는 중...</div>
      ) : error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : reviews.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 승인된 앨범 리뷰가 없습니다.
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-5">
          {reviews.map((review) => (
            <AlbumReviewPreviewCard
              key={review.id}
              href={`/review/${encodeURIComponent(review.id)}?from=reviews&sort=${sort}&page=${page}&searchField=${searchField}&q=${encodeURIComponent(searchQuery)}`}
              albumTitle={review.album?.title ?? "앨범"}
              artist={review.album?.artist ?? "-"}
              imageUrl={review.album?.imageUrl ?? null}
              rating={Number(review.rating)}
              previewText={getReviewPreviewText(review.content ?? "")}
              authorNickname={review.user?.nickname ?? null}
              createdAt={review.createdAt}
              likeCount={review.likeCount}
              commentCount={review.commentCount}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="flex justify-center pt-4">
          <PaginationNav
            currentPage={page}
            totalPages={totalPages}
            buildHref={(p) => buildReviewsHref(sort, p, searchField, searchQuery)}
          />
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
