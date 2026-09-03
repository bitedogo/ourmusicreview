/** 1:1 문의 페이지 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { InquiryPageClient } from "@/src/components/inquiry/inquiry-page-client";
import { listBoardPosts } from "@/src/lib/community/board-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { listFaqs } from "@/src/lib/faq/faq-service";
import { PAGE_SIZE_BOARD } from "@/app/boards/[board]/board-config";

export const metadata: Metadata = {
  title: "1:1 문의하기",
  description: "ORU 1:1 문의 — 계정, 결제, 신고, 버그, 기능 제안 등 문의를 남겨 주세요.",
};

type InquiryTab = "write" | "history" | "faq" | "notice";

function parseTab(value: string | undefined): InquiryTab {
  if (value === "history" || value === "faq" || value === "notice") return value;
  return "write";
}

async function InquiryPageContent(props: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/inquiry");
  }

  const { tab: tabParam, page: pageParam } = await props.searchParams;
  const initialTab = parseTab(tabParam);
  const noticePage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const defaultEmail =
    typeof session.user.email === "string" ? session.user.email : "";

  const dataSource = await initializeDatabase();
  const [faqs, noticeList] = await Promise.all([
    listFaqs(dataSource),
    listBoardPosts(dataSource, {
      category: "N",
      page: noticePage,
      pageSize: PAGE_SIZE_BOARD,
      searchField: "title",
      searchQuery: "",
    }),
  ]);

  return (
    <InquiryPageClient
      defaultEmail={defaultEmail}
      faqs={faqs.map(({ id, question, answer }) => ({ id, question, answer }))}
      noticePosts={noticeList.posts.map((post) => ({
        id: post.id,
        title: post.title,
        nickname: post.nickname,
        createdAt: post.createdAt.toISOString(),
        commentCount: post.commentCount,
        isPinned: post.isPinned,
        isReleasePinned: post.isReleasePinned,
        noticeCategory: post.noticeCategory,
        rowNumber: post.rowNumber,
      }))}
      noticePage={noticeList.currentPage}
      noticeTotalPages={noticeList.totalPages}
      initialTab={initialTab}
    />
  );
}

export default function InquiryPage(props: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50/70 text-sm text-[var(--color-text-secondary)]">
          불러오는 중...
        </div>
      }
    >
      <InquiryPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}
