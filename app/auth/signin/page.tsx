"use client";
/** 로그인 페이지 */

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { FindIdModal } from "./find-id-modal";
import { FindPasswordModal } from "./find-password-modal";

type ModalType = "find-id" | "find-password" | null;

const fieldShellClass =
  "w-full overflow-hidden rounded-[10px] border-[0.71px] border-[#E3E3E3] bg-white shadow-[0px_1.41573px_2.83146px_rgba(0,0,0,0.25)] transition-[border-color,box-shadow] focus-within:border-[#43A7B2] sm:rounded-[15px] sm:border sm:shadow-[0px_2px_4px_rgba(0,0,0,0.25)]";

const fieldInputClass =
  "auth-input h-[44px] w-full bg-transparent pl-[18px] pr-4 text-[15px] font-normal leading-[145%] tracking-[-0.005em] text-[var(--color-text-primary)] outline-none placeholder:font-normal placeholder:text-[#C4C4C4] sm:h-[50px] sm:pl-[20px] sm:text-[18px]";

const linkTextClass =
  "whitespace-nowrap text-[11px] font-extralight leading-[145%] tracking-[-0.005em] text-[var(--color-text-primary)] transition hover:text-[#43A7B2] sm:text-[16px]";

function SigninPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = "/";
  const loginCallbackUrl = "/auth/signin";
  const savedIdKey = "oru.savedSigninId";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [id, setId] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(savedIdKey) ?? "";
  });
  const [password, setPassword] = useState("");
  const [isRememberId, setIsRememberId] = useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(window.localStorage.getItem(savedIdKey));
  });
  const [modal, setModal] = useState<ModalType>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setInfoMessage("이메일 인증이 완료되었습니다. 로그인해 주세요.");
      setNeedsVerification(false);
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);
    setResendStatus(null);
    setNeedsVerification(false);
    const trimmedId = id.trim();

    if (typeof window !== "undefined") {
      if (isRememberId && trimmedId) {
        window.localStorage.setItem(savedIdKey, trimmedId);
      } else {
        window.localStorage.removeItem(savedIdKey);
      }
    }

    const preflight = await fetchJson<{
      ok: true;
      data: { status: "invalid" | "unverified" | "ready" };
    }>("/api/auth/preflight-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: trimmedId, password }),
    }).catch(() => null);

    if (preflight?.data.status === "unverified") {
      setNeedsVerification(true);
      setErrorMessage(
        "이메일 인증이 필요합니다. 메일로 받은 인증번호를 입력해 주세요."
      );
      setIsSubmitting(false);
      return;
    }

    if (preflight?.data.status === "invalid") {
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
      setIsSubmitting(false);
      return;
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

  async function handleResendVerification() {
    const trimmedId = id.trim();
    if (!trimmedId) {
      setResendStatus("아이디를 입력한 뒤 다시 시도해 주세요.");
      return;
    }
    setResendStatus(null);
    try {
      await fetchJson("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trimmedId }),
      });
      setResendStatus("인증번호를 다시 보냈습니다. 인증 화면으로 이동합니다...");
      setTimeout(() => router.push("/auth/verify-email"), 800);
    } catch (error) {
      setResendStatus(
        getApiErrorMessage(error, "인증번호 재발송에 실패했습니다.")
      );
    }
  }

  async function handleGoogleLogin() {
    const result = await signIn("google", { callbackUrl: loginCallbackUrl });
    if (result?.error) {
      setErrorMessage(result.error);
    } else if (!result?.url) {
      router.push(loginCallbackUrl);
    }
  }

  function handleGoBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex w-full flex-col items-center px-4 pb-[var(--auth-logo-padding-bottom)]">
      <div className="flex w-full max-w-[var(--auth-form-width-mobile)] flex-col items-center pt-[var(--auth-logo-padding-top)] sm:max-w-[var(--auth-form-width)]">
        <div className="mb-4 hidden w-full sm:flex">
          <button
            type="button"
            onClick={handleGoBack}
            className="relative inline-flex -translate-y-[50px] items-center text-[16px] font-normal leading-[145%] tracking-[-0.005em] text-[#B0B0B0] transition hover:text-[#43A7B2]"
          >
            {"< back"}
          </button>
        </div>

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
            <div className={fieldShellClass}>
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className={fieldInputClass}
                placeholder="Id"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="mt-3 block">
            <div className={fieldShellClass}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className={fieldInputClass}
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {infoMessage && <p className="mt-3 text-sm text-emerald-600">{infoMessage}</p>}
          {errorMessage && <p className="mt-3 text-sm text-red-500">{errorMessage}</p>}
          {needsVerification && (
            <button
              type="button"
              onClick={handleResendVerification}
              className="mt-2 self-start text-sm font-medium text-[#43A7B2] underline"
            >
              인증번호 다시 받기
            </button>
          )}
          {resendStatus && <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{resendStatus}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 inline-flex h-[42px] w-full items-center justify-center rounded-[10px] bg-[#43A7B2] text-[16px] font-semibold leading-[145%] tracking-[-0.005em] text-white transition hover:bg-[#3796A0] disabled:cursor-not-allowed disabled:bg-zinc-400 sm:h-[47px] sm:rounded-[15px] sm:text-[20px]"
          >
            {isSubmitting ? "Logging in..." : "LOGIN"}
          </button>

          <div className="mt-5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
            <label className="inline-flex items-center gap-2 justify-self-start whitespace-nowrap">
              <input
                type="checkbox"
                checked={isRememberId}
                onChange={(e) => setIsRememberId(e.target.checked)}
                className="h-4 w-4 shrink-0 rounded border-[#E3E3E3] accent-[#43A7B2]"
              />
              <span className={linkTextClass}>Save Id</span>
            </label>
            <div className="flex items-center justify-center gap-1 py-[5px] sm:gap-2">
              <button
                type="button"
                onClick={() => setModal("find-id")}
                className={linkTextClass}
              >
                Find Id
              </button>
              <span aria-hidden className="h-[21px] w-0 border-l border-[#E3E3E3]" />
              <button
                type="button"
                onClick={() => setModal("find-password")}
                className={linkTextClass}
              >
                Reset Password
              </button>
            </div>
            <Link href="/auth/signup" className={`justify-self-end ${linkTextClass}`}>
              Create Account
            </Link>
          </div>
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          aria-label="Sign in with Google"
          className="group mt-10 inline-flex items-center justify-center gap-2 rounded-full px-3 py-1.5"
        >
          <Image src="/social/google.svg" alt="" width={30} height={30} unoptimized />
          <span className="text-sm font-semibold text-[#43A7B2] transition-colors group-hover:text-[#3796A0]">
            Google Login
          </span>
        </button>
      </div>

      {modal === "find-id" && (
        <FindIdModal
          onClose={() => setModal(null)}
          onOpenFindPassword={() => setModal("find-password")}
        />
      )}

      {modal === "find-password" && (
        <FindPasswordModal onClose={() => setModal(null)} />
      )}
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-[var(--color-text-secondary)]">
          불러오는 중...
        </div>
      }
    >
      <SigninPageContent />
    </Suspense>
  );
}
