export interface FeaturedAlbumCardData {
  collectionId: number;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
  averageRating: number | null;
}

export interface FeaturedAlbumsApiResponse {
  ok: boolean;
  albums: FeaturedAlbumCardData[];
  hasUserSlide?: boolean;
}
