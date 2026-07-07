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

export function FindPasswordModal({ onClose }: FindPasswordModalProps) {
  const [email, setEmail] = useState("");
  const [id, setId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const modalSizeClass = temporaryPassword ? "h-[294px]" : "h-[268px]";

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
      setError(getApiErrorMessage(submitError, "비밀번호 찾기 중 오류가 발생했습니다."));
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
        className={`flex w-full max-w-[446px] flex-col rounded-[15px] border border-zinc-200 bg-white px-8 pb-4 pt-6 shadow-xl ${modalSizeClass}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-[18px] font-semibold text-zinc-900">비밀번호 찾기</h3>
        {temporaryPassword ? (
          <div className="mt-7 flex h-full flex-col">
            <p className="text-sm leading-6 text-zinc-500">
              임시 비밀번호가 발급되었습니다.
              <br />
              아래 임시 비밀번호로 로그인 후, 반드시 비밀번호를 변경해주세요.
            </p>
            <div className="mt-5">
              <p className="mb-2 text-sm text-zinc-500">임시 비밀번호</p>
              <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[24px] font-medium leading-none text-zinc-900">
                {temporaryPassword}
              </div>
            </div>
            <div className="mt-auto flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-[32.12px] w-[64.14px] rounded-[7px] bg-[#43A7B2] text-[13px] font-medium text-white transition hover:bg-[#3796A0]"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-7 flex h-full flex-col">
            <div className="space-y-4">
              <label className="flex items-center gap-4">
                <span className="w-10 text-[13px] text-[#000000]">E-mail</span>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="h-[39px] w-[324px] rounded-xl border border-zinc-200 px-3 text-sm outline-none placeholder:text-[14px] focus:border-zinc-400"
                  placeholder="가입 시 등록한 이메일을 입력해주세요."
                />
              </label>
              <label className="flex items-center gap-4">
                <span className="w-10 text-[13px] text-[#000000]">ID</span>
                <input
                  value={id}
                  onChange={(event) => setId(event.target.value)}
                  className="h-[39px] w-[324px] rounded-xl border border-zinc-200 px-3 text-sm outline-none placeholder:text-[14px] focus:border-zinc-400"
                  placeholder="가입 시 등록한 아이디를 입력해주세요."
                />
              </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <div className="mt-auto flex items-center justify-between">
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
