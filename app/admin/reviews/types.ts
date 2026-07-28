/** 관리자 리뷰 승인 공통 타입 정의 */

export interface Review {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  userId: string;
  albumId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  };
}

export interface ReviewListResponse {
  ok: boolean;
  data: {
    reviews: Review[];
  };
}
