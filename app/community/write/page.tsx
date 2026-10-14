/** 커뮤니티 글쓰기 서버 진입 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAppSession, isAdmin } from "@/src/lib/auth/session";
import { getCommunityPost } from "@/src/lib/community/community-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { boardPath } from "@/src/lib/navigation/routes";
import { CannotEditPost } from "./cannot-edit-post";

const CommunityWriteClient = dynamic(() =>
  import("./write-client").then((mod) => mod.CommunityWriteClient)
);

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CommunityWritePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[]; edit?: string | string[] }>;
}) {
  const session = await getAppSession();
  const query = await searchParams;
  const category = first(query.category)?.trim();
  const editPostId = first(query.edit)?.trim();

  const callbackQuery = new URLSearchParams();
  if (category) callbackQuery.set("category", category);
  if (editPostId) callbackQuery.set("edit", editPostId);
  const callbackPath = callbackQuery.size
    ? `/community/write?${callbackQuery.toString()}`
    : "/community/write";

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }

  const admin = isAdmin(session);

  if (category === "N" && !admin) {
    redirect(boardPath("notice"));
  }

  if (editPostId) {
    try {
      const dataSource = await initializeDatabase();
      const post = await getCommunityPost(dataSource, editPostId);
      if (post.category === "N" && !admin) {
        redirect(boardPath("notice"));
      }
      if (post.userId !== session?.user?.id && !admin) {
        return <CannotEditPost postId={editPostId} />;
      }
    } catch {
      /* 없는 글 등은 클라이언트에서 안내 */
    }
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">에디터를 불러오는 중...</p>
        </div>
      }
    >
      <CommunityWriteClient />
    </Suspense>
  );
}
