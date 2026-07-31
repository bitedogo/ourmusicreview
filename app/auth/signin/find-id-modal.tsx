"use client";

import { useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface FindIdModalProps {
  onClose: () => void;
  onOpenFindPassword: () => void;
}

const inputClassName =
  "h-[34px] min-w-0 flex-1 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none placeholder:text-[12px] focus:border-zinc-400 sm:h-[39px] sm:w-[324px] sm:flex-none sm:rounded-xl sm:px-3 sm:text-sm sm:placeholder:text-[14px]";

export function FindIdModal({ onClose, onOpenFindPassword }: FindIdModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const modalSizeClass = sent ? "h-[240px] sm:h-[260px]" : "h-[200px] sm:h-[210px]";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSent(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("이메일을 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      await fetchJson("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setSent(true);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "아이디 찾기 중 오류가 발생했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative flex w-full max-w-[446px] flex-col rounded-[15px] border border-zinc-200 bg-white px-5 py-5 shadow-xl sm:px-8 sm:py-6 ${modalSizeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="shrink-0 text-[16px] font-semibold text-zinc-900 sm:text-[18px]">아이디 찾기</h3>

        {sent ? (
          <>
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <p className="text-[13px] leading-5 text-zinc-600 sm:text-sm sm:leading-6">
                등록된 이메일이면 아이디 안내 메일을 보냈습니다.
                <br />
                메일함을 확인해 주세요.
              </p>
            </div>
            <div className="mt-auto flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={onOpenFindPassword}
                className="text-[13px] font-semibold text-zinc-900"
              >
                비밀번호 재설정
              </button>
              <button
                type="button"
                onClick={onClose}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[var(--color-brand-primary)] text-[13px] font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">E-mail</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className={inputClassName}
                  placeholder="가입 시 등록한 이메일을 입력해주세요."
                />
              </label>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <div className="mt-auto flex shrink-0 items-center justify-between">
              <button type="button" onClick={onClose} className="text-[13px] font-semibold text-zinc-900">
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[var(--color-brand-primary)] text-[13px] font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submitting ? "처리 중..." : "다음"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
