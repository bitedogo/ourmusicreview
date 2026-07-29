/** 앨범 상세 페이지·모달용 타입 */

export interface AlbumDetailTrack {
  id: string;
  trackNumber: number;
  discNumber: number;
  title: string;
  durationMs: number;
  artists: string[];
  explicit: boolean;
  previewUrl: string | null;
}

export interface AlbumDetail {
  id: string;
  name: string;
  artists: string[];
  imageUrl: string | null;
  releaseDate: string;
  releaseDatePrecision: string;
  genre: string | null;
  copyrights: string[];
  tracks: AlbumDetailTrack[];
}

export interface AlbumDetailResponse {
  ok: true;
  data: {
    album: AlbumDetail;
  };
}
