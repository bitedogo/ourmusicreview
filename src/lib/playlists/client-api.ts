/** 플레이리스트 API 클라이언트 */

import type { GenreTreeNode } from "@/src/lib/genres/types";
import { fetchJson } from "@/src/lib/http/client";

export interface PlaylistGenreDto {
  id: string;
  nameKo: string;
  nameEn: string;
  parentId: string | null;
}

export interface PlaylistListItemDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  trackCount: number;
  likeCount: number;
  commentCount: number;
  genres?: PlaylistGenreDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistTrackDto {
  id: string;
  trackId: string;
  trackName: string;
  artistName: string;
  collectionId: string | null;
  collectionName: string | null;
  artworkUrl100: string | null;
  previewUrl: string | null;
  trackNumber: number | null;
  discNumber: number | null;
  durationMs: number | null;
  position: number;
  createdAt: string;
}

export interface PlaylistDetailDto extends PlaylistListItemDto {
  ownerNickname: string;
  tracks: PlaylistTrackDto[];
}

export interface PublicPlaylistListItemDto extends PlaylistListItemDto {
  ownerNickname: string;
}

export interface PublicPlaylistListResult {
  ok: boolean;
  playlists: PublicPlaylistListItemDto[];
  page: number;
  totalPages: number;
  total?: number;
}

export interface AddPlaylistTrackInput {
  trackId: string;
  trackName: string;
  artistName: string;
  collectionId?: string | null;
  collectionName?: string | null;
  artworkUrl100?: string | null;
  previewUrl?: string | null;
  trackNumber?: number | null;
  discNumber?: number | null;
  durationMs?: number | null;
}

export async function fetchMyPlaylists() {
  return fetchJson<{ ok: boolean; data: { playlists: PlaylistListItemDto[] } }>(
    "/api/playlists"
  );
}

export async function fetchPublicPlaylistsList(params: {
  page?: number;
  searchField?: "title" | "author";
  q?: string;
  genre?: string;
  signal?: AbortSignal;
}) {
  const search = new URLSearchParams({
    page: String(Math.max(1, params.page ?? 1)),
  });
  const query = params.q?.trim() ?? "";
  if (query) {
    search.set("searchField", params.searchField ?? "title");
    search.set("q", query);
  }
  if (params.genre?.trim()) {
    search.set("genre", params.genre.trim());
  }
  return fetchJson<PublicPlaylistListResult>(
    `/api/playlists/list?${search}`,
    { signal: params.signal }
  );
}

export async function fetchGenreTree(signal?: AbortSignal) {
  return fetchJson<{ ok: boolean; genres: GenreTreeNode[] }>("/api/genres", {
    signal,
  });
}

export async function createPlaylistApi(input: {
  title: string;
  description?: string;
  isPublic?: boolean;
  coverImageUrl?: string | null;
  genreIds?: string[];
}) {
  return fetchJson<{ ok: boolean; data: { playlist: PlaylistListItemDto } }>(
    "/api/playlists",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
}

export async function updatePlaylistApi(
  playlistId: string,
  input: {
    title?: string;
    description?: string | null;
    isPublic?: boolean;
    coverImageUrl?: string | null;
    genreIds?: string[];
  }
) {
  return fetchJson<{ ok: boolean; data: { playlist: PlaylistListItemDto } }>(
    `/api/playlists/${encodeURIComponent(playlistId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
}

export async function deletePlaylistApi(playlistId: string) {
  return fetchJson<{ ok: boolean }>(
    `/api/playlists/${encodeURIComponent(playlistId)}`,
    { method: "DELETE" }
  );
}

export async function fetchPublicPlaylistsByUser(userId: string) {
  return fetchJson<{ ok: boolean; data: { playlists: PlaylistListItemDto[] } }>(
    `/api/users/${encodeURIComponent(userId)}/playlists`
  );
}

export async function fetchPlaylistDetail(playlistId: string) {
  return fetchJson<{ ok: boolean; data: { playlist: PlaylistDetailDto } }>(
    `/api/playlists/${encodeURIComponent(playlistId)}`
  );
}

export async function uploadPlaylistCoverApi(coverFile: File) {
  const formData = new FormData();
  formData.append("coverImage", coverFile);
  return fetchJson<{ ok: boolean; data: { coverImageUrl: string } }>(
    "/api/playlists/cover-upload",
    { method: "POST", body: formData }
  );
}

export async function updatePlaylistCoverApi(
  playlistId: string,
  coverFile: File
) {
  const formData = new FormData();
  formData.append("coverImage", coverFile);
  return fetchJson<{ ok: boolean; data: { playlist: PlaylistDetailDto } }>(
    `/api/playlists/${encodeURIComponent(playlistId)}/cover`,
    { method: "POST", body: formData }
  );
}

export async function addTrackToPlaylistApi(
  playlistId: string,
  input: AddPlaylistTrackInput
) {
  return fetchJson<{
    ok: boolean;
    data: { playlistTrackId: string; created: boolean };
  }>(`/api/playlists/${encodeURIComponent(playlistId)}/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function removeTrackFromPlaylistApi(
  playlistId: string,
  playlistTrackId: string
) {
  return fetchJson<{ ok: boolean }>(
    `/api/playlists/${encodeURIComponent(playlistId)}/tracks/${encodeURIComponent(playlistTrackId)}`,
    { method: "DELETE" }
  );
}

export async function reorderPlaylistTracksApi(
  playlistId: string,
  order: string[]
) {
  return fetchJson<{ ok: boolean }>(
    `/api/playlists/${encodeURIComponent(playlistId)}/tracks`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    }
  );
}
