"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSuccess, setHasSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 6) {
      return "비밀번호는 6자리 이상이어야 합니다.";
    }
    if (!/.*[a-zA-Z].*/.test(pwd) || !/.*[0-9].*/.test(pwd)) {
      return "비밀번호는 영문과 숫자를 반드시 포함해야 합니다.";
    }
    return null;
  }

  function validateNickname(nick: string): string | null {
    if (!nick) return null;
    if (/[^a-zA-Z0-9가-힣]/.test(nick)) {
      return "특수문자 및 공백 사용불가";
    }
    const koreanCount = (nick.match(/[가-힣]/g) || []).length;
    const englishCount = (nick.match(/[a-zA-Z]/g) || []).length;
    const otherCount = nick.length - koreanCount - englishCount;
    if (koreanCount > 0 && koreanCount > 6) {
      return "최대 글자 수: 한글 6자";
    }
    if (englishCount + otherCount > 12) {
      return "최대 글자 수: 영문 12자";
    }
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setHasSuccess(false);
    setErrorMessage(null);

    const trimmedId = id.trim();
    const trimmedEmail = email.trim();
    const trimmedNickname = nickname.trim();

    if (!trimmedId || !password || !trimmedEmail || !trimmedNickname) {
      setErrorMessage("모든 필수 항목을 입력해주세요.");
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

    try {
      const formData = new FormData();
      formData.append("id", trimmedId);
      formData.append("password", password);
      formData.append("email", trimmedEmail);
      formData.append("nickname", trimmedNickname);
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
      setTimeout(() => router.push("/auth/signin"), 1500);
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
          회원가입에 성공했습니다. 로그인 페이지로 이동합니다...
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
        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium">
            <span className="text-red-600">*</span>
            <span>아이디</span>
          </label>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="아이디를 입력하세요"
            autoComplete="username"
          />
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium">
            <span className="text-red-600">*</span>
            <span>비밀번호</span>
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="비밀번호를 입력하세요"
            autoComplete="new-password"
          />
          <p className="text-xs text-zinc-500">
            비밀번호는 6자리 이상이어야 하며 영문과 숫자를 반드시 포함해야 합니다.
          </p>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium">
            <span className="text-red-600">*</span>
            <span>비밀번호 확인</span>
          </label>
          <input
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            type="password"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="비밀번호를 다시 입력하세요"
            autoComplete="new-password"
          />
          <p className="text-xs text-red-600">
            비밀번호 확인이 틀릴 경우, 가입이 진행되지 않습니다.
          </p>
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium">
            <span className="text-red-600">*</span>
            <span>이메일 주소</span>
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="이메일을 입력하세요"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1">
          <label className="flex items-center gap-1 text-sm font-medium">
            <span className="text-red-600">*</span>
            <span>닉네임</span>
          </label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            placeholder="닉네임을 입력하세요"
            autoComplete="nickname"
          />
          <div className="space-y-0.5 text-xs text-zinc-500">
            <p>* 특수문자 및 공백 사용불가</p>
            <p>* 최대 글자 수: 영문 12자 또는 한글 6자</p>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">프로필 사진</label>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded border border-zinc-300 bg-white px-3 py-2 text-xs hover:bg-zinc-50">
              파일 선택
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setProfileImage(file);
                }}
              />
            </label>
            <span className="text-xs text-zinc-500">
              {profileImage ? profileImage.name : "선택된 파일 없음"}
            </span>
          </div>
          <div className="space-y-0.5 text-xs text-zinc-500">
            <p>파일 용량 제한: 100.00MB, 가로 최대: 80px, 세로 최대: 80px</p>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {isSubmitting ? "처리 중..." : "회원가입"}
        </button>
      </form>

      <p className="mt-6 text-sm text-zinc-600">
        이미 계정이 있나요?{" "}
        <Link className="font-medium text-black underline" href="/auth/signin">
          로그인
        </Link>
      </p>
    </div>
  );
}
