"use client";
/** 게시판 피드 — 목록에서 짧은 글 바로 쓰기 */

import { useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";
import { createCommunityPost } from "@/src/lib/community/client-api";
import type { PostCategory } from "@/src/lib/db/entities/Post";
import { ApiClientError, getApiErrorMessage } from "@/src/lib/http/client";
import { plainTextToEditorHtml } from "@/src/lib/utils/editor";
import { BoardFeedAvatar } from "./board-feed-avatar";

interface BoardFeedComposerProps {
  category: PostCategory;
  writeHref: string;
}

function goToLogin(router: ReturnType<typeof useRouter>) {
  if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
    router.push(buildSigninHref(getCurrentReturnPath()));
  }
}

export function BoardFeedComposer({
  category,
  writeHref,
}: BoardFeedComposerProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const userId = session?.user?.id ?? null;
  const nickname = session?.user?.name?.trim() || "나";
  const profileImage =
    session?.user?.profileImage ?? session?.user?.image ?? null;
  const canSubmit =
    Boolean(title.trim()) && Boolean(body.trim()) && !isSubmitting;

  function ensureSignedIn(): boolean {
    if (session?.user?.id) return true;
    goToLogin(router);
    return false;
  }

  function handleFieldFocus(
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    if (status === "loading") return;
    if (!session?.user?.id) {
      event.currentTarget.blur();
      goToLogin(router);
      return;
    }
    setExpanded(true);
  }

  async function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (isSubmitting) return;
    if (!ensureSignedIn()) return;

    const trimmedTitle = title.trim();
    const content = plainTextToEditorHtml(body.trim());
    if (!trimmedTitle || !content) {
      setErrorMessage("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await createCommunityPost({
        title: trimmedTitle.slice(0, 200),
        content,
        category,
      });
      setTitle("");
      setBody("");
      setExpanded(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        goToLogin(router);
      } else {
        setErrorMessage(
          getApiErrorMessage(error, "글 작성에 실패했습니다.")
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmitShortcut(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit();
    }
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    handleSubmitShortcut(event);
    if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setExpanded(true);
      bodyRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="grid grid-cols-[36px_minmax(0,1fr)] gap-2.5 px-1 py-3.5 sm:px-2"
    >
      <BoardFeedAvatar
        userId={userId}
        nickname={nickname}
        profileImage={profileImage}
      />
      <div className="min-w-0">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value.slice(0, 200))}
          onFocus={handleFieldFocus}
          onKeyDown={handleTitleKeyDown}
          maxLength={200}
          placeholder="어떤 이야기를 나눠볼까요?"
          className="w-full bg-transparent text-[16px] font-semibold leading-snug tracking-tight text-[var(--color-text-primary)] outline-none placeholder:font-normal placeholder:text-[var(--color-text-muted)]"
          aria-label="게시글 제목"
        />
        <div className="mt-2 border-t border-zinc-100 pt-2">
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(event) => setBody(event.target.value.slice(0, 4000))}
            onFocus={handleFieldFocus}
            onKeyDown={handleSubmitShortcut}
            rows={expanded || body ? 4 : 2}
            maxLength={4000}
            placeholder="앨범, 아티스트, 음악 등에 대한 이야기를 남겨보세요"
            className="w-full resize-none bg-transparent text-[14px] leading-relaxed text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
            aria-label="게시글 내용"
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Link
            href={writeHref}
            className="text-[12px] text-[var(--color-text-muted)] hover:underline"
          >
            자세히 쓰기
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {isSubmitting ? "게시 중" : "게시"}
          </button>
        </div>
        {errorMessage ? (
          <p className="mt-2 text-[12px] text-red-700">{errorMessage}</p>
        ) : null}
      </div>
    </form>
  );
}
