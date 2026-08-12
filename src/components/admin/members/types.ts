/** 관리자 회원 관리 공용 타입 */

export type AccountStatus = "ACTIVE" | "WARNED" | "SUSPENDED";

export type SanctionAction = "WARN" | "SUSPEND" | "UNSUSPEND";

export interface SanctionLogItem {
  id: string;
  action: SanctionAction;
  reason: string;
  suspendedUntil: string | null;
  adminId: string;
  createdAt: string;
}

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
  accountStatus: AccountStatus;
  warningCount: number;
  suspendedUntil: string | null;
  suspendReason: string | null;
}

export interface MemberDetail extends Member {
  hasUserSlide: boolean;
  slideAlbums: Array<{
    id: string;
    collectionId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  }>;
  sanctions: SanctionLogItem[];
}

export type MemberTabType = "all" | "admin" | "warned" | "suspended";

export type MemberSortColumn =
  | "nickname"
  | "role"
  | "createdAt"
  | "email"
  | "accountStatus";

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

export function formatMemberDateTime(dateString: string): string {
  try {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: "정상",
  WARNED: "경고",
  SUSPENDED: "정지",
};

export const SANCTION_ACTION_LABEL: Record<SanctionAction, string> = {
  WARN: "경고",
  SUSPEND: "일시 정지",
  UNSUSPEND: "정지 해제",
};

export function defaultSuspendUntilLocalValue(): string {
  const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
