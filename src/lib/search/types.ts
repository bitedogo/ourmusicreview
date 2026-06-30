import type { ItunesArtistResult } from "@/src/lib/itunes/types";

export interface SearchAlbumResult {
  collectionId: string;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  imageUrl600: string | null;
}

export interface ArtistSearchResponse {
  ok: boolean;
  data: {
    artists: ItunesArtistResult[];
  };
}

export interface ArtistAlbumsResponse {
  ok: boolean;
  data: {
    albums: SearchAlbumResult[];
  };
}

export interface BatchAlbumRatingsResponse {
  ok: boolean;
  data: {
    ratings: Record<string, { averageRating: number | null; reviewCount: number }>;
  };
}

export interface FavoritesResponse {
  ok: boolean;
  data: {
    favorites: Array<{ albumId?: string | number | null }>;
  };
}

export interface ReviewDuplicateCheckResponse {
  ok: boolean;
  data: {
    exists: boolean;
    reviewId: string | null;
  };
}
