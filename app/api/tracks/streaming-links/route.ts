/** GET 트랙 스트리밍 재생 링크 */

import { getBatchTrackStreamingLinks } from "@/src/lib/streaming/fetch-track-links";
import { hasAnyStreamingLink } from "@/src/lib/streaming/types";
import { apiError, apiOk } from "@/src/lib/http/response";

function parseTrackIds(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^\d+$/.test(value))
    .slice(0, 50);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trackIds = parseTrackIds(searchParams.get("ids"));

    if (trackIds.length === 0) {
      return apiError("조회할 트랙 ID가 필요합니다.", { status: 400 });
    }

    const linksByTrackId = await getBatchTrackStreamingLinks(trackIds);
    const links: Record<string, (typeof linksByTrackId)[string]> = {};

    for (const trackId of trackIds) {
      const trackLinks = linksByTrackId[trackId] ?? {};
      if (hasAnyStreamingLink(trackLinks)) {
        links[trackId] = trackLinks;
      }
    }

    return apiOk({ links });
  } catch {
    return apiError("트랙 스트리밍 링크 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
