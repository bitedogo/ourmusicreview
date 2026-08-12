"use client";
/** 커뮤니티 글쓰기 클라이언트 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TuiEditor, TuiEditorRef } from "@/src/components/common/TuiEditor";
import {
  createCommunityPost,
  fetchCommunityPost,
  updateCommunityPost,
} from "@/src/lib/community/client-api";
import { NOTICE_CATEGORY_OPTIONS } from "@/src/lib/community/notice-category";
import type { NoticeCategory } from "@/src/lib/community/types";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { isEditorContentEmpty } from "@/src/lib/utils/editor";
import { CategorySelector, type WriteCategory } from "./CategorySelector";
import { AdminPostToggles } from "./AdminPostToggles";

type Category = WriteCategory;

const VALID_CATEGORIES: Category[] = ["K", "I", "M", "W", "N"];

export function CommunityWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const initialCategoryParam = searchParams.get("category");
  const editPostId = searchParams.get("edit");

  const hasLockedCategory =
    initialCategoryParam != null && VALID_CATEGORIES.includes(initialCategoryParam as Category);
  const isCategoryLocked = hasLockedCategory || Boolean(editPostId);
  const initialCategory: Category =
    hasLockedCategory
      ? (initialCategoryParam as Category)
      : "K";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [noticeCategory, setNoticeCategory] = useState<NoticeCategory>("RELEASE_NOTE");
  const [isGlobal, setIsGlobal] = useState(false);
  const [isRelease, setIsRelease] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editPostId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<TuiEditorRef>(null);
  const contentToLoadRef = useRef<string | null>(null);

  const handleEditorReady = useCallback(() => {
    if (contentToLoadRef.current) {
      editorRef.current?.setHTML(contentToLoadRef.current);
      contentToLoadRef.current = null;
    }
  }, []);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  useEffect(() => {
    if (!editPostId) return;

    async function fetchPost() {
      if (!editPostId) return;
      try {
        const data = await fetchCommunityPost(editPostId);
        const post = data.data.post;
        setTitle(post.title);
        setCategory(post.category);
        setNoticeCategory(
          NOTICE_CATEGORY_OPTIONS.some((o) => o.value === post.noticeCategory)
            ? (post.noticeCategory as NoticeCategory)
            : "RELEASE_NOTE"
        );
        setIsGlobal(post.isGlobal === "Y");
        setIsRelease(
          post.category !== "N" && post.noticeCategory === "RELEASE_NOTE"
        );
        contentToLoadRef.current = post.content;
        handleEditorReady();
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "게시글을 불러오는 중 오류가 발생했습니다.")
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchPost();
  }, [editPostId, handleEditorReady]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const trimmedTitle = title.trim();
    const htmlContent = editorRef.current?.getHTML() || "";
    const trimmedContent = htmlContent.trim();

    if (!trimmedTitle || isEditorContentEmpty(trimmedContent)) {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (category === "N" && !noticeCategory) {
      setErrorMessage("공지사항 카테고리를 선택해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: trimmedTitle,
        content: trimmedContent,
        category,
        isGlobal,
        ...(isAdmin && (category === "K" || category === "I")
          ? { isRelease }
          : {}),
        ...(category === "N" && { noticeCategory }),
      };

      const data = editPostId
        ? await updateCommunityPost(editPostId, payload)
        : await createCommunityPost(payload);

      const postId = editPostId || data.data.id;
      if (postId) {
        router.push(`/community/${encodeURIComponent(postId)}`);
        router.refresh();
      } else {
        const categoryPath =
          {
            K: "domestic",
            I: "overseas",
            M: "market",
            W: "workroom",
            N: "notice",
          }[category] || "domestic";
        router.push(`/boards/${categoryPath}`);
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          `글 ${editPostId ? "수정" : "작성"}에 실패했습니다.`
        )
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
        <p className="text-[var(--color-text-secondary)]">데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1">
          <CategorySelector
            category={category}
            isCategoryLocked={isCategoryLocked}
            noticeCategory={noticeCategory}
            onCategoryChange={setCategory}
            onNoticeCategoryChange={setNoticeCategory}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            제목
          </label>
          <div className="flex gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-zinc-400"
              placeholder="제목을 입력해주세요"
            />
            {isAdmin && category !== "N" && (
              <AdminPostToggles
                category={category}
                isGlobal={isGlobal}
                isRelease={isRelease}
                onIsGlobalChange={setIsGlobal}
                onIsReleaseChange={setIsRelease}
              />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            내용
          </label>
          <TuiEditor
            ref={editorRef}
            height="400px"
            onReady={handleEditorReady}
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
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? "처리 중..." : (editPostId ? "수정완료" : "등록하기")}
          </button>
        </div>
      </form>
    </div>
  );
}
