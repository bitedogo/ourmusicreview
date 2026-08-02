"use client";
/** 공개 플레이리스트 목록 클라이언트 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import type { PublicPlaylistListItemDto } from "@/src/components/playlist/playlist-api";
import { ReviewSearchButton } from "@/src/components/reviews/ReviewSearchButton";
import {
  REVIEW_LIST_CONTENT_CLASS,
  REVIEW_PAGE_TITLE_CLASS,
} from "@/src/components/reviews/review-page-styles";
import { playlistDetail, playlistList } from "@/src/lib/navigation/routes";
import { getUserProfilePath } from "@/src/components/profile/profile-view-types";

type SearchField = "title" | "author";

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: "title", label: "플레이리스트명" },
  { value: "author", label: "작성자명" },
];

export function PlaylistListClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );
  const searchFieldFromUrl =
    (searchParams.get("searchField") as SearchField) || "title";
  const searchQueryFromUrl = (searchParams.get("q") ?? "").trim();

  const [playlists, setPlaylists] = useState<PublicPlaylistListItemDto[]>([]);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchField, setSearchField] =
    useState<SearchField>(searchFieldFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);

  const syncFromUrl = useCallback(() => {
    const p = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const field = (searchParams.get("searchField") as SearchField) || "title";
    const query = (searchParams.get("q") ?? "").trim();
    setPage(p);
    setSearchField(field);
    setSearchQuery(query);
  }, [searchParams]);

  const buildHref = useCallback(
    (nextPage: number, field: SearchField, query: string) =>
      playlistList({ page: nextPage, searchField: field, q: query }),
    []
  );

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildHref(1, searchField, searchQuery));
    setIsSearchModalOpen(false);
  }

  function removeSearch() {
    setSearchQuery("");
    router.push(buildHref(1, searchField, ""));
  }

  useEffect(() => {
    syncFromUrl();
  }, [syncFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);
        const currentPage = Math.max(
          1,
          parseInt(searchParams.get("page") ?? "1", 10) || 1
        );
        const currentField =
          (searchParams.get("searchField") as SearchField) || "title";
        const currentQuery = (searchParams.get("q") ?? "").trim();
        const params = new URLSearchParams({ page: String(currentPage) });
        if (currentQuery) {
          params.set("searchField", currentField);
          params.set("q", currentQuery);
        }
        const response = await fetch(`/api/playlists/list?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setError(data?.error ?? "플레이리스트를 불러오지 못했습니다.");
          setPlaylists([]);
          return;
        }

        setPlaylists(data.playlists ?? []);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
        setPage(data.page ?? 1);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : "플레이리스트를 불러오는 중 오류가 발생했습니다."
        );
        setPlaylists([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col px-4 pb-10 pt-[61px] sm:px-6">
      <div className={REVIEW_LIST_CONTENT_CLASS}>
        <section className="flex items-center justify-between gap-3">
          <h1 className={REVIEW_PAGE_TITLE_CLASS}>플레이리스트</h1>
          <ReviewSearchButton onClick={() => setIsSearchModalOpen(true)} />
        </section>

        {!!searchQueryFromUrl && (
          <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-2 py-1">
              {
                SEARCH_FIELD_OPTIONS.find(
                  (opt) => opt.value === searchFieldFromUrl
                )?.label
              }
              : {searchQueryFromUrl}
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
          <div className="mt-5 py-12 text-center text-sm text-zinc-500">
            플레이리스트를 불러오는 중...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </div>
        ) : playlists.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
            {searchQueryFromUrl
              ? "검색 결과가 없습니다."
              : "공개된 플레이리스트가 없습니다."}
          </div>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {playlists.map((item) => (
              <Link
                key={item.id}
                href={playlistDetail(item.id)}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-20 sm:w-20">
                  {item.coverImageUrl ? (
                    <Image
                      src={item.coverImageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                      No Cover
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold text-zinc-900 sm:text-base">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    {item.trackCount}곡 ·{" "}
                    <Link
                      href={getUserProfilePath(item.userId)}
                      onClick={(event) => event.stopPropagation()}
                      className="hover:text-[var(--color-brand-primary)] hover:underline"
                    >
                      {item.ownerNickname}
                    </Link>
                  </p>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-xs text-zinc-600">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && !error && (
          <div className="flex justify-center pt-4">
            <PaginationNav
              currentPage={page}
              totalPages={totalPages}
              buildHref={(p) =>
                buildHref(p, searchFieldFromUrl, searchQueryFromUrl)
              }
            />
          </div>
        )}
      </div>

      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-zinc-900">
              플레이리스트 검색
            </h2>
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
                  className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
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
