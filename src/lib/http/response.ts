/** API JSON 응답 헬퍼 */

import { noStoreJson } from "@/src/lib/http/cache";

interface ApiOkOptions {
  status?: number;
  message?: string;
}

interface ApiErrorOptions {
  status?: number;
}

export function apiOk<T>(data: T, options?: ApiOkOptions) {
  return noStoreJson(
    {
      ok: true as const,
      data,
      ...(options?.message ? { message: options.message } : {}),
    },
    { status: options?.status ?? 200 }
  );
}

export function apiError(error: string, options?: ApiErrorOptions) {
  return noStoreJson(
    {
      ok: false as const,
      error,
    },
    { status: options?.status ?? 400 }
  );
}
