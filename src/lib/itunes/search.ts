/** iTunes 앨범·아티스트 검색 */

import type { ItunesArtistResult, ItunesSearchAutocompleteResponse } from "./types";

export const ARTIST_SEARCH_DEBOUNCE_MS = 300;

export interface ArtistAutocompleteApiResponse {
  ok: boolean;
  data: ItunesSearchAutocompleteResponse;
}

export async function fetchArtistAutocomplete(term: string): Promise<ItunesArtistResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  try {
    const response = await fetch(
      `/api/itunes/search-autocomplete?term=${encodeURIComponent(trimmed)}`
    );
    const data = (await response.json().catch(() => null)) as ArtistAutocompleteApiResponse | null;

    if (data?.ok && Array.isArray(data.data?.results)) {
      return data.data.results;
    }
  } catch {
    return [];
  }

  return [];
}

export function buildArtistSearchPath(
  artist: Pick<ItunesArtistResult, "artistId" | "artistName">
): string {
  return `/search?artistId=${artist.artistId}&artist=${encodeURIComponent(artist.artistName)}`;
}

export function buildTextSearchPath(query: string): string {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}
