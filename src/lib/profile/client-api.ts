/** 프로필 콘텐츠 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";

export async function fetchActivityStats() {
  return fetchJson<{
    ok: true;
    data: {
      postCount: number;
      commentCount: number;
      likedPostCount: number;
    };
  }>("/api/profile/activity-stats");
}
