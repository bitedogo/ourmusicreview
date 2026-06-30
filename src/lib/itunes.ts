import type { AlbumDetail } from "@/src/lib/album/types";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import {
  fetchItunesResults,
  getLargeImageUrl,
  itunesArtistSearchUrls,
  itunesLookupUrls,
  type ItunesResult,
} from "@/src/lib/itunes/http";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";

export { getLargeImageUrl };

const ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;
const ARTIST_SEARCH_MAX_LIMIT = 25;

const artistSearchCache = createTtlCache<ItunesArtistResult[]>(ARTIST_CACHE_TTL_MS);
const artistArtworkCache = createTtlCache<string | null>(ARTIST_CACHE_TTL_MS);

export interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  collectionType?: string;
  trackCount?: number;
}

const ALBUM_TITLE_FILTER_KEYWORDS = [
  "LEAK",
  "FANMADE",
  "TRIBUTE",
  "COVER",
  "PARODY",
  "BOOTLEG",
  "UNOFFICIAL",
  "FAN MADE",
  "FAN-MADE",
  "- SINGLE",
  " - SINGLE",
  "INSTRUMENTAL",
  "REMASTERED",
];

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeName(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export async function getAlbumByCollectionId(
  collectionId: number
): Promise<AlbumDetail | null> {
  for (const url of itunesLookupUrls(collectionId)) {
    const results = await fetchItunesResults(url);
    const first = results[0];
    const id = asFiniteNumber(first?.collectionId);
    if (id !== collectionId || !first?.collectionName || !first?.artistName) continue;

    return {
      collectionId: String(id),
      artistId: asFiniteNumber(first.artistId) != null ? String(first.artistId) : null,
      title: String(first.collectionName),
      artist: String(first.artistName),
      imageUrl: getLargeImageUrl(asString(first.artworkUrl100)),
      releaseDate: asString(first.releaseDate)?.slice(0, 10) ?? "",
      genre: asString(first.primaryGenreName) ?? "",
    };
  }

  return null;
}

function isDisplayableItunesAlbum(album: iTunesAlbum): boolean {
  const trackCount = album.trackCount ?? 0;
  const collectionType = (album.collectionType ?? "").toLowerCase();
  if (trackCount < 2) return false;
  if (collectionType === "single" && trackCount < 5) return false;

  const title = (album.collectionName || "").toUpperCase();
  return !ALBUM_TITLE_FILTER_KEYWORDS.some((keyword) => title.includes(keyword));
}

function dedupeAlbumsByTitleArtist(albums: iTunesAlbum[]): iTunesAlbum[] {
  const seen = new Set<string>();
  return albums.filter((album) => {
    const key = `${normalizeName(album.collectionName)}_${normalizeName(album.artistName)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toItunesAlbum(item: ItunesResult): iTunesAlbum | null {
  const id = asFiniteNumber(item.collectionId);
  if (!id) return null;
  return {
    collectionId: id,
    collectionName: String(item.collectionName ?? ""),
    artistName: String(item.artistName ?? ""),
    artworkUrl100: String(item.artworkUrl100 ?? ""),
    releaseDate: String(item.releaseDate ?? ""),
    primaryGenreName: String(item.primaryGenreName ?? ""),
    collectionType: asString(item.collectionType),
    trackCount: asFiniteNumber(item.trackCount),
  };
}

export async function getArtistAlbums(
  artistId: number,
  limit: number = 50
): Promise<iTunesAlbum[]> {
  if (!Number.isFinite(artistId) || artistId <= 0) return [];

  const byId = new Map<number, iTunesAlbum>();
  for (const url of itunesLookupUrls(artistId, { limit })) {
    const results = await fetchItunesResults(url);
    for (const item of results) {
      if (item.wrapperType !== "collection") continue;
      const album = toItunesAlbum(item);
      if (album && !byId.has(album.collectionId)) {
        byId.set(album.collectionId, album);
      }
    }
  }

  const filtered = Array.from(byId.values()).filter(isDisplayableItunesAlbum);
  const deduped = dedupeAlbumsByTitleArtist(filtered);

  return deduped.sort((a, b) => {
    const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return timeB - timeA;
  });
}

async function fetchArtistArtworkUrl(
  artistId: number,
  artistName: string
): Promise<string | undefined> {
  if (!Number.isFinite(artistId) || artistId <= 0) return undefined;

  const cacheKey = String(artistId);
  const cached = artistArtworkCache.get(cacheKey);
  if (cached !== undefined) return cached ?? undefined;

  const normalizedName = artistName.trim().toLowerCase();

  for (const url of itunesLookupUrls(artistId, { limit: 10 })) {
    const results = await fetchItunesResults(url);
    const albums = results.filter(
      (item) =>
        item.wrapperType === "collection" &&
        typeof item.artworkUrl100 === "string" &&
        normalizeName(item.artistName) === normalizedName
    );

    const preferred =
      albums.find((item) => String(item.collectionType ?? "").toLowerCase() === "album") ??
      albums[0];
    const artwork = asString(preferred?.artworkUrl100);
    if (artwork) {
      artistArtworkCache.set(cacheKey, artwork);
      return artwork;
    }
  }

  artistArtworkCache.set(cacheKey, null);
  return undefined;
}

export async function searchArtists(
  term: string,
  limit: number = 20
): Promise<ItunesArtistResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const cappedLimit = Math.min(Math.max(limit, 1), ARTIST_SEARCH_MAX_LIMIT);
  const cacheKey = `${trimmed.toLowerCase()}_${cappedLimit}`;
  const cached = artistSearchCache.get(cacheKey);
  if (cached) return cached;

  const byId = new Map<string, ItunesArtistResult>();
  for (const url of itunesArtistSearchUrls(trimmed, cappedLimit)) {
    const results = await fetchItunesResults(url);
    for (const item of results) {
      const id = asFiniteNumber(item.artistId);
      const artistName = asString(item.artistName);
      if (id == null || !artistName?.trim()) continue;
      const artistId = String(id);
      if (byId.has(artistId)) continue;
      byId.set(artistId, {
        artistId,
        artistName,
        artistViewUrl: asString(item.artistLinkUrl),
        primaryGenreName: asString(item.primaryGenreName),
      });
    }
    if (byId.size > 0) break;
  }

  const results = await Promise.all(
    Array.from(byId.values()).map(async (artist) => {
      const artworkUrl100 = await fetchArtistArtworkUrl(Number(artist.artistId), artist.artistName);
      return artworkUrl100 ? { ...artist, artworkUrl100 } : artist;
    })
  );

  if (results.length > 0) {
    artistSearchCache.set(cacheKey, results);
  }
  return results;
}
