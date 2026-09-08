/** 문의 첨부파일 R2 업로드 */

import { randomUUID } from "crypto";
import {
  getPrivateObjectUrl,
  putPrivateObject,
} from "@/src/lib/storage/r2";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  INQUIRY_FILE_MAX_BYTES,
  type InquiryAttachment,
} from "@/src/lib/inquiries/types";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
]);

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "text/plain") return "txt";
  return "bin";
}

function hasValidSignature(bytes: Uint8Array, mime: string): boolean {
  const startsWith = (...expected: number[]) =>
    expected.every((value, index) => bytes[index] === value);
  if (mime === "image/jpeg" || mime === "image/jpg") {
    return startsWith(0xff, 0xd8, 0xff);
  }
  if (mime === "image/png") return startsWith(0x89, 0x50, 0x4e, 0x47);
  if (mime === "image/gif") return startsWith(0x47, 0x49, 0x46, 0x38);
  if (mime === "image/webp") {
    return (
      startsWith(0x52, 0x49, 0x46, 0x46) &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  if (mime === "application/pdf") return startsWith(0x25, 0x50, 0x44, 0x46);
  if (mime === "text/plain") return !bytes.slice(0, 1024).includes(0);
  return false;
}

export async function uploadInquiryAttachment(
  file: File,
  userId: string
): Promise<InquiryAttachment> {
  if (!file || file.size === 0) {
    throw new ServiceError("업로드할 파일을 선택해주세요.", 400);
  }
  if (file.size > INQUIRY_FILE_MAX_BYTES) {
    throw new ServiceError("파일 용량은 10MB 이하여야 합니다.", 400);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ServiceError("지원 형식: PNG, JPG, GIF, WebP, PDF, TXT", 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasValidSignature(bytes, file.type)) {
    throw new ServiceError("파일 내용과 확장자 형식이 일치하지 않습니다.", 400);
  }

  const key = `inquiries/${userId}/${Date.now()}_${randomUUID()}.${extensionFor(file)}`;
  await putPrivateObject({
    key,
    body: bytes,
    contentType: file.type || "application/octet-stream",
  });
  const url = await getPrivateObjectUrl(key);

  return {
    key,
    url,
    name: file.name.slice(0, 120),
    size: file.size,
  };
}
