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

export async function fetchMyProfilePosts() {
  return fetchJson<{ ok: true; data: { posts: unknown[] } }>(
    "/api/profile/posts"
  );
}

export async function fetchMyProfileComments() {
  return fetchJson<{ ok: true; data: { comments: unknown[] } }>(
    "/api/profile/comments"
  );
}

export async function fetchMyLikedPosts() {
  return fetchJson<{ ok: true; data: { posts: unknown[] } }>(
    "/api/profile/liked-posts"
  );
}
