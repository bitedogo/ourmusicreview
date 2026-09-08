/** 문의 엔티티의 API DTO 변환 */

import { Inquiry } from "@/src/lib/db/entities/Inquiry";
import { InquiryReply } from "@/src/lib/db/entities/InquiryReply";
import type {
  InquiryAttachment,
  InquiryCategory,
  InquiryStatus,
} from "@/src/lib/inquiries/types";

export interface InquiryListItemDto {
  id: string;
  publicCode: string;
  category: InquiryCategory;
  title: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryReplyDto {
  id: string;
  body: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface InquiryDetailDto extends InquiryListItemDto {
  email: string;
  contact: string | null;
  body: string;
  attachments: InquiryAttachment[];
  replies: InquiryReplyDto[];
  userId: string;
}

export interface AdminInquiryListItemDto extends InquiryListItemDto {
  userId: string;
  userNickname: string;
}

export interface AdminInquiryDetailDto extends InquiryDetailDto {
  userNickname: string;
}

export function toInquiryListItem(inquiry: Inquiry): InquiryListItemDto {
  return {
    id: inquiry.id,
    publicCode: inquiry.publicCode,
    category: inquiry.category,
    title: inquiry.title,
    status: inquiry.status,
    createdAt: new Date(inquiry.createdAt).toISOString(),
  };
}

export function toInquiryReplyDto(reply: InquiryReply): InquiryReplyDto {
  return {
    id: reply.id,
    body: reply.body,
    isAdmin: reply.isAdmin === "Y",
    createdAt: new Date(reply.createdAt).toISOString(),
  };
}
