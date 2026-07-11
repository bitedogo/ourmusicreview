"use client";

import { useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface FindPasswordResponse {
  ok: boolean;
  data: {
    temporaryPassword: string;
  };
}

interface FindPasswordModalProps {
  onClose: () => void;
}

const inputClassName =
  "h-[34px] min-w-0 flex-1 rounded-lg border border-zinc-200 px-2.5 text-[13px] outline-none placeholder:text-[12px] focus:border-zinc-400 sm:h-[39px] sm:w-[324px] sm:flex-none sm:rounded-xl sm:px-3 sm:text-sm sm:placeholder:text-[14px]";

export function FindPasswordModal({ onClose }: FindPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const modalSizeClass = temporaryPassword
    ? "h-[270px] sm:h-[294px]"
    : "h-[250px] sm:h-[268px]";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setTemporaryPassword(null);

    const trimmedEmail = email.trim();
    const trimmedId = id.trim();
    if (!trimmedEmail || !trimmedId) {
      setError("이메일과 아이디를 모두 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      const data = await fetchJson<FindPasswordResponse>("/api/auth/find-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, id: trimmedId }),
      });
      setTemporaryPassword(data.data.temporaryPassword);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "비밀번호 재설정 중 오류가 발생했습니다."));
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
        className={`relative flex w-full max-w-[446px] flex-col rounded-[15px] border border-zinc-200 bg-white px-5 py-5 shadow-xl sm:px-8 sm:py-6 ${modalSizeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="shrink-0 text-[16px] font-semibold text-zinc-900 sm:text-[18px]">비밀번호 재설정</h3>

        {temporaryPassword ? (
          <>
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <p className="text-[13px] leading-5 text-zinc-500 sm:text-sm sm:leading-6">
                임시 비밀번호가 발급되었습니다.
                <br />
                아래 임시 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요.
              </p>
              <div className="mt-4">
                <p className="mb-2 text-sm text-zinc-500">임시 비밀번호</p>
                <div className="flex h-10 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[20px] font-medium leading-none text-zinc-900 sm:h-12 sm:text-[24px]">
                  {temporaryPassword}
                </div>
              </div>
            </div>
            <div className="mt-auto flex shrink-0 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[#43A7B2] text-[13px] font-medium text-white transition hover:bg-[#3796A0]"
              >
                확인
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="absolute inset-x-5 top-[48%] -translate-y-1/2 sm:inset-x-8">
              <div className="space-y-3 sm:space-y-4">
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">E-mail</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className={inputClassName}
                    placeholder="가입 시 등록한 이메일을 입력해주세요."
                  />
                </label>
                <label className="flex min-w-0 items-center gap-2 sm:gap-4">
                  <span className="w-10 shrink-0 text-[12px] text-[#000000] sm:text-[13px]">ID</span>
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
              <button type="button" onClick={onClose} className="text-[13px] font-semibold text-zinc-900">
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[#43A7B2] text-[13px] font-medium text-white transition hover:bg-[#3796A0] disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submitting ? "처리 중..." : "다음"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
