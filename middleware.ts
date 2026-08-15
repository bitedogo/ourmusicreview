/** 디자이너·개발자 가이드 비밀번호 게이트 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  GUIDE_GATE_COOKIE,
  isGuideGateTokenValid,
  isGuidePath,
} from "@/src/lib/guides/gate";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isGuidePath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(GUIDE_GATE_COOKIE)?.value;
  if (await isGuideGateTokenValid(token)) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/guide-access";
  loginUrl.search = "";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/designer", "/designer/:path*", "/developer", "/developer/:path*"],
};
