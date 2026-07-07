export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  message?: string;
}

interface ApiBaseResponse {
  ok: boolean;
  error?: string;
}

export class ApiClientError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export async function fetchJson<T extends ApiBaseResponse>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, init);
  const payload = (await response.json().catch(() => null)) as T | null;

  if (!response.ok || !payload?.ok) {
    throw new ApiClientError(
      payload?.error ?? `요청에 실패했습니다. (status: ${response.status})`,
      response.status,
      payload
    );
  }

  return payload;
}
