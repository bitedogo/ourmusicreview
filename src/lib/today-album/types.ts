/** 오늘의 앨범 타입 */

export interface TodayAlbumPayload {
  displayDate: string;
  albumId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  description: string | null;
}

export type TodayAlbumData = TodayAlbumPayload;

export type TodayAlbumTab = "today" | "yesterday" | "previous";

export interface TodayAlbumsResponse {
  ok: boolean;
  albums: Record<TodayAlbumTab, TodayAlbumData | null>;
}

export const TODAY_ALBUM_TABS: { id: TodayAlbumTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "previous", label: "Previous" },
];
