/** PATCH/DELETE FAQ 수정·삭제 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Faq } from "@/src/lib/db/entities/Faq";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user?.id || !isAdmin) {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const question = typeof body?.question === "string" ? body.question.trim() : undefined;
    const answer = typeof body?.answer === "string" ? body.answer.trim() : undefined;
    const sortOrder = typeof body?.sortOrder === "number" ? body.sortOrder : undefined;

    const dataSource = await initializeDatabase();
    const faqRepository = dataSource.getRepository(Faq);

    const faq = await faqRepository.findOne({ where: { id } });
    if (!faq) {
      return apiError("FAQ를 찾을 수 없습니다.", { status: 404 });
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (sortOrder !== undefined) faq.sortOrder = sortOrder;

    await faqRepository.save(faq);

    return apiOk({});
  } catch {
    return apiError("FAQ 수정 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user?.id || !isAdmin) {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const { id } = await params;

    const dataSource = await initializeDatabase();
    const faqRepository = dataSource.getRepository(Faq);

    const result = await faqRepository.delete({ id });

    if (result.affected === 0) {
      return apiError("FAQ를 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({});
  } catch {
    return apiError("FAQ 삭제 중 오류가 발생했습니다.", { status: 500 });
  }
}
