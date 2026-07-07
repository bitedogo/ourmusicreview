"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { InteractionButtons } from "@/src/components/interaction/InteractionButtons";
import { CommentSection } from "@/src/components/interaction/CommentSection";
import { PostAuthorRow } from "./post-author-row";

interface PostContentClientProps {
  content: string;
  postId: string;
  userId: string;
  category: string;
  isNotice?: boolean;
  initialViews: number;
  initialCommentCount: number;
  postAuthorNickname: string;
  postAuthorProfileImage: string | null;
  postCreatedAt: string;
}

function getTimeAgo(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}

export function PostContentClient({
  content,
  postId,
  userId,
  category,
  isNotice,
  initialViews,
  initialCommentCount,
  postAuthorNickname,
  postAuthorProfileImage,
  postCreatedAt,
}: PostContentClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [displayedViews, setDisplayedViews] = useState(initialViews);

  useEffect(() => {
    const hasIncremented = sessionStorage.getItem(`post-${postId}-view-incremented`);

    if (!hasIncremented) {
      sessionStorage.setItem(`post-${postId}-view-incremented`, "true");

      fetch(`/api/posts/${postId}/view`, {
        method: "POST",
      })
      .then(response => {
        if (response.ok) {
          setDisplayedViews(prev => prev + 1);
        }
      })
      .catch(() => {});
    }
  }, [postId]);
  const isOwner = session?.user?.id === userId || (session?.user as { role?: string })?.role === "ADMIN";

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/community/posts/${postId}`, {
        method: "DELETE",
      });
      
      let data;
      try {
        data = await response.json();
      } catch {
        data = { ok: response.ok };
      }

      if (data.ok) {
        alert("게시글이 삭제되었습니다.");
        const categoryPath = {
          K: "domestic",
          I: "overseas",
          M: "market",
          W: "workroom",
          N: "notice",
        }[category as "K" | "I" | "M" | "W" | "N"] || "domestic";

        router.push(`/boards/${categoryPath}`);
        router.refresh();
      } else {
        alert(data.error || "삭제에 실패했습니다.");
      }
    } catch {
      const categoryPath = {
        K: "domestic",
        I: "overseas",
        M: "market",
        W: "workroom",
        N: "notice",
      }[category as "K" | "I" | "M" | "W" | "N"] || "domestic";
      router.push(`/boards/${categoryPath}`);
    }
  };

  return (
    <div className="space-y-10">
      <PostAuthorRow
        userId={userId}
        nickname={postAuthorNickname}
        profileImage={postAuthorProfileImage}
        timeAgo={getTimeAgo(new Date(postCreatedAt))}
        views={displayedViews}
        commentCount={initialCommentCount}
      />

      <section className="text-[15px] leading-relaxed text-zinc-800">
        <HtmlRenderer html={content} />
      </section>

      {isOwner && (
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-50">
          <button
            onClick={() => router.push(`/community/write?edit=${postId}`)}
            className="text-xs font-medium text-zinc-400 hover:text-[var(--color-brand-primary)] transition-colors"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-medium text-zinc-400 hover:text-[var(--color-brand-primary)] transition-colors"
          >
            삭제
          </button>
        </div>
      )}

      <div className="pt-6 border-t border-zinc-50">
        <InteractionButtons postId={postId} isNotice={isNotice} authorUserId={userId} />
        <CommentSection postId={postId} />
      </div>
    </div>
  );
}
