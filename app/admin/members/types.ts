/** 관리자 회원 관리 공용 타입 */

export interface Member {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  gender: string | null;
  role: "USER" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
  slideCount: number;
  reviewCount: number;
  favoriteCount: number;
}

export interface MemberDetail {
  id: string;
  nickname: string;
  name: string | null;
  email: string;
  gender: string | null;
  role: "USER" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
  slideCount: number;
  reviewCount: number;
  favoriteCount: number;
  hasUserSlide: boolean;
  slideAlbums: Array<{
    id: string;
    collectionId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  }>;
}

export type MemberTabType = "all" | "admin";

export type MemberSortColumn = "nickname" | "role" | "createdAt" | "email";

export interface MembersListResponse {
  ok: true;
  data: { members: Member[] };
}

export interface MemberDetailResponse {
  ok: true;
  data: { member: MemberDetail };
}

export function formatMemberDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  NONE: "-",
};
