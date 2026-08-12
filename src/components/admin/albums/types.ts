/** 관리자 오늘의 앨범 관리 공용 타입 */

export interface TodayAlbumItem {
  displayDate: string;
  albumId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  description: string | null;
}

export interface AlbumsListResponse {
  ok: true;
  data: { albums: TodayAlbumItem[] };
}

export interface TodayAlbumFormState {
  displayDate: string;
  albumId: string;
  title: string;
  artist: string;
  imageUrl: string;
  description: string;
}
