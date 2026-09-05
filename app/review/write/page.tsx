/** 리뷰 작성 서버 진입 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";

const ReviewWriteClient = dynamic(() =>
  import("./write-client").then((mod) => mod.ReviewWriteClient)
);

type SearchParams = Record<string, string | string[] | undefined>;

function buildWriteCallbackUrl(searchParams: SearchParams): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string" && value.length > 0) {
      params.set(key, value);
    } else if (Array.isArray(value) && typeof value[0] === "string") {
      params.set(key, value[0]);
    }
  }
  const query = params.toString();
  return query ? `/review/write?${query}` : "/review/write";
}

export default async function ReviewWritePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  if (!session?.user?.id) {
    const callbackUrl = buildWriteCallbackUrl(resolvedSearchParams);
    redirect(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
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
