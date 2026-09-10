/** iTunes API HTTP 호출 */

import { z } from "zod";
import { ExternalHttpError, fetchExternalJson } from "@/src/lib/http/external";

const ITUNES_BASE = "https://itunes.apple.com";

const ITUNES_FETCH_OPTIONS = {
  headers: {
    Accept: "application/json" as const,
    // Next.js 서버 fetch가 브라우저 UA를 넘기면 iTunes가 403을 준다
    "User-Agent": "ORU/1.0",
  },
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

export function isItunesKrUrl(url: string): boolean {
  return /[?&]country=KR\b/i.test(url);
}

export function itunesArtistSearchUrls(term: string, limit: number): string[] {
  const query = `term=${encodeURIComponent(term)}&media=music&entity=musicArtist&limit=${limit}`;
  return [`${ITUNES_BASE}/search?${query}&country=KR&lang=ko_kr`, `${ITUNES_BASE}/search?${query}`];
}

/** 곡 인기 순 신호. KR 카탈로그는 해외 아티스트 곡이 비는 경우가 있어 기본(US)을 먼저 */
export function itunesSongSearchUrls(term: string, limit: number): string[] {
  const query = `term=${encodeURIComponent(term)}&media=music&entity=song&limit=${limit}`;
  return [`${ITUNES_BASE}/search?${query}`, `${ITUNES_BASE}/search?${query}&country=KR&lang=ko_kr`];
}

/** KR에 없는 앨범 ID의 곡을 US/GB에서 찾기 */
export function itunesSongLookupFallbackUrls(id: number | string, limit: number): string[] {
  const query = `id=${id}&entity=song&limit=${limit}`;
  return [
    `${ITUNES_BASE}/lookup?${query}`,
    `${ITUNES_BASE}/lookup?${query}&country=GB`,
  ];
}

/** 제목+아티스트로 미국·영국 앨범 검색 (KR 전용 ID 폴백) */
export function itunesAlbumNameSearchUrls(term: string, limit: number): string[] {
  const query = `term=${encodeURIComponent(term)}&media=music&entity=album&limit=${limit}`;
  return [
    `${ITUNES_BASE}/search?${query}`,
    `${ITUNES_BASE}/search?${query}&country=GB`,
  ];
}

/** 앨범 인기 순 신호. artistTerm을 우선하고, 비면 일반 앨범 검색 */
export function itunesAlbumSearchUrls(term: string, limit: number): string[] {
  const encoded = encodeURIComponent(term);
  const base = `term=${encoded}&media=music&entity=album&limit=${limit}`;
  return [
    `${ITUNES_BASE}/search?${base}&attribute=artistTerm`,
    `${ITUNES_BASE}/search?${base}`,
    `${ITUNES_BASE}/search?${base}&attribute=artistTerm&country=KR&lang=ko_kr`,
    `${ITUNES_BASE}/search?${base}&country=KR&lang=ko_kr`,
  ];
}

const ITUNES_COOLDOWN_MS: Record<number, number> = {
  429: 30_000,
  403: 60_000,
};

let itunesCooledDownUntil = 0;

export interface ItunesFetchOutcome {
  results: ItunesResult[];
  ok: boolean;
  throttled: boolean;
}

export function isItunesCoolingDown(now = Date.now()): boolean {
  return now < itunesCooledDownUntil;
}

export function resetItunesHttpStateForTests() {
  itunesCooledDownUntil = 0;
}

function markItunesThrottled(status: number, now = Date.now()) {
  const cooldownMs = ITUNES_COOLDOWN_MS[status];
  if (cooldownMs == null) return;
  itunesCooledDownUntil = Math.max(itunesCooledDownUntil, now + cooldownMs);
}

export async function fetchItunesOutcome(
  url: string,
  options?: { timeoutMs?: number },
): Promise<ItunesFetchOutcome> {
  if (isItunesCoolingDown()) {
    return { results: [], ok: false, throttled: true };
  }

  try {
    const data = await fetchExternalJson(
      url,
      ITUNES_FETCH_OPTIONS,
      {
        provider: "itunes",
        timeoutMs: options?.timeoutMs ?? 5000,
        retries: 1,
        schema: z.object({
          results: z.array(z.record(z.string(), z.unknown())).default([]),
        }),
      }
    );
    return { results: data.results, ok: true, throttled: false };
  } catch (error) {
    const status = error instanceof ExternalHttpError ? error.status : null;
    const throttled = status === 429 || status === 403;
    if (status != null) markItunesThrottled(status);
    console.warn("[itunes] request failed", error);
    return { results: [], ok: false, throttled };
  }
}

export async function fetchItunesResults(
  url: string,
  options?: { timeoutMs?: number },
): Promise<ItunesResult[]> {
  return (await fetchItunesOutcome(url, options)).results;
}
