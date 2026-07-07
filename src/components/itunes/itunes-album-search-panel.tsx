"use client";

import Image from "next/image";
import type { SearchAlbumResult } from "@/src/lib/search/types";
import type { ItunesAlbumPickerState } from "@/src/hooks/use-itunes-album-picker";

interface ItunesAlbumSearchPanelProps {
  picker: ItunesAlbumPickerState;
  onAlbumSelect: (album: SearchAlbumResult) => void | Promise<void>;
  isSelecting?: boolean;
  error?: string | null;
  variant?: "modal" | "embedded";
  searchPlaceholder?: string;
}

export function ItunesAlbumSearchPanel({
  picker,
  onAlbumSelect,
  isSelecting = false,
  error = null,
  variant = "modal",
  searchPlaceholder = "아티스트 검색",
}: ItunesAlbumSearchPanelProps) {
  const displayError = error ?? picker.error;
  const isEmbedded = variant === "embedded";

  if (isEmbedded) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-zinc-600">앨범 검색</label>
        <p className="mb-2 text-[11px] text-zinc-500">
          아티스트를 검색한 뒤 선택하고, 앨범을 골라 등록하세요.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={picker.searchQuery}
            onChange={(event) => picker.setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void picker.searchArtists();
              }
            }}
            placeholder="아티스트 이름으로 검색"
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
          />
          <button
            type="button"
            onClick={() => void picker.searchArtists()}
            disabled={picker.isSearchingArtists}
            className="rounded-lg border border-zinc-200 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {picker.isSearchingArtists ? "검색 중..." : "검색"}
          </button>
        </div>

        {displayError && <p className="mt-2 text-xs text-red-600">{displayError}</p>}

        {!picker.selectedArtist && picker.artists.length > 0 && (
          <div className="mt-3 max-h-40 overflow-auto rounded-lg border border-zinc-200">
            {picker.artists.map((artist) => (
              <button
                key={artist.artistId}
                type="button"
                onClick={() => void picker.selectArtist(artist)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-zinc-50"
              >
                <span className="truncate text-xs font-semibold text-zinc-900">
                  {artist.artistName}
                </span>
                {artist.primaryGenreName && (
                  <span className="shrink-0 text-[11px] text-zinc-500">
                    {artist.primaryGenreName}
                  </span>
                )}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-zinc-400">
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </div>
        )}

        {picker.selectedArtist && (
          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={picker.backToArtists}
                className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                아티스트 목록으로
              </button>
              <span className="text-xs font-semibold text-zinc-700">
                {picker.selectedArtist.artistName}의 앨범
              </span>
            </div>
            {picker.isLoadingAlbums ? (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
                앨범 목록을 불러오는 중...
              </div>
            ) : picker.albums.length > 0 ? (
              <div className="max-h-48 overflow-auto rounded-lg border border-zinc-200">
                {picker.albums.map((album) => (
                  <button
                    key={album.collectionId}
                    type="button"
                    onClick={() => void onAlbumSelect(album)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {album.imageUrl600 ? (
                        <Image
                          src={album.imageUrl600}
                          alt={album.collectionName}
                          width={40}
                          height={40}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-zinc-900">
                        {album.collectionName}
                      </p>
                      <p className="truncate text-[11px] text-zinc-500">{album.artistName}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
                등록된 앨범이 없습니다.
              </div>
            )}
          </div>
        )}

        {!picker.isSearchingArtists &&
          !picker.selectedArtist &&
          picker.artists.length === 0 &&
          picker.searchQuery && (
            <p className="mt-2 text-xs text-zinc-500">검색 결과가 없습니다.</p>
          )}
      </div>
    );
  }

  return (
    <>
      <form onSubmit={picker.searchArtists} className="mt-4 flex gap-2">
        <input
          type="text"
          value={picker.searchQuery}
          onChange={(event) => picker.setSearchQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={picker.isSearchingArtists}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {picker.isSearchingArtists ? "검색 중..." : "검색"}
        </button>
      </form>

      {displayError && <p className="mt-2 text-sm text-red-600">{displayError}</p>}

      {!picker.selectedArtist && picker.artists.length > 0 && (
        <ul className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-zinc-200">
          {picker.artists.map((artist) => (
            <li key={artist.artistId}>
              <button
                type="button"
                onClick={() => void picker.selectArtist(artist)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50"
              >
                {artist.artistName}
                {artist.primaryGenreName ? ` · ${artist.primaryGenreName}` : ""}
              </button>
            </li>
          ))}
        </ul>
      )}

      {picker.selectedArtist && (
        <>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={picker.backToArtists}
              className="text-sm text-zinc-600 hover:underline"
            >
              ← 아티스트 다시 선택
            </button>
          </div>
          {picker.isLoadingAlbums ? (
            <p className="mt-2 text-sm text-zinc-500">앨범 목록 불러오는 중...</p>
          ) : picker.albums.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">앨범이 없습니다.</p>
          ) : (
            <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-zinc-200">
              {picker.albums.map((album) => (
                <li key={album.collectionId}>
                  <button
                    type="button"
                    disabled={isSelecting}
                    onClick={() => void onAlbumSelect(album)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-zinc-50 disabled:opacity-50"
                  >
                    {album.imageUrl600 ? (
                      <Image
                        src={album.imageUrl600}
                        alt={album.collectionName}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded bg-zinc-200" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{album.collectionName}</p>
                      <p className="truncate text-zinc-600">{album.artistName}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
