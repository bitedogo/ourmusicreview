/** 서버 세션·관리자 페이지 가드 */

import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth/config";
import { withDatabase } from "@/src/lib/db";
import { apiError } from "@/src/lib/http/response";
import { getSuspensionBlockForUser } from "@/src/lib/users/user-sanction-service";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: "USER" | "ADMIN";
  profileImage?: string | null;
  image?: string | null;
}

export interface AuthenticatedSession extends Session {
  user: AuthenticatedUser;
}

type SessionGuardResult =
  | { session: AuthenticatedSession; response: null }
  | { session: null; response: Response };

function toAuthenticatedSession(session: Session | null): AuthenticatedSession | null {
  if (!session?.user?.id) {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: session.user.id,
    },
  };
}

export async function getAppSession() {
  return getServerSession(authOptions);
}

export function isAdmin(session: Session | null | undefined): boolean {
  return session?.user?.role === "ADMIN";
}

export async function requireAdminPage() {
  const session = toAuthenticatedSession(await getAppSession());

  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (!isAdmin(session)) {
    redirect("/");
  }

  return session;
}

/** 로그인 필요 페이지 가드 (미로그인 시 콜백 경로로 이동) */
export async function requireAuthPage(callbackPath: string) {
  const session = toAuthenticatedSession(await getAppSession());
  if (!session) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  return session;
}

export async function requireSessionApi(): Promise<SessionGuardResult> {
  const session = toAuthenticatedSession(await getAppSession());

  if (!session) {
    return {
      session: null,
      response: apiError("로그인이 필요합니다.", { status: 401 }),
    };
  }

  return { session, response: null };
}

/** 로그인 + 정지 계정 쓰기 차단 (리뷰·댓글·게시글) */
export async function requireWritableSessionApi(): Promise<SessionGuardResult> {
  const { session, response } = await requireSessionApi();
  if (response || !session) {
    return { session: null, response };
  }

  if (isAdmin(session)) {
    return { session, response: null };
  }

  try {
    const block = await withDatabase((dataSource) =>
      getSuspensionBlockForUser(dataSource, session.user.id)
    );
    if (block) {
      return {
        session: null,
        response: apiError(block.message, { status: 403 }),
      };
    }
  } catch {
    return {
      session: null,
      response: apiError("계정 상태를 확인할 수 없습니다.", { status: 500 }),
    };
  }

  return { session, response: null };
}

export async function requireAdminApi(): Promise<SessionGuardResult> {
  const session = toAuthenticatedSession(await getAppSession());

  if (!session || !isAdmin(session)) {
    return {
      session: null,
      response: apiError("관리자 권한이 필요합니다.", { status: 403 }),
    };
  }

  return { session, response: null };
}
