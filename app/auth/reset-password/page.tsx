"use client";
/** 비밀번호 재설정 — 인증번호 선검증 후 새 비밀번호 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { normalizeOtpInput, OTP_CODE_LENGTH } from "@/src/lib/auth/otp-input";
import { validatePassword } from "@/src/lib/auth/validation";
import { fetchJson } from "@/src/lib/http/client";

type Step = "verify" | "reset" | "done";

const fieldClassName =
  "h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-[#43A7B2]";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("verify");
  const [email, setEmail] = useState(searchParams.get("email")?.trim() ?? "");
  const [id, setId] = useState(searchParams.get("id")?.trim() ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerifyCode() {
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedId = id.trim();
    if (!trimmedEmail || !trimmedId) {
      setError("이메일과 아이디를 모두 입력해주세요.");
      return;
    }
    if (code.length !== OTP_CODE_LENGTH) {
      setError(`인증번호 ${OTP_CODE_LENGTH}자리(영문·숫자)를 입력해주세요.`);
      return;
    }

    setVerifying(true);
    try {
      await fetchJson("/api/auth/confirm-password-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          id: trimmedId,
          code,
        }),
      });
      setEmail(trimmedEmail);
      setId(trimmedId);
      setPassword("");
      setPasswordConfirm("");
      setStep("reset");
    } catch {
      router.replace("/auth/signin");
    } finally {
      setVerifying(false);
    }
  }

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
      setStep("done");
      setTimeout(() => router.push("/auth/signin"), 1500);
    } catch {
      router.replace("/auth/signin");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">비밀번호 재설정</h1>
      <p className="mb-8 text-sm text-zinc-600">
        {step === "verify"
          ? "메일로 받은 인증번호를 입력한 뒤 확인해 주세요."
          : step === "reset"
            ? "새 비밀번호를 입력해 주세요."
            : "비밀번호가 변경되었습니다."}
      </p>

      {step === "done" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다...
        </div>
      ) : step === "verify" ? (
        <div className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">이메일</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClassName}
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">아이디</span>
            <input
              value={id}
              onChange={(event) => setId(event.target.value)}
              className={fieldClassName}
              required
            />
          </label>
          <div className="space-y-1.5">
            <span className="text-sm text-zinc-700">인증번호</span>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(event) => setCode(normalizeOtpInput(event.target.value))}
                maxLength={OTP_CODE_LENGTH}
                placeholder={`${OTP_CODE_LENGTH}자리 영문·숫자`}
                className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 text-center text-lg tracking-[0.2em] outline-none focus:border-[#43A7B2]"
                autoComplete="one-time-code"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={verifying || code.length !== OTP_CODE_LENGTH}
                className="h-11 shrink-0 rounded-xl border border-[var(--color-brand-primary)] px-4 text-sm font-medium text-[var(--color-brand-primary)] transition hover:bg-[#EAF6F7] disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-400"
              >
                {verifying ? "확인 중..." : "확인"}
              </button>
            </div>
          </div>
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {error}
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm text-zinc-700">새 비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldClassName}
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
              className={fieldClassName}
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
