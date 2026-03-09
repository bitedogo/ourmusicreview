"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { TuiEditor, TuiEditorRef } from "@/src/components/common/TuiEditor";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface ReviewData {
  id: string;
  content: string;
  rating: number;
  userId: string;
  albumId: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  };
}

interface ReviewDetailResponse {
  ok: boolean;
  review: ReviewData;
}

export function ReviewEditClient({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [review, setReview] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editorRef = useRef<TuiEditorRef>(null);

  useEffect(() => {
    async function fetchReview() {
      try {
        const data = await fetchJson<ReviewDetailResponse>(
          `/api/reviews/${encodeURIComponent(reviewId)}`
        );
        const r = data?.review;
        if (r) {
          setReview(r);
          setRating(r.rating ?? 0);
        }
      } catch (err) {
        setError(getApiErrorMessage(err, "리뷰를 불러오는 중 오류가 발생했습니다."));
      } finally {
        setIsLoading(false);
      }
    }

    fetchReview();
  }, [reviewId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!review) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const htmlContent = editorRef.current?.getHTML() || "";
    const trimmedContent = htmlContent.trim();

    if (!trimmedContent || trimmedContent === "<p><br></p>") {
      setErrorMessage("리뷰 내용을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      await fetchJson<{ ok: boolean }>(`/api/reviews/${encodeURIComponent(reviewId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmedContent,
          rating,
        }),
      });

      router.push(`/review/${encodeURIComponent(reviewId)}`);
      router.refresh();
    } catch (err) {
      setErrorMessage(getApiErrorMessage(err, "요청 중 오류가 발생했습니다."));
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">리뷰를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const isOwner =
    session?.user?.id === review?.userId ||
    (session?.user as { role?: string })?.role === "ADMIN";

  if (review && !isOwner) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          이 리뷰를 수정할 권한이 없습니다.
        </div>
        <Link
          href={`/review/${encodeURIComponent(reviewId)}`}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          리뷰로 돌아가기
        </Link>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "리뷰를 찾을 수 없습니다."}
        </div>
        <Link
          href={`/review/${encodeURIComponent(reviewId)}`}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          리뷰로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <Link
          href={`/review/${encodeURIComponent(reviewId)}`}
          className="mb-4 flex w-fit items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
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
          리뷰로 돌아가기
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">리뷰 수정</h1>
      </section>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex gap-4">
          {review.album.imageUrl && (
            <div className="shrink-0">
              <Image
                src={review.album.imageUrl}
                alt={review.album.title}
                width={96}
                height={96}
                unoptimized
                className="h-24 w-24 rounded-xl object-contain"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-zinc-900 truncate">
              {review.album.title}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 truncate">
              {review.album.artist}
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
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
              className="flex-1"
            />
            <span
              className={`text-sm font-semibold w-12 text-center ${rating >= 9 ? "text-red-600" : "text-zinc-900"}`}
            >
              {rating.toFixed(1)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-600">
            리뷰 내용
          </label>
          <TuiEditor
            ref={editorRef}
            initialValue={review.content}
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
          <Link
            href={`/review/${encodeURIComponent(reviewId)}`}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-500"
          >
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </button>
        </div>
      </form>
    </div>
  );
}
