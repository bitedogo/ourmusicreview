"use client";
/** 추천(좋아요)한 게시글 목록 페이지 */

import Link from "next/link";
import { getBoardCategoryLabel } from "@/src/lib/community/board-config";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import { useAuthenticatedFetch } from "@/src/hooks/use-authenticated-fetch";

interface LikedPost {
  likeId: string;
  likedAt: string;
  id: string;
  title: string;
  category: "K" | "I" | "M" | "W" | "N";
  isGlobal: "Y" | "N";
  createdAt: string;
  commentCount: number;
}

interface LikedPostsResponse {
  ok: boolean;
  data: {
    posts: LikedPost[];
  };
}

export default function LikedPostsPage() {
  const { data, isLoading, error } = useAuthenticatedFetch<LikedPostsResponse>(
    "/api/profile/liked-posts",
    "/profile/liked-posts"
  );
  const posts = data?.data.posts ?? [];

  return (
    <ProfileListPageLayout
      title="추천한 글"
      description="좋아요한 커뮤니티 게시글을 확인할 수 있습니다."
      isLoading={isLoading}
      error={error}
      emptyMessage="아직 추천한 글이 없습니다."
      isEmpty={posts.length === 0}
      loadingMessage="추천한 글을 불러오는 중..."
    >
      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.likeId}
            href={`/community/${encodeURIComponent(post.id)}`}
            className="block rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-primary)]">
                    {getBoardCategoryLabel(post.category)}
                  </span>
                  {post.isGlobal === "Y" && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                      상단고정
                    </span>
                  )}
                </div>
                <p className="line-clamp-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {post.title}
                </p>
              </div>
              <div className="shrink-0 text-right text-[11px] text-[var(--color-text-secondary)]">
                <p>
                  댓글{" "}
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {post.commentCount}
                  </span>
                </p>
                <p className="mt-0.5">
                  추천일 {new Date(post.likedAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </ProfileListPageLayout>
  );
}
