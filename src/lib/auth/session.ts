/** 서버 세션·관리자 페이지 가드 */

import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/src/lib/auth/config";
import { apiError } from "@/src/lib/http/response";

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
