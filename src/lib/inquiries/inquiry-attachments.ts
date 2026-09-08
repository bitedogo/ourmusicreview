/** 문의 첨부파일 검증과 비공개 URL 서명 */

import { ServiceError } from "@/src/lib/http/service-error";
import {
  INQUIRY_FILE_MAX_COUNT,
  type InquiryAttachment,
} from "@/src/lib/inquiries/types";
import { getPrivateObjectUrl } from "@/src/lib/storage/r2";

export function parseInquiryAttachments(
  value: unknown,
  userId: string
): InquiryAttachment[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new ServiceError("첨부 형식이 올바르지 않습니다.", 400);
  }
  if (value.length > INQUIRY_FILE_MAX_COUNT) {
    throw new ServiceError(
      `첨부 파일은 ${INQUIRY_FILE_MAX_COUNT}개까지입니다.`,
      400
    );
  }

  return value.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as InquiryAttachment).url !== "string" ||
      typeof (item as InquiryAttachment).name !== "string" ||
      typeof (item as InquiryAttachment).size !== "number"
    ) {
      throw new ServiceError("첨부 형식이 올바르지 않습니다.", 400);
    }
    const attachment = item as InquiryAttachment;
    const key = attachment.key?.trim();
    if (key && !key.startsWith(`inquiries/${userId}/`)) {
      throw new ServiceError(
        "본인이 업로드한 첨부파일만 등록할 수 있습니다.",
        403
      );
    }
    return {
      ...(key ? { key: key.slice(0, 500) } : {}),
      url: key ? "" : attachment.url.slice(0, 500),
      name: attachment.name.slice(0, 120),
      size: attachment.size,
    };
  });
}

export async function signInquiryAttachments(
  attachments: InquiryAttachment[]
): Promise<InquiryAttachment[]> {
  return Promise.all(
    attachments.map(async (attachment) => ({
      ...attachment,
      url: attachment.key
        ? await getPrivateObjectUrl(attachment.key)
        : attachment.url,
    }))
  );
}
