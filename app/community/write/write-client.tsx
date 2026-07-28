"use client";
/** 커뮤니티 글쓰기 클라이언트 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TuiEditor, TuiEditorRef } from "@/src/components/common/TuiEditor";
import type { NoticeCategory } from "@/src/lib/community/types";
import { NOTICE_CATEGORY_OPTIONS } from "@/src/lib/community/notice-category";
import { isEditorContentEmpty } from "@/src/lib/utils/editor";
import { isAllowedAudioFile, MAX_AUDIO_SIZE_BYTES } from "@/src/lib/audio";
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
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editPostId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<TuiEditorRef>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
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
      try {
        const response = await fetch(`/api/community/posts/${editPostId}`);
        const data = await response.json();

        if (data.ok && data.data?.post) {
          setTitle(data.data.post.title);
          setCategory(data.data.post.category);
          setNoticeCategory(
            NOTICE_CATEGORY_OPTIONS.some((o) => o.value === data.data.post.noticeCategory)
              ? data.data.post.noticeCategory
              : "RELEASE_NOTE"
          );
          setIsGlobal(data.data.post.isGlobal === "Y");
          setIsRelease(
            data.data.post.category !== "N" &&
              data.data.post.noticeCategory === "RELEASE_NOTE"
          );
          contentToLoadRef.current = data.data.post.content;
          handleEditorReady();
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
          ...(isAdmin && (category === "K" || category === "I")
            ? { isRelease }
            : {}),
          ...(category === "N" && { noticeCategory }),
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

      const postId = editPostId || data?.data?.id;
      if (postId) {
        router.push(`/community/${encodeURIComponent(postId)}`);
        router.refresh();
      } else {
        const categoryPath = {
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
        error instanceof Error
          ? `요청 중 오류가 발생했습니다: ${error.message}`
          : "요청 중 알 수 없는 오류가 발생했습니다."
      );
      setIsSubmitting(false);
    }
  }

  const handleAudioUpload = useCallback(async (file: File | null) => {
    if (!file) {
      return;
    }

    if (!isAllowedAudioFile(file)) {
      setErrorMessage("음원 파일은 MP3, WAV만 업로드할 수 있습니다.");
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setErrorMessage("음원 파일 용량은 20MB 이하여야 합니다.");
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
      return;
    }

    setErrorMessage(null);
    setIsUploadingAudio(true);
    try {
      const formData = new FormData();
      formData.append("audioFile", file);

      const response = await fetch("/api/upload/audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok || !data?.data?.url) {
        setErrorMessage(data?.error ?? "음원 업로드에 실패했습니다.");
        return;
      }

      const currentHtml = editorRef.current?.getHTML() ?? "";
      const audioHtml = `<p><audio controls preload="metadata" src="${data.data.url}"></audio></p>`;
      editorRef.current?.setHTML(`${currentHtml}${audioHtml}`);
    } catch {
      setErrorMessage("음원 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploadingAudio(false);
      if (audioInputRef.current) {
        audioInputRef.current.value = "";
      }
    }
  }, []);

  const handleAudioToolClick = useCallback(() => {
    if (isUploadingAudio) {
      return;
    }
    audioInputRef.current?.click();
  }, [isUploadingAudio]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center">
        <p className="text-zinc-500">데이터를 불러오는 중...</p>
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
          <label className="text-xs font-medium text-zinc-600">
            내용
          </label>
          <input
            ref={audioInputRef}
            type="file"
            accept=".mp3,.wav,audio/mpeg,audio/wav"
            className="hidden"
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              void handleAudioUpload(selectedFile);
            }}
          />
          <TuiEditor
            ref={editorRef}
            height="400px"
            showAudioTool={category === "W"}
            isAudioUploading={isUploadingAudio}
            onAudioToolClick={handleAudioToolClick}
            onReady={handleEditorReady}
          />
          {category === "W" && isUploadingAudio && (
            <p className="text-xs text-zinc-500">음원 업로드 중...</p>
          )}
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
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? "처리 중..." : (editPostId ? "수정완료" : "등록하기")}
          </button>
        </div>
      </form>
    </div>
  );
}
