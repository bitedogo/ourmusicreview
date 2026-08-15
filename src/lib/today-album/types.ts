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

export type TodayAlbumArchiveItem = Pick<
  TodayAlbumPayload,
  "displayDate" | "albumId" | "title" | "artist" | "imageUrl"
>;

export interface TodayAlbumsResponse {
  ok: boolean;
  albums: Record<TodayAlbumTab, TodayAlbumData | null>;
  archive: TodayAlbumArchiveItem[];
}

export const TODAY_ALBUM_TABS: { id: TodayAlbumTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "previous", label: "Previous" },
];
