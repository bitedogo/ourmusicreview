"use client";

import Link from "next/link";
import { getBoardCategoryLabel } from "@/src/lib/community/board-config";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import { useAuthenticatedFetch } from "@/src/hooks/use-authenticated-fetch";

interface MyPost {
  id: string;
  title: string;
  category: "K" | "I" | "M" | "W" | "N";
  isGlobal: "Y" | "N";
  createdAt: string;
  commentCount: number;
}

interface MyPostsResponse {
  ok: boolean;
  data: {
    posts: MyPost[];
  };
}

export default function MyPostsPage() {
  const { data, isLoading, error } = useAuthenticatedFetch<MyPostsResponse>(
    "/api/profile/posts",
    "/profile/posts"
  );
  const posts = data?.data.posts ?? [];

  return (
    <ProfileListPageLayout
      title="내가 작성한 게시글"
      description="국내/해외/장터/워크룸/공지사항 게시글을 확인할 수 있습니다."
      isLoading={isLoading}
      error={error}
      emptyMessage="아직 작성한 게시글이 없습니다."
      isEmpty={posts.length === 0}
      loadingMessage="게시글을 불러오는 중..."
    >
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/community/${encodeURIComponent(post.id)}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                    {getBoardCategoryLabel(post.category)}
                  </span>
                  {post.isGlobal === "Y" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      상단고정
                    </span>
                  )}
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{post.title}</p>
              </div>
              <div className="shrink-0 text-right text-[11px] text-zinc-500">
                <p>
                  댓글 <span className="font-semibold text-zinc-700">{post.commentCount}</span>
                </p>
                <p className="mt-0.5">{new Date(post.createdAt).toLocaleDateString("ko-KR")}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ProfileListPageLayout>
  );
}
