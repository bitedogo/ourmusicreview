"use client";

import { useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface FindIdResponse {
  ok: boolean;
  data: {
    id: string;
  };
}

interface FindIdModalProps {
  onClose: () => void;
  onOpenFindPassword: () => void;
}

export function FindIdModal({ onClose, onOpenFindPassword }: FindIdModalProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundId, setFoundId] = useState<string | null>(null);
  const modalSizeClass = foundId ? "h-[240px]" : "h-[210px]";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setFoundId(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("이메일을 입력해주세요.");
      setSubmitting(false);
      return;
    }

    try {
      const data = await fetchJson<FindIdResponse>("/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setFoundId(data.data.id);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "아이디 찾기 중 오류가 발생했습니다."));
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
        <h3 className="text-[18px] font-semibold text-zinc-900">아이디 찾기</h3>
        {foundId ? (
          <div className="mt-7 flex h-full flex-col">
            <div>
              <p className="mb-2 text-sm text-zinc-500">회원님의 아이디</p>
              <div className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-[24px] font-medium leading-none text-zinc-900">
                {foundId}
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <button
                type="button"
                onClick={onOpenFindPassword}
                className="text-[13px] font-semibold text-zinc-900"
              >
                비밀번호 찾기
              </button>
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
