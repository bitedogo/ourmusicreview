"use client";

import { useEffect, useState } from "react";
import type { Session } from "next-auth";
import type { FeaturedAlbumCardData } from "@/app/components/featured-album-card";
import type { FeaturedAlbumsApiResponse } from "@/src/lib/featured-albums/types";

export function useFeaturedAlbums(
  sessionStatus: "loading" | "authenticated" | "unauthenticated",
  session: Session | null,
  showAdminSlide: boolean
) {
  const [albums, setAlbums] = useState<FeaturedAlbumCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    setIsLoading(true);
    (async () => {
      try {
        const url = showAdminSlide
          ? "/api/featured-albums?source=admin"
          : "/api/featured-albums";
        const response = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to fetch");

        const data = (await response.json().catch(() => null)) as FeaturedAlbumsApiResponse | null;
        if (data?.ok && Array.isArray(data.albums)) {
          setAlbums(data.albums);
        } else {
          setAlbums([]);
        }
      } catch {
        setAlbums([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [sessionStatus, session?.user?.id, showAdminSlide]);

  return { albums, isLoading };
}
