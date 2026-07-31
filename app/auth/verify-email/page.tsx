"use client";
/** 회원가입 이메일 인증번호 입력 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { normalizeOtpInput } from "@/src/lib/auth/otp-input";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email")?.trim() ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(
    initialEmail ? "이메일로 보낸 인증번호 6자리를 입력해 주세요." : null
  );
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await fetchJson("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      setDone(true);
      setTimeout(() => router.push("/auth/signin?verified=1"), 1200);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "인증에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    setResending(true);
    try {
      await fetchJson("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      setInfo("인증번호를 다시 보냈습니다. 메일함을 확인해 주세요.");
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "재발송에 실패했습니다."));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">이메일 인증</h1>
      <p className="mb-8 text-sm text-zinc-600">
        메일로 받은 인증번호를 입력하면 가입이 완료됩니다.
      </p>

      {done ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          인증이 완료되었습니다. 로그인 페이지로 이동합니다...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#43A7B2]"
              autoComplete="email"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">인증번호</span>
            <input
              value={code}
              onChange={(event) => setCode(normalizeOtpInput(event.target.value))}
              inputMode="numeric"
              maxLength={6}
              placeholder="6자리 숫자"
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-center text-lg tracking-[0.35em] outline-none focus:border-[#43A7B2]"
              autoComplete="one-time-code"
              required
            />
          </label>
          {info && <p className="text-sm text-emerald-600">{info}</p>}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {submitting ? "확인 중..." : "인증 완료"}
          </button>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || !email.trim()}
            className="w-full text-sm font-medium text-[#43A7B2] underline disabled:text-zinc-400"
          >
            {resending ? "재발송 중..." : "인증번호 다시 받기"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-zinc-600">
        <Link
          className="font-medium text-[var(--color-brand-primary)] underline"
          href="/auth/signin"
        >
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          불러오는 중...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
