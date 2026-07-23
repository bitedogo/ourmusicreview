"use client";
/** 로그인 페이지 */

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";
import { FindIdModal } from "./find-id-modal";
import { FindPasswordModal } from "./find-password-modal";

type ModalType = "find-id" | "find-password" | null;

export default function SigninPage() {
  const router = useRouter();
  const { status } = useSession();
  const callbackUrl = "/";
  const loginCallbackUrl = "/auth/signin";
  const savedIdKey = "oru.savedSigninId";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  function handleGoBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex w-full flex-col items-center px-4 pb-[var(--auth-logo-padding-bottom)]">
      <div className="flex w-full max-w-[var(--auth-form-width)] flex-col items-center pt-[var(--auth-logo-padding-top)]">
        <div className="mb-4 hidden w-full sm:flex">
          <button
            type="button"
            onClick={handleGoBack}
            className="relative inline-flex -translate-y-[50px] items-center text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)]"
          >
            {'< back'}
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
            <div className="overflow-hidden rounded-[var(--auth-field-radius)] border border-[var(--color-border)] bg-white shadow-[0_2px_4px_-2px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] focus-within:border-[var(--color-accent)]">
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="auth-input h-[var(--auth-input-height)] w-full bg-transparent px-4 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] sm:text-sm"
                placeholder="Id"
                autoComplete="username"
              />
            </div>
          </label>

          <label className="mt-3 block">
            <div className="overflow-hidden rounded-[var(--auth-field-radius)] border border-[var(--color-border)] bg-white shadow-[0_2px_4px_-2px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] focus-within:border-[var(--color-accent)]">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="auth-input h-[var(--auth-input-height)] w-full bg-transparent px-4 text-base text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] sm:text-sm"
                placeholder="Password"
                autoComplete="current-password"
              />
            </div>
          </label>

          {errorMessage && <p className="mt-3 text-sm text-red-500">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-3 inline-flex h-[var(--auth-button-height)] w-full items-center justify-center rounded-[var(--auth-field-radius)] bg-[var(--color-brand-primary)] text-sm font-bold uppercase tracking-wide text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          <div className="mt-5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
            <label className="inline-flex items-center gap-2 text-[12px] text-[var(--color-text-secondary)] justify-self-start sm:text-sm">
              <input
                type="checkbox"
                checked={isRememberId}
                onChange={(e) => setIsRememberId(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
              />
              Save Id
            </label>
            <div className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)] justify-self-center sm:text-sm">
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
            <Link
              href="/auth/signup"
              className="justify-self-end text-[12px] text-[var(--color-text-secondary)] transition hover:text-[var(--color-accent)] sm:text-sm"
            >
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
          <span className="text-sm font-semibold text-[var(--color-brand-primary)] transition-colors group-hover:text-[var(--color-brand-primary-hover)]">Google Login</span>
        </button>
      </div>

      {modal === "find-id" && (
        <FindIdModal
          onClose={() => setModal(null)}
          onOpenFindPassword={() => setModal("find-password")}
        />
      )}

      {modal === "find-password" && <FindPasswordModal onClose={() => setModal(null)} />}
    </div>
  );
}
