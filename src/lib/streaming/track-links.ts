/** 트랙 단위 스트리밍 듣기 검색 폴백 링크 */

import type { AlbumStreamingLinks } from "./types";

function buildQuery(artistName: string, trackName: string): string {
  return `${artistName} ${trackName}`.trim().replace(/\s+/g, " ");
}

/** 해석 실패 시 플랫폼 검색으로 보내는 링크 */
export function buildTrackStreamingLinks(
  artistName: string,
  trackName: string
): AlbumStreamingLinks {
  const query = buildQuery(artistName, trackName);
  if (!query) return {};

  const encoded = encodeURIComponent(query);

  return {
    appleMusic: `https://music.apple.com/kr/search?term=${encoded}`,
    spotify: `https://open.spotify.com/search/${encoded}`,
    deezer: `https://www.deezer.com/search/${encoded}`,
  };
}
