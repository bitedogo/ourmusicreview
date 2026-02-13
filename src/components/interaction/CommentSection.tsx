"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

interface CommentSectionProps {
  postId?: string;
  reviewId?: string;
}

export function CommentSection({ postId, reviewId }: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const query = postId ? `postId=${postId}` : `reviewId=${reviewId}`;
      const response = await fetch(`/api/comments?${query}`);
      const data = await response.json();
      if (data.ok) {
        setComments(data.comments);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, reviewId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        setContent("");
        fetchComments();
      } else {
        alert(data.error || "댓글 작성에 실패했습니다.");
      }
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.ok) {
        fetchComments();
      } else {
        alert(data.error || "댓글 삭제에 실패했습니다.");
      }
    } catch {
    }
  };

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">댓글</h3>
        <span className="text-xs text-zinc-400">{comments.length}</span>
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-xs text-zinc-400">불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-zinc-400 py-10">첫 번째 댓글을 남겨보세요.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100">
                {comment.user.profileImage ? (
                  <img src={comment.user.profileImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
                    {comment.user.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{comment.user.nickname}</span>
                    <span className="text-[10px] text-zinc-400">
                      {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                  {(session?.user?.id === comment.user.id || (session?.user as { role?: string })?.role === "ADMIN") && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-[10px] text-zinc-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 댓글 작성 폼 */}
      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3 pt-6 border-t border-zinc-50">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨보세요..."
            className="w-full min-h-[80px] rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-zinc-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="rounded-full bg-black px-5 py-2 text-xs font-bold text-white transition hover:bg-zinc-800 disabled:bg-zinc-200"
            >
              {isSubmitting ? "작성 중..." : "등록"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="text-xs text-zinc-500">로그인 후 댓글을 남길 수 있습니다.</p>
        </div>
      )}
    </section>
  );
}
