import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Faq } from "@/src/lib/db/entities/Faq";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { publicCachedJson } from "@/src/lib/http/cache";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const faqRepository = dataSource.getRepository(Faq);

    const faqs = await faqRepository.find({
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });

    return publicCachedJson(
      {
        ok: true,
        data: {
          faqs: faqs.map((f) => ({
            id: f.id,
            question: f.question,
            answer: f.answer,
            sortOrder: f.sortOrder,
          })),
        },
      },
      30,
      120
    );
  } catch {
    return apiError("FAQ를 불러오는 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user?.id || !isAdmin) {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : "";
    const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
    const sortOrder = typeof body?.sortOrder === "number" ? body.sortOrder : 0;

    if (!question || !answer) {
      return apiError("질문과 답변을 모두 입력해주세요.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const faqRepository = dataSource.getRepository(Faq);

    const id = randomUUID().replace(/-/g, "").slice(0, 24);

    const faq = faqRepository.create({
      id,
      question,
      answer,
      sortOrder,
    });

    await faqRepository.save(faq);

    return apiOk({ id: faq.id }, { status: 201 });
  } catch {
    return apiError("FAQ 등록 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user?.id || !isAdmin) {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const body = await request.json();
    const order = body?.order;
    if (!Array.isArray(order) || order.some((id) => typeof id !== "string")) {
      return apiError("order는 FAQ id 문자열 배열이어야 합니다.", { status: 400 });
    }

    const ids = order.map((id: string) => id.trim()).filter(Boolean);
    if (ids.length === 0) {
      return apiError("정렬할 FAQ id가 없습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
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

    return apiOk({});
  } catch {
    return apiError("FAQ 순서 저장 중 오류가 발생했습니다.", { status: 500 });
  }
}
