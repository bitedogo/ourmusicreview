"use client";
/** 공개 플레이리스트 탐색 — 추천 / 장르 / 목록 */

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import type { PublicPlaylistListItemDto } from "@/src/components/playlist/playlist-api";
import type { GenreTreeNode } from "@/src/components/playlist/genre-selector";
import { ReviewSearchButton } from "@/src/components/reviews/ReviewSearchButton";
import { playlistDetail, playlistList } from "@/src/lib/navigation/routes";
import {
  buildGenreCircles,
  getGenreCircleLabel,
  SPECIAL_GENRE_ALL,
  SPECIAL_GENRE_COMPREHENSIVE,
  withComprehensiveSubgenre,
} from "@/src/lib/genres/genre-covers";

type SearchField = "title" | "author";

const SEARCH_FIELD_OPTIONS: { value: SearchField; label: string }[] = [
  { value: "title", label: "플레이리스트명" },
  { value: "author", label: "작성자명" },
];

const GENRE_CIRCLE_TONES = [
  "from-[#C45C2A] to-[#8B3A18]",
  "from-[#2F6B7A] to-[#1A4450]",
  "from-[#6B4C7A] to-[#3D2A4A]",
  "from-[#4A6B4A] to-[#2A402A]",
  "from-[#7A5A2F] to-[#4A3518]",
  "from-[#5A5A6B] to-[#2E2E3A]",
] as const;

