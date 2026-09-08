/** Spotify Web API 클라이언트 */

import { getSpotifyAccessToken } from "./token";
import { fetchExternalJson } from "@/src/lib/http/external";

const API_BASE = "https://api.spotify.com/v1";

export async function spotifyFetch<T>(path: string): Promise<T | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  try {
    return await fetchExternalJson<T>(
      `${API_BASE}${path}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
      { provider: "spotify", timeoutMs: 5000, retries: 1 }
    );
  } catch (error) {
    console.warn("[spotify] request failed", error);
    return null;
  }
}
