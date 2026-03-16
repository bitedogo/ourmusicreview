"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiClientError,
  fetchJson,
  getApiErrorMessage,
} from "@/src/lib/http/client";

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

function getBoardLabel(category: MyPost["category"]): string {
  const boardLabelMap: Record<MyPost["category"], string> = {
    K: "국내게시판",
    I: "해외게시판",
    M: "장터게시판",
    W: "워크룸",
    N: "공지사항",
  };
  return boardLabelMap[category];
}

export default function MyPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        setIsLoading(true);
        const data = await fetchJson<MyPostsResponse>("/api/profile/posts");
        setPosts(data.data.posts || []);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          router.push("/auth/signin?callbackUrl=/profile/posts");
          return;
        }
        setError(getApiErrorMessage(error, "게시글을 불러오는 중 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyPosts();
  }, [router]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          onClick={() => router.push("/profile")}
          className="mb-4 flex items-center gap-2 text-sm text-zinc-600 hover:text-[var(--color-brand-primary)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          마이페이지로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">내가 작성한 게시글</h1>
        <p className="text-xs text-zinc-500">
          국내/해외/장터/워크룸/공지사항 게시글을 확인할 수 있습니다.
        </p>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          게시글을 불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 작성한 게시글이 없습니다.
        </div>
      ) : (
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
                      {getBoardLabel(post.category)}
                    </span>
                    {post.isGlobal === "Y" && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                        상단고정
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {post.title}
                  </p>
                </div>
                <div className="shrink-0 text-right text-[11px] text-zinc-500">
                  <p>
                    댓글 <span className="font-semibold text-zinc-700">{post.commentCount}</span>
                  </p>
                  <p className="mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
