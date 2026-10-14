import Link from "next/link";
import { communityDetail } from "@/src/lib/navigation/routes";

export function CannotEditPost({ postId }: { postId: string }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        이 게시글을 수정할 권한이 없습니다.
      </div>
      <Link
        href={communityDetail(postId)}
        className="w-fit rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
      >
        게시글로 돌아가기
      </Link>
    </div>
  );
}
