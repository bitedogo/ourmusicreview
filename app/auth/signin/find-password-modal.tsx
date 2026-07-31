"use client";

import { useState } from "react";
import { normalizeOtpInput, OTP_CODE_LENGTH } from "@/src/lib/auth/otp-input";
import { validatePassword } from "@/src/lib/auth/validation";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface FindPasswordModalProps {
  onClose: () => void;
}

type Step = "request" | "verify" | "reset" | "done";

const inputClassName =
  "h-[34px] min-w-0 flex-1 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none placeholder:text-[12px] focus:border-zinc-400 sm:h-[39px] sm:w-[324px] sm:flex-none sm:rounded-xl sm:px-3 sm:text-sm sm:placeholder:text-[14px]";

const modalSizeByStep: Record<Step, string> = {
  request: "h-[250px] sm:h-[268px]",
  verify: "h-[280px] sm:h-[300px]",
  reset: "h-[290px] sm:h-[310px]",
  done: "h-[240px] sm:h-[260px]",
};

export function FindPasswordModal({ onClose }: FindPasswordModalProps) {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedId = id.trim();
    if (!trimmedEmail || !trimmedId) {
      setError("이메일과 아이디를 모두 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      await fetchJson("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, id: trimmedId }),
      });
      setEmail(trimmedEmail);
      setId(trimmedId);
      setCode("");
      setStep("verify");
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, "비밀번호 재설정 중 오류가 발생했습니다.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await fetchJson("/api/auth/confirm-password-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, id, code }),
      });
      setPassword("");
      setPasswordConfirm("");
      setStep("reset");
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, "인증번호 확인 중 오류가 발생했습니다.")
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(event: React.FormEvent<HTMLFormElement>) {
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
        body: JSON.stringify({ email, id, code, password }),
      });
      setStep("done");
    } catch (submitError) {
      setError(
        getApiErrorMessage(submitError, "비밀번호 재설정에 실패했습니다.")
      );
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
        className={`relative flex w-full max-w-[446px] flex-col rounded-[15px] border border-zinc-200 bg-white px-5 py-5 shadow-xl sm:px-8 sm:py-6 ${modalSizeByStep[step]}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="shrink-0 text-[16px] font-semibold text-zinc-900 sm:text-[18px]">
          비밀번호 재설정
        </h3>

        {step === "done" ? (
          <>
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <p className="text-[13px] leading-5 text-zinc-600 sm:text-sm sm:leading-6">
                비밀번호가 변경되었습니다.
                <br />
                새 비밀번호로 로그인해 주세요.
              </p>
            </div>
            <div className="mt-auto flex shrink-0 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[var(--color-brand-primary)] text-[13px] font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
              >
                확인
              </button>
            </div>
          </>
        ) : step === "request" ? (
          <form onSubmit={handleRequest} className="flex min-h-0 flex-1 flex-col">
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <div className="space-y-3 sm:space-y-4">
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">
                    E-mail
                  </span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className={inputClassName}
                    placeholder="가입 시 등록한 이메일을 입력해주세요."
                  />
                </label>
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">
                    ID
                  </span>
                  <input
                    value={id}
                    onChange={(event) => setId(event.target.value)}
                    className={inputClassName}
                    placeholder="가입 시 등록한 아이디를 입력해주세요."
                  />
                </label>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <div className="mt-auto flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-[13px] font-semibold text-zinc-900"
              >
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
        ) : step === "verify" ? (
          <form onSubmit={handleVerify} className="flex min-h-0 flex-1 flex-col">
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <p className="mb-3 text-[12px] leading-5 text-zinc-600 sm:text-[13px] sm:leading-6">
                등록된 이메일로 인증번호를 보냈습니다.
                <br />
                메일함을 확인한 뒤 인증번호를 입력해 주세요.
              </p>
              <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">
                  인증
                </span>
                <input
                  value={code}
                  onChange={(event) => setCode(normalizeOtpInput(event.target.value))}
                  maxLength={OTP_CODE_LENGTH}
                  className={`${inputClassName} text-center tracking-[0.2em]`}
                  placeholder={`${OTP_CODE_LENGTH}자리 영문·숫자`}
                  autoComplete="one-time-code"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
              </label>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <div className="mt-auto flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("request");
                }}
                className="text-[13px] font-semibold text-zinc-900"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[var(--color-brand-primary)] text-[13px] font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submitting ? "확인 중..." : "확인"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex min-h-0 flex-1 flex-col">
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <div className="space-y-3 sm:space-y-4">
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-[52px] shrink-0 text-[12px] text-[#000000] sm:text-[13px]">
                    새 비밀번호
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className={inputClassName}
                    placeholder="새 비밀번호를 입력해주세요."
                    autoComplete="new-password"
                  />
                </label>
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-[52px] shrink-0 text-[12px] text-[#000000] sm:text-[13px]">
                    비밀번호 확인
                  </span>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(event) => setPasswordConfirm(event.target.value)}
                    className={inputClassName}
                    placeholder="새 비밀번호를 다시 입력해주세요."
                    autoComplete="new-password"
                  />
                </label>
              </div>
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>
            <div className="mt-auto flex shrink-0 items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep("verify");
                }}
                className="text-[13px] font-semibold text-zinc-900"
              >
                이전
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[var(--color-brand-primary)] text-[13px] font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submitting ? "처리 중..." : "변경"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
