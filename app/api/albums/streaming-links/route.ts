import { getBatchAlbumStreamingLinks } from "@/src/lib/streaming/fetch-links";
import { hasAnyStreamingLink } from "@/src/lib/streaming/types";
import { apiError, apiOk } from "@/src/lib/http/response";

function parseAlbumIds(raw: string | null): string[] {
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
    const albumIds = parseAlbumIds(searchParams.get("ids"));

    if (albumIds.length === 0) {
      return apiError("조회할 앨범 ID가 필요합니다.", { status: 400 });
    }

    const linksByAlbumId = await getBatchAlbumStreamingLinks(albumIds);
    const links: Record<string, (typeof linksByAlbumId)[string]> = {};

    for (const albumId of albumIds) {
      const albumLinks = linksByAlbumId[albumId] ?? {};
      if (hasAnyStreamingLink(albumLinks)) {
        links[albumId] = albumLinks;
      }
    }

    return apiOk({ links });
  } catch {
    return apiError("스트리밍 링크 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
