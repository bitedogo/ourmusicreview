"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { InteractionButtons } from "@/src/components/interaction/InteractionButtons";
import { CommentSection } from "@/src/components/interaction/CommentSection";

interface PostContentClientProps {
  content: string;
  postId: string;
  userId: string;
  category: string;
  isNotice?: boolean;
}

export function PostContentClient({ content, postId, userId, category, isNotice }: PostContentClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
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
        }[category as "K" | "I" | "M" | "W"] || "domestic";
        
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
      }[category as "K" | "I" | "M" | "W"] || "domestic";
      router.push(`/boards/${categoryPath}`);
    }
  };

  return (
    <div className="space-y-10">
      <section className="text-[15px] leading-relaxed text-zinc-800">
        <HtmlRenderer html={content} />
      </section>

      {isOwner && (
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-50">
          <button
            onClick={() => router.push(`/community/write?edit=${postId}`)}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-900 transition-colors"
          >
            수정
          </button>
          <button
            onClick={handleDelete}
            className="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors"
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
