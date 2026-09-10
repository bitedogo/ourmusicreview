import { z } from "zod";
import { ServiceError } from "@/src/lib/http/service-error";

function parseWithSchema<T>(payload: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ServiceError("요청 값이 올바르지 않습니다.", 400, {
      fields: z.flattenError(result.error).fieldErrors,
    });
  }
  return result.data;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>
): Promise<T> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new ServiceError("올바른 JSON 요청이 아닙니다.", 400);
  }

  return parseWithSchema(payload, schema);
}

export function parseSearchParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodType<T>
): T {
  return parseWithSchema(Object.fromEntries(searchParams.entries()), schema);
}
