/** GET iTunes 곡 하나 (미리듣기 주소 갱신) */

import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import { enforceItunesProxyRateLimit } from "@/src/lib/itunes/api-rate-limit";
import { resolveSongSnapshot } from "@/src/lib/itunes/song-snapshot";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ trackId: string }> }
) {
  return handleApi("곡 정보를 불러오지 못했습니다.", async () => {
    await enforceItunesProxyRateLimit(request);
    const { trackId } = await params;
    if (!/^\d{1,20}$/.test(trackId)) {
      throw new ServiceError("곡 번호가 올바르지 않습니다.", 400);
    }

    return apiOk({ track: await resolveSongSnapshot(trackId) });
  });
}
