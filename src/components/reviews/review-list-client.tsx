"use client";
/** 전체 리뷰 목록 클라이언트 */

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import { AlbumReviewPreviewCard } from "@/src/components/reviews/AlbumReviewPreviewCard";
import { ReviewReleaseTypeToggle } from "@/src/components/reviews/ReviewReleaseTypeToggle";
import { ReviewSearchButton } from "@/src/components/reviews/ReviewSearchButton";
import {
  ReviewSortToggle,
  type ReviewSortType,
} from "@/src/components/reviews/ReviewSortToggle";
import {
  REVIEW_LIST_CONTENT_CLASS,
  REVIEW_PAGE_TITLE_CLASS,
} from "@/src/components/reviews/review-page-styles";
import { parseAlbumReleaseType, type AlbumReleaseType } from "@/src/lib/albums/release-type";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { reviewDetail } from "@/src/lib/navigation/routes";
import {
  fetchReviewList,
  type ReviewListItemDto,
  type ReviewListSearchField,
} from "@/src/lib/reviews/client-api";
import { getReviewPreviewText } from "@/src/lib/utils/editor";

type SortType = ReviewSortType;
type SearchField = ReviewListSearchField;

export interface ReviewListInitialData {
  reviews: ReviewListItemDto[];
  sort: SortType;
  searchField: SearchField;
  q: string;
  releaseType: AlbumReleaseType;
  page: number;
  totalPages: number;
}

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: "artist", label: "아티스트명" },
  { value: "album", label: "앨범명" },
  { value: "author", label: "작성자명" },
];

function parseSort(value: string | null): SortType {
  return value === "likes" || value === "comments" ? value : "latest";
}

function parseSearchField(value: string | null): SearchField {
  return value === "album" || value === "author" ? value : "artist";
}

