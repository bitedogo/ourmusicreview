/** 문의 첨부파일 R2 업로드 */

import { randomUUID } from "crypto";
import { putPublicObject } from "@/src/lib/storage/r2";
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

export async function uploadInquiryAttachment(file: File): Promise<InquiryAttachment> {
  if (!file || file.size === 0) {
    throw new ServiceError("업로드할 파일을 선택해주세요.", 400);
  }
  if (file.size > INQUIRY_FILE_MAX_BYTES) {
    throw new ServiceError("파일 용량은 10MB 이하여야 합니다.", 400);
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ServiceError("지원 형식: PNG, JPG, GIF, WebP, PDF, TXT", 400);
  }

  const key = `inquiries/${Date.now()}_${randomUUID()}.${extensionFor(file)}`;
  const url = await putPublicObject({
    key,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type || "application/octet-stream",
    cacheControl: "private, max-age=0",
  });

  return {
    url,
    name: file.name.slice(0, 120),
    size: file.size,
  };
}
