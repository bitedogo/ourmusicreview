/** iTunes 앨범·아티스트 검색 */

import type { ItunesArtistResult, ItunesSearchAutocompleteResponse } from "./types";
import { ARTIST_SEARCH_MIN_CHARS } from "./search-config";

export {
  ARTIST_SEARCH_DEBOUNCE_MS,
  ARTIST_SEARCH_MIN_CHARS,
} from "./search-config";

export interface ArtistAutocompleteApiResponse {
  ok: boolean;
  data: ItunesSearchAutocompleteResponse;
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function fetchArtistAutocomplete(
  term: string,
  signal?: AbortSignal,
): Promise<{ results: ItunesArtistResult[]; throttled: boolean }> {
  const trimmed = term.trim();
  if (trimmed.length < ARTIST_SEARCH_MIN_CHARS) {
    return { results: [], throttled: false };
  }

  try {
    const response = await fetch(
      `/api/itunes/search-autocomplete?term=${encodeURIComponent(trimmed)}`,
      { signal },
    );
    const data = (await response.json().catch(() => null)) as ArtistAutocompleteApiResponse | null;

    if (data?.ok && Array.isArray(data.data?.results)) {
      return {
        results: data.data.results,
        throttled: Boolean(data.data.throttled),
      };
    }
  } catch (error) {
    if (isAbortError(error)) throw error;
    return { results: [], throttled: false };
  }

  return { results: [], throttled: false };
}

export function buildArtistSearchPath(
  artist: Pick<ItunesArtistResult, "artistId" | "artistName">
): string {
  return `/search?artistId=${artist.artistId}&artist=${encodeURIComponent(artist.artistName)}`;
}

export function buildTextSearchPath(query: string): string {
  return `/search?q=${encodeURIComponent(query.trim())}`;
}
