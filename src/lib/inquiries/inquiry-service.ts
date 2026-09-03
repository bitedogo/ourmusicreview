/** 1:1 문의 작성·조회·답변 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { In } from "typeorm";
import { Inquiry } from "@/src/lib/db/entities/Inquiry";
import { InquiryReply } from "@/src/lib/db/entities/InquiryReply";
import { User } from "@/src/lib/db/entities/User";
import { validateEmail } from "@/src/lib/auth/validation";
import { ServiceError } from "@/src/lib/http/service-error";
import { safeCreateNotification } from "@/src/lib/notifications/notification-service";
import {
  INQUIRY_BODY_MAX,
  INQUIRY_BODY_MIN,
  INQUIRY_FILE_MAX_COUNT,
  INQUIRY_TITLE_MAX,
  isInquiryCategory,
  type InquiryAttachment,
  type InquiryCategory,
  type InquiryStatus,
} from "@/src/lib/inquiries/types";

function createId() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

function createPublicCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `ORU-${n}`;
}

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

function toListItem(inquiry: Inquiry): InquiryListItemDto {
  return {
    id: inquiry.id,
    publicCode: inquiry.publicCode,
    category: inquiry.category,
    title: inquiry.title,
    status: inquiry.status,
    createdAt: new Date(inquiry.createdAt).toISOString(),
  };
}

function toReplyDto(reply: InquiryReply): InquiryReplyDto {
  return {
    id: reply.id,
    body: reply.body,
    isAdmin: reply.isAdmin === "Y",
    createdAt: new Date(reply.createdAt).toISOString(),
  };
}

export async function createInquiry(
  dataSource: DataSource,
  userId: string,
  input: {
    category?: unknown;
    email?: unknown;
    contact?: unknown;
    title?: unknown;
    body?: unknown;
    attachments?: unknown;
    consent?: unknown;
  }
) {
  if (input.consent !== true) {
    throw new ServiceError("문의 처리에 동의해 주세요.", 400);
  }
  if (!isInquiryCategory(input.category)) {
    throw new ServiceError("문의 유형을 선택해 주세요.", 400);
  }
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const emailError = validateEmail(email);
  if (emailError) throw new ServiceError(emailError, 400);

  const contact =
    typeof input.contact === "string" ? input.contact.trim().slice(0, 40) : "";
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const body = typeof input.body === "string" ? input.body.trim() : "";
  if (!title) throw new ServiceError("제목을 입력해 주세요.", 400);
  if (title.length > INQUIRY_TITLE_MAX) {
    throw new ServiceError(`제목은 ${INQUIRY_TITLE_MAX}자 이하여야 합니다.`, 400);
  }
  if (body.length < INQUIRY_BODY_MIN) {
    throw new ServiceError(`내용은 ${INQUIRY_BODY_MIN}자 이상 입력해 주세요.`, 400);
  }
  if (body.length > INQUIRY_BODY_MAX) {
    throw new ServiceError(`내용은 ${INQUIRY_BODY_MAX}자 이하여야 합니다.`, 400);
  }

  const attachments = parseAttachments(input.attachments);

  const repo = dataSource.getRepository(Inquiry);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const inquiry = repo.create({
      id: createId(),
      publicCode: createPublicCode(),
      userId,
      category: input.category,
      email,
      contact: contact || null,
      title,
      body,
      attachments,
      status: "WAITING",
    });
    try {
      const saved = await repo.save(inquiry);
      return toListItem(saved);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("public_code") && !message.includes("unique")) {
        throw error;
      }
    }
  }
  throw new ServiceError("문의 번호를 만들지 못했습니다. 다시 시도해 주세요.", 500);
}

function parseAttachments(value: unknown): InquiryAttachment[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new ServiceError("첨부 형식이 올바르지 않습니다.", 400);
  }
  if (value.length > INQUIRY_FILE_MAX_COUNT) {
    throw new ServiceError(`첨부 파일은 ${INQUIRY_FILE_MAX_COUNT}개까지입니다.`, 400);
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
    return {
      url: attachment.url.slice(0, 500),
      name: attachment.name.slice(0, 120),
      size: attachment.size,
    };
  });
}

export async function listMyInquiries(
  dataSource: DataSource,
  userId: string,
  page = 1,
  pageSize = 10
) {
  const safePage = Math.max(1, page);
  const take = Math.min(30, Math.max(1, pageSize));
  const repo = dataSource.getRepository(Inquiry);
  const [rows, total] = await repo.findAndCount({
    where: { userId },
    order: { createdAt: "DESC" },
    skip: (safePage - 1) * take,
    take,
  });
  return {
    items: rows.map(toListItem),
    total,
    page: safePage,
    pageSize: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
}

export async function listAllInquiries(
  dataSource: DataSource,
  page = 1,
  pageSize = 20,
  status?: InquiryStatus
) {
  const safePage = Math.max(1, page);
  const take = Math.min(50, Math.max(1, pageSize));
  const repo = dataSource.getRepository(Inquiry);
  const where = status ? { status } : {};
  const [rows, total] = await repo.findAndCount({
    where,
    order: { createdAt: "DESC" },
    skip: (safePage - 1) * take,
    take,
  });
  return {
    items: rows.map(toListItem),
    total,
    page: safePage,
    pageSize: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
}

async function loadUserNicknames(dataSource: DataSource, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, string>();
  const users = await dataSource.getRepository(User).find({
    where: { id: In(userIds) },
    select: ["id", "nickname"],
  });
  return new Map(users.map((user) => [user.id, user.nickname]));
}

export async function listAdminInquiries(
  dataSource: DataSource,
  page = 1,
  pageSize = 20,
  status?: InquiryStatus
) {
  const safePage = Math.max(1, page);
  const take = Math.min(50, Math.max(1, pageSize));
  const repo = dataSource.getRepository(Inquiry);
  const where = status ? { status } : {};
  const [rows, total] = await repo.findAndCount({
    where,
    order: { createdAt: "DESC" },
    skip: (safePage - 1) * take,
    take,
  });
  const nicknames = await loadUserNicknames(
    dataSource,
    [...new Set(rows.map((row) => row.userId))]
  );
  return {
    items: rows.map((row) => ({
      ...toListItem(row),
      userId: row.userId,
      userNickname: nicknames.get(row.userId) ?? "알 수 없음",
    })),
    total,
    page: safePage,
    pageSize: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  };
}

export async function getAdminInquiryDetail(
  dataSource: DataSource,
  id: string,
  actorUserId: string
): Promise<AdminInquiryDetailDto> {
  const detail = await getInquiryDetail(dataSource, id, {
    userId: actorUserId,
    isAdmin: true,
  });
  const user = await dataSource.getRepository(User).findOne({
    where: { id: detail.userId },
    select: ["nickname"],
  });
  return {
    ...detail,
    userNickname: user?.nickname ?? "알 수 없음",
  };
}

export async function getInquiryDetail(
  dataSource: DataSource,
  id: string,
  actor: { userId: string; isAdmin: boolean }
): Promise<InquiryDetailDto> {
  const inquiry = await dataSource.getRepository(Inquiry).findOne({ where: { id } });
  if (!inquiry) throw new ServiceError("문의를 찾을 수 없습니다.", 404);
  if (inquiry.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("조회 권한이 없습니다.", 403);
  }

  const replies = await dataSource.getRepository(InquiryReply).find({
    where: { inquiryId: inquiry.id },
    order: { createdAt: "ASC" },
  });

  return {
    ...toListItem(inquiry),
    email: inquiry.email,
    contact: inquiry.contact ?? null,
    body: inquiry.body,
    attachments: inquiry.attachments ?? [],
    replies: replies.map(toReplyDto),
    userId: inquiry.userId,
  };
}

export async function addInquiryReply(
  dataSource: DataSource,
  inquiryId: string,
  actor: { userId: string; isAdmin: boolean },
  bodyRaw: unknown
) {
  const body = typeof bodyRaw === "string" ? bodyRaw.trim() : "";
  if (body.length < 2) throw new ServiceError("답변 내용을 입력해 주세요.", 400);
  if (body.length > INQUIRY_BODY_MAX) {
    throw new ServiceError(`내용은 ${INQUIRY_BODY_MAX}자 이하여야 합니다.`, 400);
  }

  const repo = dataSource.getRepository(Inquiry);
  const inquiry = await repo.findOne({ where: { id: inquiryId } });
  if (!inquiry) throw new ServiceError("문의를 찾을 수 없습니다.", 404);
  if (inquiry.userId !== actor.userId && !actor.isAdmin) {
    throw new ServiceError("권한이 없습니다.", 403);
  }
  if (inquiry.status === "CLOSED") {
    throw new ServiceError("종료된 문의에는 답변할 수 없습니다.", 400);
  }

  const reply = dataSource.getRepository(InquiryReply).create({
    id: createId(),
    inquiryId: inquiry.id,
    authorUserId: actor.userId,
    isAdmin: actor.isAdmin ? "Y" : "N",
    body,
  });
  await dataSource.getRepository(InquiryReply).save(reply);

  inquiry.status = actor.isAdmin ? "ANSWERED" : "WAITING";
  await repo.save(inquiry);

  if (actor.isAdmin && inquiry.userId !== actor.userId) {
    await safeCreateNotification(dataSource, {
      userId: inquiry.userId,
      actorUserId: actor.userId,
      type: "INQUIRY_REPLY",
      title: "문의에 답변이 등록되었습니다.",
      body: inquiry.title,
      link: `/inquiry/${inquiry.id}`,
    });
  }

  return toReplyDto(reply);
}

export async function closeInquiry(
  dataSource: DataSource,
  inquiryId: string
) {
  const repo = dataSource.getRepository(Inquiry);
  const inquiry = await repo.findOne({ where: { id: inquiryId } });
  if (!inquiry) throw new ServiceError("문의를 찾을 수 없습니다.", 404);
  inquiry.status = "CLOSED";
  await repo.save(inquiry);
  return toListItem(inquiry);
}
