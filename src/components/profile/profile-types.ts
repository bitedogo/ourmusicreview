/** 프로필 페이지 공유 타입 */

export interface ProfilePrivacySettings {
  showReviewsPublic: boolean;
  showFavoritesPublic: boolean;
  showMasterpiecesPublic: boolean;
  showRatingPublic: boolean;
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

export const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  NONE: "-",
};

export const RATING_COMMENTS: Record<number, string> = {
  0: "취향 문턱이 너무 높으신데요..",
  1: "쉽게 만족 안 하시는 타입이군요..?",
  2: "듣는 기준이 확실히 까다롭네요 ㅠㅠ",
  3: "좋은 점수 받기 쉽지 않겠어요..",
  4: "기준이 살짝 높은 편이네요..",
  5: "무난하게 평가하시는 편이네요",
  6: "여유 있게 들어주시는 느낌이네요~~",
  7: "음악을 잘 즐기시는 편이네요!!",
  8: "긍정적으로 많이 들으시는 듯..?",
  9: "거의 다 좋게 들으시겠어요 ㅎㅎ",
  10: "음악 자체를 즐기시는 타입이네요!!",
};
