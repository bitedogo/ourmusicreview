/** HTTP 응답 캐시 헤더 유틸 */

import { NextResponse } from "next/server";

interface JsonOptions {
  status?: number;
}

function buildPublicCacheControl(maxAgeSeconds: number, swrSeconds: number): string {
  return `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}, stale-while-revalidate=${swrSeconds}`;
}

export function publicCachedJson<T>(
  payload: T,
  maxAgeSeconds: number,
  swrSeconds: number,
  options?: JsonOptions
) {
  return NextResponse.json(payload, {
    status: options?.status ?? 200,
    headers: {
      "Cache-Control": buildPublicCacheControl(maxAgeSeconds, swrSeconds),
    },
  });
}

export function noStoreJson<T>(payload: T, options?: JsonOptions) {
  return NextResponse.json(payload, {
    status: options?.status ?? 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
