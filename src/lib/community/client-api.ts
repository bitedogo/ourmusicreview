/** 커뮤니티 게시글 API 클라이언트 */

import type { NoticeCategory } from "@/src/lib/community/types";
import { fetchJson } from "@/src/lib/http/client";

export type CommunityPostCategory = "K" | "I" | "M" | "W" | "N";

export interface CommunityPostDto {
  id: string;
  title: string;
  content: string;
  category: CommunityPostCategory;
  noticeCategory?: NoticeCategory | null;
  isGlobal?: "Y" | "N";
}

export interface SaveCommunityPostInput {
  title: string;
  content: string;
  category: CommunityPostCategory;
  isGlobal?: boolean;
  isRelease?: boolean;
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
  return fetchJson<{ ok: true }>(
    `/api/posts/${encodeURIComponent(postId)}/view`,
    { method: "POST" }
  );
}

export async function uploadCommunityAudio(file: File) {
  const formData = new FormData();
  formData.append("audioFile", file);
  return fetchJson<{ ok: true; data: { url: string } }>("/api/upload/audio", {
    method: "POST",
    body: formData,
  });
}
