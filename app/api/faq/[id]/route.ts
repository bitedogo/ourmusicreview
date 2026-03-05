import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Faq } from "@/src/lib/db/entities/Faq";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

    if (!session?.user?.id || !isAdmin) {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
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
      return NextResponse.json(
        { ok: false, error: "FAQ를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (sortOrder !== undefined) faq.sortOrder = sortOrder;

    await faqRepository.save(faq);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "FAQ 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
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
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const dataSource = await initializeDatabase();
    const faqRepository = dataSource.getRepository(Faq);

    const result = await faqRepository.delete({ id });

    if (result.affected === 0) {
      return NextResponse.json(
        { ok: false, error: "FAQ를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "FAQ 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
