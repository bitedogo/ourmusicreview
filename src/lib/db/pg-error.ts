/** TypeORM / pg 에러에서 Postgres SQLSTATE 추출 */

const TRANSIENT_SQLSTATES = new Set(["57P01", "57P03", "08006", "08001"]);

const TRANSIENT_MESSAGE =
  /already has an active connection|Cannot execute operation on a disconnected connection|Connection terminated|connection timeout|ECONNRESET|ECONNREFUSED|not queryable|remaining connection slots|too many clients|Client has already been connected/i;

export function getPgErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) return undefined;

  const withCode = error as {
    code?: unknown;
    driverError?: { code?: unknown };
  };

  if (typeof withCode.code === "string" && withCode.code) {
    return withCode.code;
  }
  if (typeof withCode.driverError?.code === "string") {
    return withCode.driverError.code;
  }
  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  return getPgErrorCode(error) === "23505";
}

export function isRatingOutOfRangeError(error: unknown): boolean {
  const code = getPgErrorCode(error);
  return code === "22003" || code === "23514";
}

export function isTransientDbError(error: unknown): boolean {
  const code = getPgErrorCode(error);
  if (code && TRANSIENT_SQLSTATES.has(code)) return true;

  const message = error instanceof Error ? error.message : String(error ?? "");
  return TRANSIENT_MESSAGE.test(message);
}
