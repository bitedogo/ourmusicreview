"use client";
/** 리뷰 작성 클라이언트 */

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef } from "react";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { TuiEditor, TuiEditorRef } from "@/src/components/common/TuiEditor";
import { isEditorContentEmpty } from "@/src/lib/utils/editor";
import Image from "next/image";
import { ApiClientError, fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { formatRating } from "@/src/lib/utils/rating";

export function ReviewWriteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const albumId = searchParams.get("albumId");
  const albumTitle = searchParams.get("title");
  const albumArtist = searchParams.get("artist");
  const albumImageUrl = searchParams.get("imageUrl");

  const [rating, setRating] = useState<number>(5);
  interface CreateReviewResponse {
    ok: boolean;
    data: {
      id: string;
    };
  }

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<TuiEditorRef>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (!albumId) {
      setErrorMessage("앨범 정보가 없습니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const htmlContent = editorRef.current?.getHTML() || "";
    const trimmedContent = htmlContent.trim();

    if (isEditorContentEmpty(trimmedContent)) {
      setErrorMessage("리뷰 내용을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await fetchJson<CreateReviewResponse>("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          albumId,
          content: trimmedContent,
          rating,
          albumTitle: albumTitle || undefined,
          albumArtist: albumArtist || undefined,
          albumImageUrl: albumImageUrl || null,
        }),
      });

      const reviewId = data.data?.id;
      if (reviewId) {
        router.push(`/review/${encodeURIComponent(reviewId)}`);
      } else {
        router.push("/");
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        router.back();
        return;
      }
      setErrorMessage(getApiErrorMessage(error, "리뷰 작성에 실패했습니다."));
      setIsSubmitting(false);
    }
  }

  if (!albumId) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          앨범 정보가 없습니다. 검색 페이지에서 다시 시도해주세요.
        </div>
        <button
          onClick={() => router.push("/search")}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
        >
          검색 페이지로 이동
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">리뷰 작성</h1>
        <p className="text-xs text-[var(--color-text-secondary)]">
          앨범에 대한 감상을 자유롭게 남겨보세요.
        </p>
      </section>

      {albumTitle && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex gap-4">
            {albumImageUrl && (
              <div className="shrink-0">
                <Image
                  src={albumImageUrl}
                  alt={albumTitle}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-xl object-contain"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {albumTitle}
              </h3>
              {albumArtist && (
                <p className="mt-1 truncate text-xs text-[var(--color-text-secondary)]">
                  <ArtistNameLink
                    name={albumArtist}
                    className="max-w-full truncate text-left text-xs text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                  />
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)]">
            평점 (0-10)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1 accent-[var(--color-brand-primary)]"
            />
            <span
              className="w-12 text-center text-sm font-semibold text-[var(--color-brand-primary)]"
            >
              {formatRating(rating)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <TuiEditor
            ref={editorRef}
            height="400px"
            showMediaTools={false}
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
            {isSubmitting ? "작성 중..." : "등록하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