function genreTone(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % GENRE_CIRCLE_TONES.length;
  }
  return GENRE_CIRCLE_TONES[hash] ?? GENRE_CIRCLE_TONES[0];
}

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
  const genreFromUrl = (searchParams.get("genre") ?? "").trim();

  const [playlists, setPlaylists] = useState<PublicPlaylistListItemDto[]>([]);
  const [featured, setFeatured] = useState<PublicPlaylistListItemDto[]>([]);
  const [genreTree, setGenreTree] = useState<GenreTreeNode[]>([]);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchField, setSearchField] =
    useState<SearchField>(searchFieldFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const buildHref = useCallback(
    (nextPage: number, field: SearchField, query: string, genre: string) =>
      playlistList({
        page: nextPage,
        searchField: field,
        q: query,
        genre: genre || undefined,
      }),
    []
  );

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    router.push(buildHref(1, searchField, searchQuery, genreFromUrl));
    setIsSearchModalOpen(false);
  }

  function removeSearch() {
    setSearchQuery("");
    router.push(buildHref(1, searchField, "", genreFromUrl));
  }

  function selectGenre(genreId: string, options?: { sticky?: boolean }) {
    if (genreId === SPECIAL_GENRE_ALL) {
      router.push(buildHref(1, searchFieldFromUrl, searchQueryFromUrl, ""));
      return;
    }
    if (options?.sticky) {
      if (genreFromUrl === genreId) return;
      router.push(
        buildHref(1, searchFieldFromUrl, searchQueryFromUrl, genreId)
      );
      return;
    }
    const next = genreFromUrl === genreId ? "" : genreId;
    router.push(buildHref(1, searchFieldFromUrl, searchQueryFromUrl, next));
  }

  useEffect(() => {
    setPage(pageFromUrl);
    setSearchField(searchFieldFromUrl);
    setSearchQuery(searchQueryFromUrl);
  }, [pageFromUrl, searchFieldFromUrl, searchQueryFromUrl]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenres() {
      try {
        const response = await fetch("/api/genres", {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (response.ok && data?.ok) {
          setGenreTree(data.genres ?? []);
        }
      } catch {
        // ignore
      }
    }

    void loadGenres();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeatured() {
      try {
        const response = await fetch("/api/playlists/list?page=1", {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => null);
        if (response.ok && data?.ok) {
          setFeatured((data.playlists ?? []).slice(0, 5));
          setFeaturedIndex(0);
        }
      } catch {
        // ignore
      }
    }

    void loadFeatured();
    return () => controller.abort();
  }, []);

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
        const currentGenre = (searchParams.get("genre") ?? "").trim();
        const params = new URLSearchParams({ page: String(currentPage) });
        if (currentQuery) {
          params.set("searchField", currentField);
          params.set("q", currentQuery);
        }
        if (currentGenre) {
          params.set("genre", currentGenre);
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
        setTotal(data.total ?? 0);
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

  const activeRoot = genreTree.find((g) => g.id === genreFromUrl);
  const activeChildParent = genreTree.find((g) =>
    g.children.some((c) => c.id === genreFromUrl)
  );
  const filterParent = activeRoot ?? activeChildParent ?? null;
  const childOptions = filterParent
    ? withComprehensiveSubgenre(filterParent)
    : [];

  const selectedGenreLabel = useMemo(() => {
    if (!genreFromUrl || genreFromUrl === SPECIAL_GENRE_ALL) return null;
    const circleLabel = getGenreCircleLabel(genreFromUrl);
    if (circleLabel) return circleLabel;
    if (activeRoot) return getGenreCircleLabel(activeRoot.id) ?? activeRoot.nameKo;
    for (const root of genreTree) {
      const child = root.children.find((c) => c.id === genreFromUrl);
      if (child) return child.nameKo;
    }
    return genreFromUrl;
  }, [genreFromUrl, activeRoot, genreTree]);

  const genreCircles = useMemo(
    () => buildGenreCircles(genreTree),
    [genreTree]
  );

  const isAllActive =
    !genreFromUrl || genreFromUrl === SPECIAL_GENRE_ALL;

  const featuredPlaylist =
    featured.length > 0
      ? featured[Math.min(featuredIndex, featured.length - 1)]
      : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col bg-[#F7F7F8] px-4 pb-14 pt-[72px] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-zinc-900">
          플레이리스트
        </h1>
        <ReviewSearchButton onClick={() => setIsSearchModalOpen(true)} />
      </div>

      {/* 1. 추천 플레이리스트 */}
      <section className="mt-6">
        {featuredPlaylist ? (
          <Link
            href={playlistDetail(featuredPlaylist.id)}
            className="group relative block overflow-hidden rounded-[28px] bg-gradient-to-br from-[#C45C2A] via-[#B04A22] to-[#7A2E12] shadow-[0_18px_40px_rgba(140,50,20,0.28)] transition hover:brightness-[1.03]"
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
            <div className="relative flex min-h-[168px] items-stretch sm:min-h-[200px]">
              <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-center px-5 py-5 sm:px-7 sm:py-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80">
                  Recommended Playlist
                </p>
                <h2 className="mt-2 line-clamp-2 text-[22px] font-bold uppercase leading-tight tracking-wide text-white sm:text-[28px]">
                  {featuredPlaylist.title}
                </h2>
                <p className="mt-2 line-clamp-2 max-w-[240px] text-[12px] leading-relaxed text-white/85 sm:max-w-[280px] sm:text-[13px]">
                  {featuredPlaylist.description?.trim() ||
                    `${featuredPlaylist.ownerNickname}의 공개 플레이리스트`}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/90 sm:text-xs">
                  <span>{featuredPlaylist.trackCount}곡</span>
                  <span className="text-white/50">·</span>
                  <span>{featuredPlaylist.ownerNickname}</span>
                  {(featuredPlaylist.genres?.length ?? 0) > 0 ? (
                    <>
                      <span className="text-white/50">·</span>
                      <span className="line-clamp-1">
                        {featuredPlaylist.genres!
                          .slice(0, 2)
                          .map((g) => g.nameKo)
                          .join(", ")}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="relative w-[42%] shrink-0 sm:w-[46%]">
                {featuredPlaylist.coverImageUrl ? (
                  <Image
                    src={featuredPlaylist.coverImageUrl}
                    alt=""
                    fill
                    unoptimized
                    className="object-cover object-center opacity-95 transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-black/20" />
                )}
                <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#B04A22] to-transparent sm:w-24" />
                {featuredPlaylist.coverImageUrl ? (
                  <div className="absolute bottom-3 right-3 h-12 w-12 overflow-hidden rounded-lg border border-white/30 shadow-lg sm:h-14 sm:w-14">
                    <Image
                      src={featuredPlaylist.coverImageUrl}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex min-h-[168px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#C45C2A] to-[#7A2E12] px-6 text-sm text-white/80 shadow-[0_18px_40px_rgba(140,50,20,0.28)] sm:min-h-[200px]">
            아직 추천할 공개 플레이리스트가 없습니다.
          </div>
        )}

        {featured.length > 1 ? (
          <div className="mt-3 flex items-center justify-center gap-1.5">
            {featured.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`추천 ${index + 1}`}
                onClick={() => setFeaturedIndex(index)}
                className={`h-1.5 rounded-full transition ${
                  index === featuredIndex
                    ? "w-5 bg-[#C45C2A]"
                    : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* 2. 장르 원형 */}
      <section className="mt-9">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[20px] font-bold tracking-tight text-zinc-900">
            장르
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-8 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-5">
          {genreCircles.map((circle) => {
            const isActive =
              circle.id === SPECIAL_GENRE_ALL
                ? isAllActive
                : genreFromUrl === circle.id ||
                  (circle.kind === "genre" &&
                    genreTree
                      .find((g) => g.id === circle.id)
                      ?.children.some((c) => c.id === genreFromUrl) === true);
            return (
              <button
                key={circle.id}
                type="button"
                onClick={() => selectGenre(circle.id)}
                className="group flex w-full flex-col items-center gap-2"
              >
                <span
                  className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br ${genreTone(circle.id)} text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,0,0,0.12)] transition sm:text-lg ${
                    isActive
                      ? "ring-2 ring-[#C45C2A] ring-offset-2 ring-offset-[#F7F7F8]"
                      : "group-hover:scale-[1.03]"
                  }`}
                >
                  {circle.imageUrl ? (
                    <Image
                      src={circle.imageUrl}
                      alt={circle.label}
                      fill
                      sizes="(max-width: 640px) 11vw, 80px"
                      className="object-cover"
                    />
                  ) : (
                    circle.label.slice(0, 1)
                  )}
                </span>
                <span
                  className={`w-full truncate text-center text-[10px] font-medium sm:text-[12px] ${
                    isActive ? "text-zinc-900" : "text-zinc-600"
                  }`}
                >
                  {circle.label}
                </span>
              </button>
            );
          })}
        </div>

        {childOptions.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {childOptions.map((child) => {
              const isComprehensive = child.id === filterParent?.id;
              return (
                <button
                  key={
                    isComprehensive
                      ? `${child.id}-comprehensive`
                      : child.id
                  }
                  type="button"
                  onClick={() => selectGenre(child.id, { sticky: true })}
                  className={`rounded-full px-3 py-1 text-[11px] transition ${
                    genreFromUrl === child.id
                      ? "bg-zinc-900 text-white"
                      : "bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"
                  }`}
                >
                  {child.nameKo}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* 3. 플레이리스트 목록 */}
      <section className="mt-9">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold tracking-tight text-zinc-900">
              {selectedGenreLabel
                ? `${selectedGenreLabel} 플레이리스트`
                : "전체 플레이리스트"}
            </h2>
            {!isLoading && !error ? (
              <p className="mt-1 text-xs text-zinc-500">{total}개</p>
            ) : null}
          </div>
          {!!searchQueryFromUrl && (
            <button
              type="button"
              onClick={removeSearch}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              검색 해제
            </button>
          )}
        </div>

        {!!searchQueryFromUrl && (
          <p className="mt-2 text-xs text-zinc-500">
            {
              SEARCH_FIELD_OPTIONS.find(
                (opt) => opt.value === searchFieldFromUrl
              )?.label
            }
            : {searchQueryFromUrl}
          </p>
        )}

        <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {isLoading ? (
            <div className="px-4 py-14 text-center text-sm text-zinc-500">
              플레이리스트를 불러오는 중...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : playlists.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-zinc-500">
              {searchQueryFromUrl || genreFromUrl
                ? "조건에 맞는 플레이리스트가 없습니다."
                : "공개된 플레이리스트가 없습니다."}
            </div>
          ) : (
            <ul>
              {playlists.map((item, index) => (
                <li key={item.id}>
                  <Link
                    href={playlistDetail(item.id)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-zinc-50 ${
                      index > 0 ? "border-t border-zinc-100" : ""
                    }`}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                      {item.coverImageUrl ? (
                        <Image
                          src={item.coverImageUrl}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] text-zinc-400">
                          Cover
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <h3 className="truncate text-[14px] font-semibold text-zinc-900">
                          {item.title}
                        </h3>
                        <span className="truncate text-[12px] text-zinc-400">
                          {item.ownerNickname}
                        </span>
                      </div>
                      {(item.genres?.length ?? 0) > 0 ? (
                        <p className="mt-0.5 truncate text-[11px] text-zinc-400">
                          {item.genres!.map((g) => g.nameKo).join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    <span className="shrink-0 text-[12px] tabular-nums text-zinc-400">
                      {item.trackCount}곡
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!isLoading && !error && totalPages > 1 ? (
          <div className="flex justify-center pt-5">
            <PaginationNav
              currentPage={page}
              totalPages={totalPages}
              buildHref={(p) =>
                buildHref(
                  p,
                  searchFieldFromUrl,
                  searchQueryFromUrl,
                  genreFromUrl
                )
              }
            />
          </div>
        ) : null}
      </section>

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
