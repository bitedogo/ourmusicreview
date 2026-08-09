"use client";
/** 공개 플레이리스트 목록 상태·URL 동기화 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { GenreTreeNode } from "@/src/lib/genres/types";
import {
  buildGenreCircles,
  getGenreCircleLabel,
  SPECIAL_GENRE_ALL,
  withComprehensiveSubgenre,
} from "@/src/lib/genres/genre-covers";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { playlistList } from "@/src/lib/navigation/routes";
import {
  fetchGenreTree,
  fetchPublicPlaylistsList,
  type PublicPlaylistListItemDto,
} from "@/src/lib/playlists/client-api";

export type PlaylistSearchField = "title" | "author";

export function usePublicPlaylistList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageFromUrl = Math.max(
    1,
    parseInt(searchParams.get("page") ?? "1", 10) || 1
  );
  const searchFieldFromUrl =
    (searchParams.get("searchField") as PlaylistSearchField) || "title";
  const searchQueryFromUrl = (searchParams.get("q") ?? "").trim();
  const genreFromUrl = (searchParams.get("genre") ?? "").trim();

  const [playlists, setPlaylists] = useState<PublicPlaylistListItemDto[]>([]);
  const [featured, setFeatured] = useState<PublicPlaylistListItemDto[]>([]);
  const [genreTree, setGenreTree] = useState<GenreTreeNode[]>([]);
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchField, setSearchField] =
    useState<PlaylistSearchField>(searchFieldFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchQueryFromUrl);
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const buildHref = useCallback(
    (
      nextPage: number,
      field: PlaylistSearchField,
      query: string,
      genre: string
    ) =>
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
        const response = await fetchGenreTree(controller.signal);
        setGenreTree(response.genres ?? []);
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
        const response = await fetchPublicPlaylistsList({
          page: 1,
          signal: controller.signal,
        });
        setFeatured((response.playlists ?? []).slice(0, 5));
        setFeaturedIndex(0);
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
          (searchParams.get("searchField") as PlaylistSearchField) || "title";
        const currentQuery = (searchParams.get("q") ?? "").trim();
        const currentGenre = (searchParams.get("genre") ?? "").trim();

        const response = await fetchPublicPlaylistsList({
          page: currentPage,
          searchField: currentField,
          q: currentQuery,
          genre: currentGenre,
          signal: controller.signal,
        });

        setPlaylists(response.playlists ?? []);
        setTotalPages(Math.max(1, response.totalPages ?? 1));
        setPage(response.page ?? 1);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(
          getApiErrorMessage(
            err,
            "플레이리스트를 불러오는 중 오류가 발생했습니다."
          )
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

  return {
    playlists,
    featured,
    featuredIndex,
    setFeaturedIndex,
    genreTree,
    genreCircles,
    page,
    totalPages,
    isLoading,
    error,
    isSearchModalOpen,
    setIsSearchModalOpen,
    searchField,
    setSearchField,
    searchQuery,
    setSearchQuery,
    searchFieldFromUrl,
    searchQueryFromUrl,
    genreFromUrl,
    filterParent,
    childOptions,
    selectedGenreLabel,
    buildHref,
    applySearch,
    removeSearch,
    selectGenre,
  };
}
