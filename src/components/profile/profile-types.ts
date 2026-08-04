/** 프로필 페이지 공유 타입 */

export interface ProfilePrivacySettings {
  showReviewsPublic: boolean;
  showFavoritesPublic: boolean;
  showMasterpiecesPublic: boolean;
  showRatingPublic: boolean;
  showPlaylistsPublic: boolean;
}

export interface ProfileReviewItem {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  rejectReason: string | null;
  albumId: string;
  createdAt: string;
  updatedAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  } | null;
}

export interface ProfileFavoriteItem {
  id: string;
  albumId: string;
  createdAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
    releaseDate: string | null;
  } | null;
}

export interface ProfileMasterpieceItem {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

export interface ProfilePlaylistItem {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  coverImageUrl: string | null;
  trackCount: number;
  genres?: Array<{ id: string; nameKo: string }>;
  updatedAt: string;
}

export const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  NONE: "-",
};
