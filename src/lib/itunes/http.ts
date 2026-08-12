/** iTunes API HTTP 호출 */

const ITUNES_BASE = "https://itunes.apple.com";

const ITUNES_FETCH_OPTIONS = {
  headers: { Accept: "application/json" as const },
  cache: "no-store" as const,
};

export type ItunesResult = Record<string, unknown>;

interface LookupParams {
  entity?: string;
  limit?: number;
}

export function getLargeImageUrl(artworkUrl100: string | undefined): string | null {
  if (!artworkUrl100) return null;
  // http://isN.mzstatic.com → https://isN-ssl.mzstatic.com (mixed content·호스트 통일)
  const httpsUrl = artworkUrl100
    .replace(/^http:\/\//i, "https://")
    .replace(
      /^https:\/\/is(\d+)\.mzstatic\.com/i,
      "https://is$1-ssl.mzstatic.com"
    );
  return httpsUrl.replace(/100x100bb\.jpg$/i, "600x600bb.jpg");
}

export function itunesLookupUrls(
  id: number | string,
  { entity = "album", limit = 1 }: LookupParams = {}
): string[] {
  const query = `id=${id}&entity=${entity}&limit=${limit}`;
  return [`${ITUNES_BASE}/lookup?${query}&country=KR&lang=ko_kr`, `${ITUNES_BASE}/lookup?${query}`];
}

export function itunesArtistSearchUrls(term: string, limit: number): string[] {
  const query = `term=${encodeURIComponent(term)}&media=music&entity=musicArtist&limit=${limit}`;
  return [`${ITUNES_BASE}/search?${query}&country=KR&lang=ko_kr`, `${ITUNES_BASE}/search?${query}`];
}

export async function fetchItunesResults(url: string): Promise<ItunesResult[]> {
  try {
    const response = await fetch(url, ITUNES_FETCH_OPTIONS);
    if (!response.ok) return [];
    const data = (await response.json()) as { results?: ItunesResult[] };
    return data.results ?? [];
  } catch {
    return [];
  }
}
