/** GET 음원 차트 */

import { getMusicChart } from "@/src/lib/chart/fetch-chart";
import { getStorefront, isChartRegion } from "@/src/lib/chart/types";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionParam = searchParams.get("region");
    const region = isChartRegion(regionParam) ? regionParam : "kr";

    const albums = await getMusicChart(getStorefront(region));
    return apiOk({ albums });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "차트 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
