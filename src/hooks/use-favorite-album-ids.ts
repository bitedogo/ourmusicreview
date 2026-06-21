"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiClientError, fetchJson } from "@/src/lib/http/client";
import type { FavoritesResponse } from "@/src/lib/search/types";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface UseFavoriteAlbumIdsOptions {
  onUnauthorized?: () => void;
}

export function useFavoriteAlbumIds({ onUnauthorized }: UseFavoriteAlbumIdsOptions = {}) {
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isCancelled = false;

    async function fetchFavorites() {
      try {
        const data = await fetchJson<FavoritesResponse>("/api/favorites");
        if (isCancelled) return;

        const ids = new Set<string>();
        for (const favorite of data.data.favorites || []) {
          if (favorite.albumId) {
            ids.add(String(favorite.albumId));
          }
        }
        setFavoriteAlbumIds(ids);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          return;
        }
      }
    }

    fetchFavorites();

    return () => {
      isCancelled = true;
    };
  }, []);

  const toggleFavorite = useCallback(
    async (album: SearchAlbumResult) => {
      const albumId = album.collectionId.toString();
      const isFavorite = favoriteAlbumIds.has(albumId);

      try {
        if (!isFavorite) {
          await fetchJson<{ ok: boolean }>("/api/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              albumId,
              albumTitle: album.collectionName,
              albumArtist: album.artistName,
              albumImageUrl: album.imageUrl600,
              albumReleaseDate: album.releaseDate,
            }),
          });

          setFavoriteAlbumIds((prev) => new Set(prev).add(albumId));
        } else {
          await fetchJson<{ ok: boolean }>("/api/favorites", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ albumId }),
          });

          setFavoriteAlbumIds((prev) => {
            const next = new Set(prev);
            next.delete(albumId);
            return next;
          });
        }
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          onUnauthorized?.();
        }
      }
    },
    [favoriteAlbumIds, onUnauthorized]
  );

  return {
    favoriteAlbumIds,
    toggleFavorite,
  };
}