export function ReviewListClient({
  initialData,
}: {
  initialData?: ReviewListInitialData;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const sortFromUrl = parseSort(searchParams.get("sort"));
  const searchFieldFromUrl = parseSearchField(
    searchParams.get("searchField")
  );
  const searchQueryFromUrl = (searchParams.get("q") ?? "").trim();
  const releaseTypeFromUrl = parseAlbumReleaseType(
    searchParams.get("releaseType")
  );

  const [reviews, setReviews] = useState<ReviewListItemDto[]>(
    initialData?.reviews ?? []
  );
  const [sort, setSort] = useState<SortType>(initialData?.sort ?? sortFromUrl);
  const [page, setPage] = useState(initialData?.page ?? pageFromUrl);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSortExpanded, setIsSortExpanded] = useState(false);
  const [searchField, setSearchField] = useState<SearchField>(searchFieldFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);
  const [releaseType, setReleaseType] = useState<AlbumReleaseType>(
    initialData?.releaseType ?? releaseTypeFromUrl
  );

  const syncFromUrl = useCallback(() => {
    const nextPage = Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || 1
    );
    const nextSort = parseSort(searchParams.get("sort"));
    const field = parseSearchField(searchParams.get("searchField"));
    const query = (searchParams.get("q") ?? "").trim();
    const nextReleaseType = parseAlbumReleaseType(
      searchParams.get("releaseType")
    );
    setPage(nextPage);
    setSort(nextSort);
    setSearchField(field);
    setSearchQuery(query);
    setReleaseType(nextReleaseType);
  }, [searchParams]);

  const buildReviewsHref = useCallback(
    (nextSort: SortType, nextPage: number, field: SearchField, query: string, nextReleaseType: AlbumReleaseType) => {
      const params = new URLSearchParams({
        sort: nextSort,
        page: String(nextPage),
      });
      if (query.trim()) {
        params.set("searchField", field);
        params.set("q", query.trim());
      }
      if (nextReleaseType === "single") {
        params.set("releaseType", "single");
      }
      return `/reviews?${params.toString()}`;
    },
    []
  );

  const removeSearch = useCallback(() => {
    router.push(buildReviewsHref(sort, 1, searchField, "", releaseType));
    setIsSearchModalOpen(false);
  }, [buildReviewsHref, releaseType, router, searchField, sort]);

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildReviewsHref(sort, 1, searchField, searchQuery, releaseType));
    setIsSearchModalOpen(false);
  }

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    if (
      initialData &&
      initialData.page === pageFromUrl &&
      initialData.sort === sortFromUrl &&
      initialData.searchField === searchFieldFromUrl &&
      initialData.q === searchQueryFromUrl &&
      initialData.releaseType === releaseTypeFromUrl
    ) {
      setReviews(initialData.reviews);
      setTotalPages(initialData.totalPages);
      setPage(initialData.page);
      setError(null);
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();

    async function loadReviews() {
      try {
        setIsLoading(true);
        setError(null);
        const currentPage = Math.max(
          1,
          parseInt(searchParams.get("page") ?? "1", 10) || 1
        );
        const currentSort = parseSort(searchParams.get("sort"));
        const currentSearchField = parseSearchField(
          searchParams.get("searchField")
        );
        const currentSearchQuery = (searchParams.get("q") ?? "").trim();
        const currentReleaseType = parseAlbumReleaseType(
          searchParams.get("releaseType")
        );

        const data = await fetchReviewList(
          {
            sort: currentSort,
            page: currentPage,
            searchField: currentSearchField,
            q: currentSearchQuery,
            releaseType: currentReleaseType,
          },
          controller.signal
        );

        setReviews(data.reviews ?? []);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
        setPage(data.page ?? 1);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          getApiErrorMessage(
            loadError,
            "리뷰를 불러오는 중 오류가 발생했습니다."
          )
        );
        setReviews([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadReviews();
    return () => {
      controller.abort();
    };
  }, [
    searchParams,
    initialData,
    pageFromUrl,
    sortFromUrl,
    searchFieldFromUrl,
    searchQueryFromUrl,
    releaseTypeFromUrl,
  ]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-4 pb-10 pt-[61px] sm:px-6">
      <div className={REVIEW_LIST_CONTENT_CLASS}>
        <section className="flex flex-col gap-[28px]">
          <div className="flex flex-wrap items-end gap-x-8 gap-y-2">
            <h1 className={`${REVIEW_PAGE_TITLE_CLASS} shrink-0`}>앨범 리뷰</h1>
            <ReviewReleaseTypeToggle
              value={releaseType}
              buildHref={(nextReleaseType) =>
                buildReviewsHref(sort, 1, searchField, searchQuery, nextReleaseType)
              }
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <ReviewSortToggle
              sort={sort}
              expanded={isSortExpanded}
              onExpandedChange={setIsSortExpanded}
              buildHref={(nextSort) =>
                buildReviewsHref(nextSort, 1, searchField, searchQuery, releaseType)
              }
            />
            <ReviewSearchButton onClick={() => setIsSearchModalOpen(true)} />
          </div>
        </section>

        {!!searchQuery && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
            <span className="rounded-full bg-zinc-100 px-2 py-1">
              {SEARCH_FIELD_OPTIONS.find((opt) => opt.value === searchField)?.label}:{" "}
              {searchQuery}
            </span>
            <button
              type="button"
              onClick={removeSearch}
              className="rounded-full border border-zinc-300 px-2 py-1 text-[11px] text-[var(--color-text-secondary)] hover:bg-zinc-100"
            >
              검색 해제
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="mt-5 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            리뷰를 불러오는 중...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
            {releaseType === "single"
              ? "아직 승인된 싱글 리뷰가 없습니다."
              : "아직 승인된 앨범 리뷰가 없습니다."}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-5">
            {reviews.map((review) => (
              <AlbumReviewPreviewCard
                key={review.id}
                href={`${reviewDetail(review.id)}?from=reviews&sort=${sort}&page=${page}&searchField=${searchField}&q=${encodeURIComponent(searchQuery)}${releaseType === "single" ? "&releaseType=single" : ""}`}
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
              buildHref={(nextPage) =>
                buildReviewsHref(sort, nextPage, searchField, searchQuery, releaseType)
              }
            />
          </div>
        )}
      </div>

      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
              리뷰 검색
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
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
                        : "bg-zinc-100 text-[var(--color-text-primary)] hover:bg-zinc-200"
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
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-100"
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
