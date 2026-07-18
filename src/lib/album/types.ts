/** 앨범 공통 도메인 타입 */

export interface AlbumDetail {
  collectionId: string;
  artistId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}
