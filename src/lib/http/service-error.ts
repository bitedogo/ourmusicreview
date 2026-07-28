/** 서비스 계층에서 발생하는 HTTP 상태코드 포함 에러 */

export class ServiceError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
  }
}
