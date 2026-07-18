/** 아티스트 검색 자동완성 제안 */

import Image from "next/image";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";

export const DEFAULT_ARTIST_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23e4e4e7' width='40' height='40'/%3E%3Cpath fill='%23a1a1aa' d='M20 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 2c-5 0-8 2.5-8 5v5h16v-5c0-2.5-3-5-8-5z'/%3E%3C/svg%3E";

interface ArtistSearchSuggestionsProps {
  suggestions: ItunesArtistResult[];
  isLoading: boolean;
  onSelect: (artist: ItunesArtistResult) => void;
}

export function ArtistSearchSuggestions({
  suggestions,
  isLoading,
  onSelect,
}: ArtistSearchSuggestionsProps) {
  if (isLoading) {
    return <li className="px-4 py-3 text-sm text-zinc-500">검색 중...</li>;
  }

  return (
    <>
      {suggestions.map((artist) => (
        <li
          key={artist.artistId}
          role="option"
          aria-selected="false"
          className="border-b border-zinc-100 last:border-b-0"
        >
          <button
            type="button"
            onClick={() => onSelect(artist)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
          >
            <Image
              src={artist.artworkUrl100 ?? DEFAULT_ARTIST_AVATAR}
              alt={`${artist.artistName} 프로필`}
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200 object-cover"
            />
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-sm font-medium text-black">{artist.artistName}</div>
              {artist.primaryGenreName && (
                <div className="truncate text-xs text-zinc-400">{artist.primaryGenreName}</div>
              )}
            </div>
          </button>
        </li>
      ))}
    </>
  );
}
