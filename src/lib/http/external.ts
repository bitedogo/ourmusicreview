import type { ZodType } from "zod";

export class ExternalHttpError extends Error {
  constructor(
    readonly provider: string,
    readonly status: number | null,
    message: string
  ) {
    super(message);
    this.name = "ExternalHttpError";
  }
}

interface ExternalFetchOptions<T> {
  provider: string;
  timeoutMs?: number;
  retries?: number;
  schema?: ZodType<T>;
}

/** 429는 재시도하면 차단만 길어진다. 네트워크 오류·5xx만 재시도 */
export function isRetryableExternalStatus(status: number | null): boolean {
  if (status === null) return true;
  return status >= 500 && status < 600;
}

export async function fetchExternalJson<T>(
  input: string | URL,
  init: RequestInit,
  options: ExternalFetchOptions<T>
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 5000;
  const retries = options.retries ?? 1;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(input, { ...init, signal: controller.signal });
      if (!response.ok) {
        throw new ExternalHttpError(
          options.provider,
          response.status,
          `${options.provider} 응답 오류 (${response.status})`
        );
      }
      const payload: unknown = await response.json();
      if (!options.schema) return payload as T;
      const parsed = options.schema.safeParse(payload);
      if (!parsed.success) {
        throw new ExternalHttpError(
          options.provider,
          response.status,
          `${options.provider} 응답 형식이 올바르지 않습니다.`
        );
      }
      return parsed.data;
    } catch (error) {
      lastError = error;
      const status =
        error instanceof ExternalHttpError ? error.status : null;
      const retryable =
        attempt < retries && isRetryableExternalStatus(status);
      if (!retryable) break;
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(250 * 2 ** attempt, 1000))
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  if (lastError instanceof ExternalHttpError) throw lastError;
  throw new ExternalHttpError(
    options.provider,
    null,
    lastError instanceof Error ? lastError.message : "외부 요청에 실패했습니다."
  );
}
