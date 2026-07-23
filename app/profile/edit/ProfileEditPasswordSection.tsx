"use client";

/** 내 정보 수정 — 비밀번호 변경 섹션 */

import { useRef, useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { validatePassword } from "@/src/lib/auth/validation";
import {
  PROFILE_EDIT_INPUT,
  PROFILE_EDIT_PRIMARY_BTN,
  ProfileEditFormRow,
} from "./ProfileEditFormRow";

interface ProfileEditPasswordSectionProps {
  id: string;
  email: string;
}

export function ProfileEditPasswordSection({
  id,
  email,
}: ProfileEditPasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const formData = new FormData(event.currentTarget);
    const trimmedCurrent = String(formData.get("currentPassword") ?? "").trim();
    const trimmedNew = String(formData.get("newPassword") ?? "").trim();
    const trimmedConfirm = String(
      formData.get("newPasswordConfirm") ?? ""
    ).trim();

    setCurrentPassword(trimmedCurrent);
    setNewPassword(trimmedNew);
    setNewPasswordConfirm(trimmedConfirm);
    clearMessages();
    setIsChangingPassword(true);

    try {
      if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
        setError("모든 항목을 입력해주세요.");
        return;
      }

      const passwordError = validatePassword(trimmedNew);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (trimmedCurrent === trimmedNew) {
        setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
        return;
      }

      if (trimmedNew !== trimmedConfirm) {
        setError("새 비밀번호 확인이 일치하지 않습니다.");
        return;
      }

      await fetchJson<{ ok: boolean }>("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          email,
          currentPassword: trimmedCurrent,
          newPassword: trimmedNew,
        }),
      });

      setSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (err) {
      setError(getApiErrorMessage(err, "비밀번호 변경에 실패했습니다."));
    } finally {
      inFlightRef.current = false;
      setIsChangingPassword(false);
    }
  }

  return (
    <ProfileEditFormRow label="비밀번호" bordered={false}>
      <form onSubmit={handleSubmit} className="space-y-3 py-1">
        <div className="grid w-full max-w-2xl grid-cols-1 gap-2 md:grid-cols-3">
          <input
            name="currentPassword"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              clearMessages();
            }}
            type="password"
            className={PROFILE_EDIT_INPUT}
            placeholder="현재 비밀번호"
            autoComplete="current-password"
          />
          <input
            name="newPassword"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              clearMessages();
            }}
            type="password"
            className={PROFILE_EDIT_INPUT}
            placeholder="새 비밀번호"
            autoComplete="new-password"
          />
          <input
            name="newPasswordConfirm"
            value={newPasswordConfirm}
            onChange={(e) => {
              setNewPasswordConfirm(e.target.value);
              clearMessages();
            }}
            type="password"
            className={PROFILE_EDIT_INPUT}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={isChangingPassword}
          className={PROFILE_EDIT_PRIMARY_BTN}
        >
          {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
        </button>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {success && <p className="text-xs text-emerald-600">{success}</p>}
      </form>
    </ProfileEditFormRow>
  );
}
