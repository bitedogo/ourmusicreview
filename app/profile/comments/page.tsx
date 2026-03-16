"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiClientError,
  fetchJson,
  getApiErrorMessage,
} from "@/src/lib/http/client";

interface CommentPostInfo {
  id: string;
  title: string;
  category: "K" | "I" | "M" | "W" | "N";
}

interface CommentReviewInfo {
  id: string;
  albumId: string;
  albumTitle: string | null;
  albumArtist: string | null;
}

interface MyComment {
  id: string;
  content: string;
  createdAt: string;
  targetType: "BOARD" | "REVIEW" | "UNKNOWN";
  post: CommentPostInfo | null;
  review: CommentReviewInfo | null;
}

interface MyCommentsResponse {
  ok: boolean;
  data: {
    comments: MyComment[];
  };
}

function getBoardLabel(category: CommentPostInfo["category"]): string {
  const boardLabelMap: Record<CommentPostInfo["category"], string> = {
    K: "국내게시판",
    I: "해외게시판",
    M: "장터게시판",
    W: "워크룸",
    N: "공지사항",
  };
  return boardLabelMap[category];
}

function getCommentHref(comment: MyComment): string | null {
  if (comment.targetType === "BOARD" && comment.post) {
    return `/community/${encodeURIComponent(comment.post.id)}`;
  }
  if (comment.targetType === "REVIEW" && comment.review) {
    return `/review/${encodeURIComponent(comment.review.id)}`;
  }
  return null;
}

export default function MyCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<MyComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyComments() {
      try {
        setIsLoading(true);
        const data = await fetchJson<MyCommentsResponse>("/api/profile/comments");
        setComments(data.data.comments || []);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          router.push("/auth/signin?callbackUrl=/profile/comments");
          return;
        }
        setError(getApiErrorMessage(error, "댓글을 불러오는 중 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchMyComments();
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
        <h1 className="text-xl font-semibold tracking-tight">내가 작성한 댓글</h1>
        <p className="text-xs text-zinc-500">
          게시판 댓글과 리뷰 댓글을 한 번에 확인할 수 있습니다.
        </p>
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          댓글을 불러오는 중...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          아직 작성한 댓글이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const href = getCommentHref(comment);

            return (
              <div
                key={comment.id}
                className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {comment.targetType === "BOARD" && comment.post ? (
                    <>
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                        게시판 댓글
                      </span>
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {getBoardLabel(comment.post.category)}
                      </span>
                    </>
                  ) : comment.targetType === "REVIEW" && comment.review ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      리뷰 댓글
                    </span>
                  ) : (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                      기타
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-500">
                    {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>

                <p className="line-clamp-2 text-sm text-zinc-800">{comment.content}</p>

                <div className="mt-2 text-xs text-zinc-500">
                  {comment.targetType === "BOARD" && comment.post ? (
                    <span className="line-clamp-1">게시글: {comment.post.title}</span>
                  ) : comment.targetType === "REVIEW" && comment.review ? (
                    <span className="line-clamp-1">
                      리뷰: {comment.review.albumArtist ?? "아티스트 정보 없음"} -{" "}
                      {comment.review.albumTitle ?? "앨범 정보 없음"}
                    </span>
                  ) : (
                    <span>연결된 원문 정보를 찾을 수 없습니다.</span>
                  )}
                </div>

                {href && (
                  <Link
                    href={href}
                    className="mt-3 inline-flex text-xs font-medium text-zinc-700 underline underline-offset-4 hover:text-[var(--color-brand-primary)]"
                  >
                    원문 보러가기
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
