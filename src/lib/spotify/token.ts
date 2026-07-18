/** Spotify Client Credentials 토큰 */

import { createTtlCache } from "@/src/lib/utils/ttl-cache";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const tokenCache = createTtlCache<string>(55 * 60 * 1000);

export async function getSpotifyAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const cached = tokenCache.get("token");
  if (cached) return cached;

  try {
    const body = new URLSearchParams({ grant_type: "client_credentials" });
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { access_token?: string };
    const token = data.access_token?.trim();
    if (!token) return null;

    tokenCache.set("token", token);
    return token;
  } catch {
    return null;
  }
}
