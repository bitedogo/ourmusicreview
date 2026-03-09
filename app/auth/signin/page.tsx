"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

type ModalType = "find-id" | "find-password" | "change-password" | null;

export default function SigninPage() {
  const router = useRouter();
  const callbackUrl = "/";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

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
  const [changePwId, setChangePwId] = useState("");
  const [changePwEmail, setChangePwEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [changePwSubmitting, setChangePwSubmitting] = useState(false);
  const [changePwError, setChangePwError] = useState<string | null>(null);
  const [changePwSuccess, setChangePwSuccess] = useState<string | null>(null);

  function validatePassword(pwd: string): string | null {
    if (pwd.length < 6) {
      return "비밀번호는 6자리 이상이어야 합니다.";
    }
    if (!/.*[a-zA-Z].*/.test(pwd) || !/.*[0-9].*/.test(pwd)) {
      return "비밀번호는 영문과 숫자를 반드시 포함해야 합니다.";
    }
    return null;
  }

  function closeModal() {
    setModal(null);
    setFindIdEmail("");
    setFindIdError(null);
    setFoundId(null);
    setFindPwEmail("");
    setFindPwId("");
    setFindPwError(null);
    setTemporaryPassword(null);
    setChangePwId("");
    setChangePwEmail("");
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setChangePwError(null);
    setChangePwSuccess(null);
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
      const res = await fetch("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setFindIdError(data?.error ?? "아이디 찾기에 실패했습니다.");
      } else {
        setFoundId(data.id);
      }
    } catch {
      setFindIdError("아이디 찾기 중 오류가 발생했습니다.");
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
      const res = await fetch("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, id: trimmedId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setFindPwError(data?.error ?? "비밀번호 찾기에 실패했습니다.");
      } else {
        setTemporaryPassword(data.temporaryPassword);
      }
    } catch {
      setFindPwError("비밀번호 찾기 중 오류가 발생했습니다.");
    } finally {
      setFindPwSubmitting(false);
    }
  }

  async function handleChangePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setChangePwSubmitting(true);
    setChangePwError(null);
    setChangePwSuccess(null);

    const trimmedId = changePwId.trim();
    const trimmedEmail = changePwEmail.trim();
    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedNewPasswordConfirm = newPasswordConfirm.trim();

    if (
      !trimmedId ||
      !trimmedEmail ||
      !trimmedCurrentPassword ||
      !trimmedNewPassword ||
      !trimmedNewPasswordConfirm
    ) {
      setChangePwError("모든 항목을 입력해주세요.");
      setChangePwSubmitting(false);
      return;
    }

    const passwordError = validatePassword(trimmedNewPassword);
    if (passwordError) {
      setChangePwError(passwordError);
      setChangePwSubmitting(false);
      return;
    }

    if (trimmedCurrentPassword === trimmedNewPassword) {
      setChangePwError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      setChangePwSubmitting(false);
      return;
    }

    if (trimmedNewPassword !== trimmedNewPasswordConfirm) {
      setChangePwError("새 비밀번호 확인이 일치하지 않습니다.");
      setChangePwSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: trimmedId,
          email: trimmedEmail,
          currentPassword: trimmedCurrentPassword,
          newPassword: trimmedNewPassword,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.ok) {
        setChangePwError(data?.error ?? "비밀번호 변경에 실패했습니다.");
      } else {
        setChangePwSuccess("비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.");
      }
    } catch {
      setChangePwError("비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setChangePwSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      id: id.trim(),
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

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-6 pt-[7.5rem] pb-[7.5rem]">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">로그인</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">아이디</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="아이디"
            autoComplete="username"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="비밀번호"
            autoComplete="current-password"
          />
        </label>

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
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="mt-4 flex justify-center gap-4 text-sm">
        <button
          type="button"
          onClick={() => setModal("find-id")}
          className="text-zinc-600 underline hover:text-zinc-900"
        >
          아이디 찾기
        </button>
        <span className="text-zinc-300">|</span>
        <button
          type="button"
          onClick={() => setModal("find-password")}
          className="text-zinc-600 underline hover:text-zinc-900"
        >
          비밀번호 찾기
        </button>
        <span className="text-zinc-300">|</span>
        <button
          type="button"
          onClick={() => setModal("change-password")}
          className="text-zinc-600 underline hover:text-zinc-900"
        >
          비밀번호 변경
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
                    className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
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
                    className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 font-mono text-base font-semibold text-zinc-900">
                    {temporaryPassword}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
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
                    className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {findPwSubmitting ? "처리 중..." : "임시 비밀번호 발급"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {modal === "change-password" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-semibold text-zinc-900">비밀번호 변경</h3>
            <p className="mb-4 text-sm text-zinc-600">
              아이디, 이메일, 현재 비밀번호를 입력한 뒤 새 비밀번호로 변경할 수 있습니다.
            </p>

            {changePwSuccess ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  {changePwSuccess}
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
                >
                  확인
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-sm font-medium">아이디</span>
                  <input
                    value={changePwId}
                    onChange={(e) => setChangePwId(e.target.value)}
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="아이디"
                    autoComplete="username"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">이메일</span>
                  <input
                    value={changePwEmail}
                    onChange={(e) => setChangePwEmail(e.target.value)}
                    type="email"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="가입 시 등록한 이메일"
                    autoComplete="email"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">현재 비밀번호</span>
                  <input
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    type="password"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="현재 비밀번호"
                    autoComplete="current-password"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">새 비밀번호</span>
                  <input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="새 비밀번호"
                    autoComplete="new-password"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">새 비밀번호 확인</span>
                  <input
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    type="password"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                    placeholder="새 비밀번호 확인"
                    autoComplete="new-password"
                  />
                </label>
                {changePwError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    {changePwError}
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
                    disabled={changePwSubmitting}
                    className="flex-1 rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                  >
                    {changePwSubmitting ? "변경 중..." : "비밀번호 변경"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-zinc-600">
        아직 계정이 없나요?{" "}
        <Link className="font-medium text-black underline" href="/auth/signup">
          회원가입
        </Link>
      </p>
    </div>
  );
}
