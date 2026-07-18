/** Spotify Web API 클라이언트 */

import { getSpotifyAccessToken } from "./token";

const API_BASE = "https://api.spotify.com/v1";

export async function spotifyFetch<T>(path: string, attempt = 0): Promise<T | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429 && attempt < 1) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
    if (retryAfter > 0 && retryAfter <= 3) {
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
    }
    return spotifyFetch(path, attempt + 1);
  }

  if (!response.ok) return null;
  return (await response.json()) as T;
}
