"use client";
/** 플레이리스트 API 클라이언트 유틸 */

import { fetchJson } from "@/src/lib/http/client";

export interface PlaylistListItemDto {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  trackCount: number;
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
  tracks: PlaylistTrackDto[];
}

export async function fetchMyPlaylists() {
  return fetchJson<{ ok: boolean; data: { playlists: PlaylistListItemDto[] } }>(
    "/api/playlists"
  );
}

export async function createPlaylistApi(input: {
  title: string;
  description?: string;
  isPublic?: boolean;
  coverImageUrl?: string | null;
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

export async function addTrackToPlaylistApi(
  playlistId: string,
  input: {
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
) {
  return fetchJson<{ ok: boolean; data: { playlistTrackId: string } }>(
    `/api/playlists/${encodeURIComponent(playlistId)}/tracks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );
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
