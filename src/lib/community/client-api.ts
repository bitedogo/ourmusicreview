/** 커뮤니티 게시글 API 클라이언트 */

import type { NoticeCategory } from "@/src/lib/community/types";
import type { PostCategory } from "@/src/lib/db/entities/Post";
import { fetchJson } from "@/src/lib/http/client";

export type CommunityPostCategory = PostCategory;

export interface CommunityPostDto {
  id: string;
  title: string;
  content: string;
  category: CommunityPostCategory;
  userId?: string;
  noticeCategory?: NoticeCategory | null;
  isGlobal?: "Y" | "N";
}

export interface SaveCommunityPostInput {
  title: string;
  content: string;
  category: CommunityPostCategory;
  isGlobal?: boolean;
  noticeCategory?: NoticeCategory;
}

export async function fetchCommunityPost(postId: string) {
  return fetchJson<{ ok: true; data: { post: CommunityPostDto } }>(
    `/api/community/posts/${encodeURIComponent(postId)}`
  );
}

export async function createCommunityPost(input: SaveCommunityPostInput) {
  return fetchJson<{ ok: true; data: { id: string } }>("/api/community/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function updateCommunityPost(
  postId: string,
  input: SaveCommunityPostInput
) {
  return fetchJson<{ ok: true; data: { id?: string } }>(
    `/api/community/posts/${encodeURIComponent(postId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
}

export async function deleteCommunityPost(postId: string) {
  return fetchJson<{ ok: true }>(
    `/api/community/posts/${encodeURIComponent(postId)}`,
    { method: "DELETE" }
  );
}

export async function incrementPostView(postId: string) {
  return fetchJson<{
    ok: true;
    data?: { skipped?: boolean };
  }>(`/api/posts/${encodeURIComponent(postId)}/view`, {
    method: "POST",
  });
}
