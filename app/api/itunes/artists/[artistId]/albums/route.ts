/** GET iTunes 아티스트 앨범 목록 */

import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiError, apiOk } from "@/src/lib/http/response";
import { enforceItunesProxyRateLimit } from "@/src/lib/itunes/api-rate-limit";
import {
  ARTIST_ALBUMS_LOOKUP_LIMIT,
  getArtistAlbums,
  getLargeImageUrl,
} from "@/src/lib/itunes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ artistId: string }> }
) {
  return handleApi("앨범 목록 조회 중 오류가 발생했습니다.", async () => {
    await enforceItunesProxyRateLimit(request);

    const { artistId } = await params;
    const trimmed = artistId?.trim() ?? "";
    const numericId = parseInt(trimmed, 10);

    if (!/^\d+$/.test(trimmed) || !Number.isFinite(numericId) || numericId <= 0) {
      return apiError("유효하지 않은 아티스트 ID입니다.", { status: 400 });
    }

    const itunesResults = await getArtistAlbums(numericId, ARTIST_ALBUMS_LOOKUP_LIMIT);
    const albums = itunesResults.map((album) => ({
      collectionId: String(album.collectionId),
      collectionName: album.collectionName,
      artistName: album.artistName,
      artworkUrl100: album.artworkUrl100,
      releaseDate: album.releaseDate,
      primaryGenreName: album.primaryGenreName,
      imageUrl600: getLargeImageUrl(album.artworkUrl100),
      releaseType: album.releaseType ?? "album",
      popularityScore: album.popularityScore ?? 0,
    }));

    return apiOk({ albums });
  });
}
