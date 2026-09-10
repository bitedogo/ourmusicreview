/** 주간 신보 DTO */

export type NewReleaseCategory = "K" | "I";

export type NewReleaseSource = "itunes" | "manual";

export interface NewReleaseAlbum {
  id: string;
  collectionId: string;
  title: string;
  artist: string;
  artistId: string | null;
  imageUrl: string | null;
  releaseDate: string;
  source: NewReleaseSource;
}

export interface NewReleasesHomeData {
  albums: NewReleaseAlbum[];
}

export type NewReleaseAdminBucket = "thisWeek" | "nextWeek" | "upcoming" | "past";

export interface NewReleaseAdminAlbum extends NewReleaseAlbum {
  weekBucket: NewReleaseAdminBucket;
}
