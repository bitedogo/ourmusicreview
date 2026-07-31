"use client";
/** 회원가입 폼 (상태·제출 로직) */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { validateUserId } from "@/src/lib/auth/user-id";
import {
  validateEmail,
  validateName,
  validateNickname,
  validatePassword,
} from "@/src/lib/auth/validation";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { SignupTermsSection } from "./SignupTermsSection";
import { SignupAccountFields } from "./SignupAccountFields";
import { SignupProfileFields } from "./SignupProfileFields";
import { SignupProfileImageField } from "./SignupProfileImageField";

type Gender = "MALE" | "FEMALE" | "NONE";

export function SignupForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [gender, setGender] = useState<Gender | "">("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<string | null>(
    null
  );
  const [emailErrorMessage, setEmailErrorMessage] = useState<string | null>(
    null
  );
  const [isSendingEmailCode, setIsSendingEmailCode] = useState(false);
  const [isConfirmingEmailCode, setIsConfirmingEmailCode] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (isEmailVerified) {
      setIsEmailVerified(false);
      setEmailCode("");
      setEmailStatusMessage(null);
    }
    setEmailErrorMessage(null);
  }

  async function handleSendEmailCode() {
    setEmailErrorMessage(null);
    setEmailStatusMessage(null);
    const trimmedEmail = email.trim().toLowerCase();
    const emailError = validateEmail(trimmedEmail);
    if (emailError) {
      setEmailErrorMessage(emailError);
      return;
    }

    setIsSendingEmailCode(true);
    try {
      await fetchJson("/api/auth/signup/send-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      setEmail(trimmedEmail);
      setIsEmailVerified(false);
      setEmailCode("");
      setEmailStatusMessage(
        "인증번호를 보냈습니다. 메일함을 확인한 뒤 아래에 입력해 주세요."
      );
    } catch (error) {
      setEmailErrorMessage(
        getApiErrorMessage(error, "인증번호 발송에 실패했습니다.")
      );
    } finally {
      setIsSendingEmailCode(false);
    }
  }

  async function handleConfirmEmailCode() {
    setEmailErrorMessage(null);
    setEmailStatusMessage(null);
    const trimmedEmail = email.trim().toLowerCase();

    setIsConfirmingEmailCode(true);
    try {
      await fetchJson("/api/auth/signup/confirm-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, code: emailCode }),
      });
      setIsEmailVerified(true);
      setEmailStatusMessage("이메일 인증이 완료되었습니다.");
    } catch (error) {
      setIsEmailVerified(false);
      setEmailErrorMessage(
        getApiErrorMessage(error, "인증번호 확인에 실패했습니다.")
      );
    } finally {
      setIsConfirmingEmailCode(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setHasSuccess(false);
    setErrorMessage(null);

    const trimmedId = id.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedNickname = nickname.trim();

    if (!termsAgreed) {
      setErrorMessage("이용약관에 동의해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (
      !trimmedId ||
      !password ||
      !trimmedEmail ||
      !trimmedName ||
      !trimmedNickname
    ) {
      setErrorMessage("모든 필수 항목을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    if (!isEmailVerified) {
      setErrorMessage("이메일 인증을 완료해 주세요.");
      setIsSubmitting(false);
      return;
    }

    const idError = validateUserId(trimmedId);
    if (idError) {
      setErrorMessage(idError);
      setIsSubmitting(false);
      return;
    }

    if (!gender) {
      setErrorMessage("성별을 선택해주세요.");
      setIsSubmitting(false);
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      setErrorMessage(pwdError);
      setIsSubmitting(false);
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMessage("비밀번호 확인이 틀릴 경우, 가입이 진행되지 않습니다.");
      setIsSubmitting(false);
      return;
    }

    const nickError = validateNickname(trimmedNickname);
    if (nickError) {
      setErrorMessage(nickError);
      setIsSubmitting(false);
      return;
    }

    const nameError = validateName(trimmedName);
    if (nameError) {
      setErrorMessage(nameError);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("id", trimmedId);
      formData.append("password", password);
      formData.append("email", trimmedEmail);
      formData.append("name", trimmedName);
      formData.append("nickname", trimmedNickname);
      formData.append("gender", gender);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setErrorMessage(
          data?.error ?? `회원가입에 실패했습니다. (status: ${response.status})`
        );
        return;
      }

      setHasSuccess(true);
      setTimeout(() => router.push("/auth/signin?verified=1"), 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `요청 중 오류가 발생했습니다: ${error.message}`
          : "요청 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      {hasSuccess && (
        <div className="fixed left-0 right-0 top-0 z-50 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-900 shadow-sm">
          회원가입이 완료되었습니다. 로그인 페이지로 이동합니다...
        </div>
      )}

      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">회원가입</h1>
        <div className="flex items-center gap-1 text-xs text-red-600">
          <span className="font-semibold">*</span>
          <span>필수항목</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SignupTermsSection agreed={termsAgreed} onAgreedChange={setTermsAgreed} />

        <SignupAccountFields
          id={id}
          onIdChange={setId}
          password={password}
          onPasswordChange={setPassword}
          passwordConfirm={passwordConfirm}
          onPasswordConfirmChange={setPasswordConfirm}
          email={email}
          onEmailChange={handleEmailChange}
          emailCode={emailCode}
          onEmailCodeChange={setEmailCode}
          isEmailVerified={isEmailVerified}
          emailStatusMessage={emailStatusMessage}
          emailErrorMessage={emailErrorMessage}
          isSendingEmailCode={isSendingEmailCode}
          isConfirmingEmailCode={isConfirmingEmailCode}
          onSendEmailCode={handleSendEmailCode}
          onConfirmEmailCode={handleConfirmEmailCode}
        />

        <SignupProfileFields
          nickname={nickname}
          onNicknameChange={setNickname}
          name={name}
          onNameChange={setName}
          gender={gender}
          onGenderChange={setGender}
        />

        <SignupProfileImageField
          profileImage={profileImage}
          onImageConfirm={setProfileImage}
        />

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isEmailVerified}
          className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "처리 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        이미 계정이 있나요?{" "}
        <Link
          className="font-medium text-[var(--color-brand-primary)] underline"
          href="/auth/signin"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}
