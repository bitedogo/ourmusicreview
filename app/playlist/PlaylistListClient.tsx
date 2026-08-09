"use client";
/** 공개 플레이리스트 탐색 — 추천 / 장르 / 목록 */

import { PaginationNav } from "@/src/components/common/PaginationNav";
import { PlaylistCoverFlow } from "@/src/components/playlist/playlist-cover-flow";
import { PlaylistGenreCircles } from "@/src/components/playlist/playlist-genre-circles";
import {
  PlaylistListCard,
  PlaylistListCardGrid,
} from "@/src/components/playlist/playlist-list-card";
import {
  PLAYLIST_SEARCH_FIELD_OPTIONS,
  PlaylistSearchModal,
} from "@/src/components/playlist/playlist-search-modal";
import { ReviewSearchButton } from "@/src/components/reviews/ReviewSearchButton";
import { usePublicPlaylistList } from "@/src/hooks/use-public-playlist-list";
import { playlistDetail } from "@/src/lib/navigation/routes";

export function PlaylistListClient() {
  const {
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
  } = usePublicPlaylistList();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[832px] flex-col bg-white px-4 pb-14 pt-[72px] sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[var(--color-text-primary)]">
          플레이리스트
        </h1>
      </div>

      <section className="mt-6">
        <PlaylistCoverFlow
          playlists={featured}
          activeIndex={featuredIndex}
          onActiveIndexChange={setFeaturedIndex}
        />
      </section>

      <PlaylistGenreCircles
        circles={genreCircles}
        genreTree={genreTree}
        genreFromUrl={genreFromUrl}
        onSelect={selectGenre}
      />

      <section className="mt-9">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[20px] font-bold tracking-tight text-[var(--color-text-primary)]">
            {selectedGenreLabel
              ? `${selectedGenreLabel} 플레이리스트`
              : "전체 플레이리스트"}
          </h2>
          <div className="flex shrink-0 items-center gap-3">
            {!!searchQueryFromUrl && (
              <button
                type="button"
                onClick={removeSearch}
                className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              >
                검색 해제
              </button>
            )}
            <ReviewSearchButton onClick={() => setIsSearchModalOpen(true)} />
          </div>
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
                      : "bg-white text-[var(--color-text-secondary)] shadow-sm ring-1 ring-[#D9D9D9] hover:bg-zinc-50"
                  }`}
                >
                  {child.nameKo}
                </button>
              );
            })}
          </div>
        ) : null}

        {!!searchQueryFromUrl && (
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            {
              PLAYLIST_SEARCH_FIELD_OPTIONS.find(
                (opt) => opt.value === searchFieldFromUrl
              )?.label
            }
            : {searchQueryFromUrl}
          </p>
        )}

        <div className="mt-3">
          {isLoading ? (
            <div className="rounded-2xl bg-white px-4 py-14 text-center text-sm text-[var(--color-text-secondary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              플레이리스트를 불러오는 중...
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-red-600 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {error}
            </div>
          ) : playlists.length === 0 ? (
            <div className="rounded-2xl bg-white px-4 py-14 text-center text-sm text-[var(--color-text-secondary)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {searchQueryFromUrl || genreFromUrl
                ? "조건에 맞는 플레이리스트가 없습니다."
                : "공개된 플레이리스트가 없습니다."}
            </div>
          ) : (
            <PlaylistListCardGrid>
              {playlists.map((item) => (
                <li key={item.id}>
                  <PlaylistListCard
                    item={item}
                    href={playlistDetail(item.id)}
                    showOwner
                  />
                </li>
              ))}
            </PlaylistListCardGrid>
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

      {isSearchModalOpen ? (
        <PlaylistSearchModal
          searchField={searchField}
          searchQuery={searchQuery}
          onSearchFieldChange={setSearchField}
          onSearchQueryChange={setSearchQuery}
          onSubmit={applySearch}
          onClose={() => setIsSearchModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
