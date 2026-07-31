"use client";
/** 비밀번호 재설정 — 인증번호 + 새 비밀번호 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { normalizeOtpInput } from "@/src/lib/auth/otp-input";
import { validatePassword } from "@/src/lib/auth/validation";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email")?.trim() ?? "");
  const [id, setId] = useState(searchParams.get("id")?.trim() ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setSubmitting(true);
    try {
      await fetchJson("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          id: id.trim(),
          code,
          password,
        }),
      });
      setDone(true);
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "비밀번호 재설정에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">비밀번호 재설정</h1>
      <p className="mb-8 text-sm text-zinc-600">
        메일로 받은 인증번호와 새 비밀번호를 입력해 주세요.
      </p>

      {done ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...
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
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">아이디</span>
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#43A7B2]"
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
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">새 비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#43A7B2]"
              autoComplete="new-password"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">새 비밀번호 확인</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#43A7B2]"
              autoComplete="new-password"
              required
            />
          </label>
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
            {submitting ? "처리 중..." : "비밀번호 변경"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">
          불러오는 중...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
