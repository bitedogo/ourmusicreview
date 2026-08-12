/** 리뷰 작성 서버 진입 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";

const ReviewWriteClient = dynamic(() =>
  import("./write-client").then((mod) => mod.ReviewWriteClient)
);

export default async function ReviewWritePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/review/write");
  }

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
          <p className="text-[var(--color-text-secondary)]">에디터를 불러오는 중...</p>
        </div>
      }
    >
      <ReviewWriteClient />
    </Suspense>
  );
}
