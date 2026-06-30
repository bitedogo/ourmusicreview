export interface AlbumDetail {
  collectionId: string;
  artistId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}
