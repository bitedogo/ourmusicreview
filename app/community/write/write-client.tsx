"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { TuiEditor, TuiEditorRef } from "@/src/components/common/TuiEditor";

type Category = "K" | "I" | "M" | "W";

export function CommunityWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const initialCategoryParam = searchParams.get("category");
  const editPostId = searchParams.get("edit"); // 수정 모드 확인

  const hasLockedCategory =
    initialCategoryParam === "K" ||
    initialCategoryParam === "I" ||
    initialCategoryParam === "M" ||
    initialCategoryParam === "W";
  const initialCategory: Category =
    hasLockedCategory
      ? (initialCategoryParam as Category)
      : "K";

  const [title, setTitle] = useState("");
  const [, setContent] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [isGlobal, setIsGlobal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editPostId); // 수정 모드일 때 로딩 상태
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<TuiEditorRef>(null);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (!editPostId) return;

    async function fetchPost() {
      try {
        const response = await fetch(`/api/community/posts/${editPostId}`);
        const data = await response.json();

        if (data.ok && data.post) {
          setTitle(data.post.title);
          setCategory(data.post.category);
          setIsGlobal(data.post.isGlobal === "Y");
          // 에디터에 내용 설정 (에디터가 마운트된 후 실행되도록 지연)
          setTimeout(() => {
            editorRef.current?.setHTML(data.post.content);
          }, 500);
        } else {
          setErrorMessage("게시글을 불러올 수 없습니다.");
        }
      } catch {
        setErrorMessage("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [editPostId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const htmlContent = editorRef.current?.getHTML() || "";
    const trimmedContent = htmlContent.trim();

    if (!trimmedTitle || !trimmedContent || trimmedContent === "<p><br></p>") {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editPostId 
        ? `/api/community/posts/${editPostId}` 
        : "/api/community/posts";
      const method = editPostId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: trimmedTitle,
          content: trimmedContent,
          category,
          isGlobal,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setErrorMessage(
          data?.error ??
            `글 ${editPostId ? "수정" : "작성"}에 실패했습니다. (status: ${response.status})`
        );
        setIsSubmitting(false);
        return;
      }

      const postId = editPostId || data.id;
      if (postId) {
        router.push(`/community/${encodeURIComponent(postId)}`);
        router.refresh(); // 데이터 갱신 보장
      } else {
        const categoryPath = {
          K: "domestic",
          I: "overseas",
          M: "market",
          W: "workroom",
        }[category] || "domestic";
        router.push(`/boards/${categoryPath}`);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `요청 중 오류가 발생했습니다: ${error.message}`
          : "요청 중 알 수 없는 오류가 발생했습니다."
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
        <p className="text-zinc-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          {editPostId ? "게시글 수정" : "글쓰기"}
        </h1>
        <p className="text-xs text-zinc-500">자유롭게 이야기를 남겨보세요.</p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        {/* 카테고리 / 게시판 표시 */}
        <div className="space-y-1">
          {hasLockedCategory ? (
            <p className="text-lg font-semibold text-zinc-900">
              {category === "K" && "국내게시판"}
              {category === "I" && "해외게시판"}
              {category === "M" && "장터게시판"}
              {category === "W" && "워크룸"}
            </p>
          ) : (
            <>
              <label className="text-xs font-medium text-zinc-600">
                카테고리
              </label>
              <div className="inline-flex flex-wrap gap-1 text-xs text-zinc-600">
                <button
                  type="button"
                  onClick={() => setCategory("K")}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold border",
                    category === "K"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  국내게시판
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("I")}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold border",
                    category === "I"
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  해외게시판
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("M")}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold border",
                    category === "M"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  장터게시판
                </button>
                <button
                  type="button"
                  onClick={() => setCategory("W")}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold border",
                    category === "W"
                      ? "bg-orange-600 text-white border-orange-600"
                      : "border-zinc-200 text-zinc-500 hover:text-zinc-800",
                  ].join(" ")}
                >
                  워크룸
                </button>
              </div>
            </>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            제목
          </label>
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              placeholder="제목을 입력해주세요"
            />
            {isAdmin && (
              <label className="flex shrink-0 items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isGlobal}
                  onChange={(e) => setIsGlobal(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-black focus:ring-black"
                />
                <span className="text-xs font-bold text-red-600">전체 공지</span>
              </label>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            내용
          </label>
          <TuiEditor
            ref={editorRef}
            height="400px"
            onChange={(html) => setContent(html)}
          />
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            {errorMessage}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? "처리 중..." : (editPostId ? "수정완료" : "등록하기")}
          </button>
        </div>
      </form>
    </div>
  );
}
