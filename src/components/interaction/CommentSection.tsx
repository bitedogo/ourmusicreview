"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { UserProfileModal } from "@/components/user-profile-modal";

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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenProfileModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = postId ? `postId=${postId}` : `reviewId=${reviewId}`;
      const response = await fetch(`/api/comments?${query}`);
      const data = await response.json();
      if (data.ok) {
        setComments(data.data?.comments ?? []);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [postId, reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

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

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-xs text-zinc-400">불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="text-center text-xs text-zinc-400 py-10">첫 번째 댓글을 남겨보세요.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <button
                type="button"
                onClick={() => handleOpenProfileModal(comment.user.id)}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100"
                aria-label={`${comment.user.nickname} 프로필 보기`}
              >
                {comment.user.profileImage ? (
                  <Image
                    src={comment.user.profileImage}
                    alt=""
                    width={32}
                    height={32}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
                    {comment.user.nickname.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProfileModal(comment.user.id)}
                      className="text-xs font-bold text-zinc-900 hover:underline"
                    >
                      {comment.user.nickname}
                    </button>
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
              className="rounded-full bg-[var(--color-brand-primary)] px-5 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:bg-zinc-200"
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

      <UserProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </section>
  );
}
