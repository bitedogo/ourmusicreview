/** FAQ 목록·등록·수정·삭제·정렬 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import { In } from "typeorm";
import { Faq } from "@/src/lib/db/entities/Faq";
import { ServiceError } from "@/src/lib/http/service-error";

export async function listFaqs(dataSource: DataSource) {
  const faqs = await dataSource.getRepository(Faq).find({
    order: { sortOrder: "ASC", createdAt: "ASC" },
  });
  return faqs.map((f) => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    sortOrder: f.sortOrder,
  }));
}

export async function createFaq(
  dataSource: DataSource,
  input: { question?: unknown; answer?: unknown; sortOrder?: unknown }
) {
  const question =
    typeof input.question === "string" ? input.question.trim() : "";
  const answer = typeof input.answer === "string" ? input.answer.trim() : "";
  const sortOrder = typeof input.sortOrder === "number" ? input.sortOrder : 0;

  if (!question || !answer) {
    throw new ServiceError("질문과 답변을 모두 입력해주세요.", 400);
  }

  const faqRepository = dataSource.getRepository(Faq);
  const faq = faqRepository.create({
    id: randomUUID().replace(/-/g, "").slice(0, 24),
    question,
    answer,
    sortOrder,
  });
  await faqRepository.save(faq);
  return { id: faq.id };
}

export async function reorderFaqs(dataSource: DataSource, order: unknown) {
  if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
    throw new ServiceError("order는 FAQ id 문자열 배열이어야 합니다.", 400);
  }

  const ids = order.map((id: string) => id.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new ServiceError("정렬할 FAQ id가 없습니다.", 400);
  }

  const faqRepository = dataSource.getRepository(Faq);
  const faqs = await faqRepository.find({ where: { id: In(ids) } });
  const byId = new Map(faqs.map((faq) => [faq.id, faq]));

  const updates: Faq[] = [];
  ids.forEach((id, index) => {
    const faq = byId.get(id);
    if (faq) {
      faq.sortOrder = index + 1;
      updates.push(faq);
    }
  });

  if (updates.length > 0) {
    await faqRepository.save(updates);
  }
}

export async function updateFaq(
  dataSource: DataSource,
  id: string,
  input: { question?: unknown; answer?: unknown; sortOrder?: unknown }
) {
  const faqRepository = dataSource.getRepository(Faq);
  const faq = await faqRepository.findOne({ where: { id } });
  if (!faq) {
    throw new ServiceError("FAQ를 찾을 수 없습니다.", 404);
  }

  if (typeof input.question === "string") {
    faq.question = input.question.trim();
  }
  if (typeof input.answer === "string") {
    faq.answer = input.answer.trim();
  }
  if (typeof input.sortOrder === "number") {
    faq.sortOrder = input.sortOrder;
  }

  await faqRepository.save(faq);
}

export async function deleteFaq(dataSource: DataSource, id: string) {
  const result = await dataSource.getRepository(Faq).delete({ id });
  if (result.affected === 0) {
    throw new ServiceError("FAQ를 찾을 수 없습니다.", 404);
  }
}
