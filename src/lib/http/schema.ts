import { z } from "zod";
import { ServiceError } from "@/src/lib/http/service-error";

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

  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ServiceError("요청 값이 올바르지 않습니다.", 400, {
      fields: z.flattenError(result.error).fieldErrors,
    });
  }
  return result.data;
}
