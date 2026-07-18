/** 차트 API 응답·항목 타입 */

export type ChartRegion = "kr" | "us" | "gb" | "jp";

export const CHART_REGIONS: { id: ChartRegion; label: string; storefront: string }[] = [
  { id: "kr", label: "국내", storefront: "kr" },
  { id: "us", label: "미국", storefront: "us" },
  { id: "gb", label: "영국", storefront: "gb" },
  { id: "jp", label: "일본", storefront: "jp" },
];

export function getStorefront(region: ChartRegion): string {
  return CHART_REGIONS.find((entry) => entry.id === region)?.storefront ?? "kr";
}

export function isChartRegion(value: string | null): value is ChartRegion {
  return CHART_REGIONS.some((entry) => entry.id === value);
}

export interface ChartAlbum {
  rank: number;
  collectionId: string;
  title: string;
  artist: string;
  artistId: string | null;
  imageUrl: string | null;
  genre: string;
  releaseDate: string;
}

export interface ChartResponse {
  ok: boolean;
  data: {
    albums: ChartAlbum[];
  };
}
