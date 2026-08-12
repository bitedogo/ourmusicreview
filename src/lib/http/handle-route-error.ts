/** API 라우트 공통 에러 → apiError 매핑 */

import { apiError } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";

/**
 * 서비스/라우트 catch 블록에서 사용한다.
 * ServiceError는 status를 유지하고, 그 외는 fallbackMessage로 500을 반환한다.
 */
export function handleRouteError(
  error: unknown,
  fallbackMessage: string
): Response {
  if (error instanceof ServiceError) {
    return apiError(error.message, { status: error.status });
  }

  if (process.env.NODE_ENV !== "production" && error instanceof Error) {
    console.error("[api]", error);
  }

  return apiError(fallbackMessage, { status: 500 });
}
