export interface FeaturedAlbumCardData {
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
  averageRating: number | null;
}

import type { ApiSuccessResponse } from "@/src/lib/http/client";

export interface FeaturedAlbumsApiResponse
  extends ApiSuccessResponse<{
    albums: FeaturedAlbumCardData[];
    hasUserSlide?: boolean;
  }> {}
