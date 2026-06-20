import type { FeaturedAlbumCardData } from "@/app/components/featured-album-card";

export interface FeaturedAlbumsApiResponse {
  ok: boolean;
  albums: FeaturedAlbumCardData[];
  hasUserSlide?: boolean;
}
