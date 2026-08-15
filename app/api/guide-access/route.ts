/** 내부 가이드 비밀번호 확인 */

import { apiError, apiOk } from "@/src/lib/http/response";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { sanitizeText } from "@/src/lib/auth/validation";
import {
  GUIDE_GATE_COOKIE,
  GUIDE_GATE_MAX_AGE_SECONDS,
  createGuideGateToken,
  isGuideGatePassword,
  safeGuideNextPath,
} from "@/src/lib/guides/gate";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: unknown; next?: unknown };
    const password = sanitizeText(body?.password);
    const nextPath = safeGuideNextPath(
      typeof body?.next === "string" ? body.next : null
    );

    if (!password) {
      return apiError("비밀번호를 입력해 주세요.", { status: 400 });
    }
    if (!isGuideGatePassword(password)) {
      return apiError("비밀번호가 올바르지 않습니다.", { status: 401 });
    }

    const response = apiOk({ next: nextPath });
    response.cookies.set(GUIDE_GATE_COOKIE, await createGuideGateToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: GUIDE_GATE_MAX_AGE_SECONDS,
    });
    return response;
  } catch (error) {
    return handleRouteError(error, "가이드 입장 중 오류가 발생했습니다.");
  }
}
