import { z } from "zod";
import { fetchExternalJson } from "@/src/lib/http/external";
import { looseMatch, normalizeForMatch } from "@/src/lib/text/match";
import type { AlbumStreamingLinks } from "./types";

const odesliSchema = z.object({
  linksByPlatform: z
    .record(z.string(), z.object({ url: z.string().optional() }))
    .optional(),
});

const deezerSchema = z.object({
  data: z
    .array(
      z.object({
        title: z.string().optional(),
        link: z.string().optional(),
        artist: z.object({ name: z.string().optional() }).optional(),
      })
    )
    .default([]),
});

export function pickStreamingUrl(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

export async function fetchOdesliPlatformLinks(
  url: string
): Promise<AlbumStreamingLinks> {
  try {
    const data = await fetchExternalJson(
      url,
      { headers: { Accept: "application/json" } },
      {
        provider: "odesli",
        timeoutMs: 5000,
        retries: 1,
        schema: odesliSchema,
      }
    );
    const platforms = data.linksByPlatform ?? {};
    return {
      appleMusic: pickStreamingUrl(
        platforms.appleMusic?.url ?? platforms.itunes?.url
      ),
      spotify: pickStreamingUrl(platforms.spotify?.url),
      youtubeMusic: pickStreamingUrl(platforms.youtubeMusic?.url),
      deezer: pickStreamingUrl(platforms.deezer?.url),
    };
  } catch (error) {
    console.warn("[odesli] request failed", error);
    return {};
  }
}

export async function searchDeezerUrl(options: {
  endpoint: string;
  artist: string;
  title: string;
}): Promise<string | undefined> {
  const query = `${options.artist} ${options.title}`.trim();
  if (!query) return undefined;
  try {
    const data = await fetchExternalJson(
      `${options.endpoint}?q=${encodeURIComponent(query)}&limit=10`,
      { headers: { Accept: "application/json" } },
      {
        provider: "deezer",
        timeoutMs: 5000,
        retries: 1,
        schema: deezerSchema,
      }
    );
    const targetArtist = normalizeForMatch(options.artist);
    const matched = data.data.find(
      (item) =>
        looseMatch(item.title ?? "", options.title) &&
        Boolean(targetArtist) &&
        looseMatch(item.artist?.name ?? "", options.artist)
    );
    return pickStreamingUrl(matched?.link);
  } catch (error) {
    console.warn("[deezer] request failed", error);
    return undefined;
  }
}
