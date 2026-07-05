"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";

type ModalType = "find-id" | "find-password" | null;
interface FindIdResponse {
  ok: boolean;
  data: {
    id: string;
  };
}

interface FindPasswordResponse {
  ok: boolean;
  data: {
    temporaryPassword: string;
  };
}

export default function SigninPage() {
  const router = useRouter();
  const { status } = useSession();
  const callbackUrl = "/";
  const loginCallbackUrl = "/auth/signin";
  const savedIdKey = "oru.savedSigninId";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isRememberId, setIsRememberId] = useState(false);

  const [modal, setModal] = useState<ModalType>(null);
  const [findIdEmail, setFindIdEmail] = useState("");
  const [findIdSubmitting, setFindIdSubmitting] = useState(false);
  const [findIdError, setFindIdError] = useState<string | null>(null);
  const [foundId, setFoundId] = useState<string | null>(null);

  const [findPwEmail, setFindPwEmail] = useState("");
  const [findPwId, setFindPwId] = useState("");
  const [findPwSubmitting, setFindPwSubmitting] = useState(false);
  const [findPwError, setFindPwError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedId = window.localStorage.getItem(savedIdKey);
    if (savedId) {
      setId(savedId);
      setIsRememberId(true);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  function closeModal() {
    setModal(null);
    setFindIdEmail("");
    setFindIdError(null);
    setFoundId(null);
    setFindPwEmail("");
    setFindPwId("");
    setFindPwError(null);
    setTemporaryPassword(null);
  }

  async function handleFindIdSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFindIdSubmitting(true);
    setFindIdError(null);
    setFoundId(null);
    const trimmed = findIdEmail.trim();
    if (!trimmed) {
      setFindIdError("이메일을 입력해주세요.");
      setFindIdSubmitting(false);
      return;
    }
    try {
      const data = await fetchJson<FindIdResponse>("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setFoundId(data.data.id);
    } catch (error) {
      setFindIdError(getApiErrorMessage(error, "아이디 찾기 중 오류가 발생했습니다."));
    } finally {
      setFindIdSubmitting(false);
    }
  }

  async function handleFindPwSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFindPwSubmitting(true);
    setFindPwError(null);
    setTemporaryPassword(null);
    const trimmedEmail = findPwEmail.trim();
    const trimmedId = findPwId.trim();
    if (!trimmedEmail || !trimmedId) {
      setFindPwError("이메일과 아이디를 모두 입력해주세요.");
      setFindPwSubmitting(false);
      return;
    }
    try {
      const data = await fetchJson<FindPasswordResponse>("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, id: trimmedId }),
      });
      setTemporaryPassword(data.data.temporaryPassword);
    } catch (error) {
      setFindPwError(getApiErrorMessage(error, "비밀번호 찾기 중 오류가 발생했습니다."));
    } finally {
      setFindPwSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    const trimmedId = id.trim();

    if (typeof window !== "undefined") {
      if (isRememberId && trimmedId) {
        window.localStorage.setItem(savedIdKey, trimmedId);
      } else {
        window.localStorage.removeItem(savedIdKey);
      }
    }

    const result = await signIn("credentials", {
      redirect: false,
      id: trimmedId,
      password,
      callbackUrl,
    });

    if (!result || result.error) {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsSubmitting(false);
      return;
    }

    router.push(result.url ?? callbackUrl);
  }

  async function handleGoogleLogin() {
    const result = await signIn("google", { callbackUrl: loginCallbackUrl });
    if (result?.error) {
      setErrorMessage(result.error);
    } else if (!result?.url) {
      router.push(loginCallbackUrl);
    }
  }

  return (
    <div className="flex w-full flex-col items-center px-4 pb-16">
      <div className="flex w-full max-w-[var(--auth-form-width)] flex-col items-center pt-[var(--auth-logo-padding-top)]">
        <div className="mb-10 flex justify-center">
          <Link href="/" className="inline-flex shrink-0 items-center justify-center">
            <Image
              src={LOGO_SRC}
              alt={LOGO_ALT}
              width={141}
              height={72.9}
              className="h-[72.9px] w-[141px] object-contain"
              priority
            />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col">
          <label className="block">
            <div className="rounded-[var(--auth-field-radius)] border border-[var(--color-border)] bg-white shadow-[0_2px_4px_-2px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] focus-within:border-[var(--color-accent)]">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-[var(--auth-input-height)] w-full bg-transparent px-4 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                placeholder="Id"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="mt-3 block">
            <div className="rounded-[var(--auth-field-radius)] border border-[var(--color-border)] bg-white shadow-[0_2px_4px_-2px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] focus-within:border-[var(--color-accent)]">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="h-[var(--auth-input-height)] w-full bg-transparent px-4 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)]"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </label>

          <div className="mt-3 flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={isRememberId}
                onChange={(e) => setIsRememberId(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              />
              Save Id
            </label>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <button
                type="button"
                onClick={() => setModal("find-id")}
                className="transition hover:text-[var(--color-accent)]"
              >
                Find Id
              </button>
              <span className="text-[var(--color-border)]">|</span>
              <button
                type="button"
                onClick={() => setModal("find-password")}
                className="transition hover:text-[var(--color-accent)]"
              >
                Reset Password
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mt-3 rounded-[var(--auth-field-radius)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 inline-flex h-[var(--auth-button-height)] w-full items-center justify-center rounded-[var(--auth-field-radius)] bg-[var(--color-accent)] text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <Link
            href="/auth/signup"
            className="mt-3 inline-flex h-[var(--auth-button-height)] w-full items-center justify-center rounded-[var(--auth-field-radius)] border border-[var(--color-border)] bg-white text-sm font-bold uppercase tracking-wide text-[var(--color-accent)] transition hover:bg-zinc-50"
          >
            Join ORU
          </Link>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          aria-label="Sign in with Google"
          className="mt-4 flex h-[30px] w-[30px] items-center justify-center rounded-full transition hover:bg-zinc-100"
        >
          <Image
            src="/social/google.svg"
            alt=""
            width={30}
            height={30}
            unoptimized
          />
        </button>
      </div>

      {modal === "find-id" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-zinc-900">아이디 찾기</h3>
            <p className="mb-4 text-sm text-zinc-600">가입 시 등록한 이메일을 입력해주세요.</p>
            {foundId ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <p className="text-sm text-zinc-600">회원님의 아이디</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-900">{foundId}</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                  >
                    확인
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoundId(null);
                      setFindIdEmail("");
                      setFindIdError(null);
                      setModal("find-password");
                    }}
                    className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    비밀번호 찾기
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFindIdSubmit} className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">이메일</span>
                  <input
                    value={findIdEmail}
                    onChange={(e) => setFindIdEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="가입 시 등록한 이메일"
                  />
                </label>
                {findIdError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    {findIdError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={findIdSubmitting}
                    className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {findIdSubmitting ? "찾는 중..." : "아이디 찾기"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {modal === "find-password" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-zinc-900">비밀번호 찾기</h3>
            <p className="mb-4 text-sm text-zinc-600">
              가입 시 등록한 이메일과 아이디를 입력해주세요. 임시 비밀번호가 발급됩니다.
            </p>
            {temporaryPassword ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
                  <p className="text-sm font-medium text-amber-900">
                    임시 비밀번호가 발급되었습니다.
                  </p>
                  <p className="mt-2 text-sm text-amber-800">
                    아래 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요.
                  </p>
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-base font-semibold text-zinc-900">
                    {temporaryPassword}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                >
                  확인
                </button>
              </div>
            ) : (
              <form onSubmit={handleFindPwSubmit} className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">이메일</span>
                  <input
                    value={findPwEmail}
                    onChange={(e) => setFindPwEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="가입 시 등록한 이메일"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">아이디</span>
                  <input
                    value={findPwId}
                    onChange={(e) => setFindPwId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="아이디"
                  />
                </label>
                {findPwError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    {findPwError}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-full border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={findPwSubmitting}
                    className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {findPwSubmitting ? "처리 중..." : "임시 비밀번호 발급"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
