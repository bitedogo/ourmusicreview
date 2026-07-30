"use client";
/** 프로필 수정 클라이언트(닉네임·이미지·계정삭제) */

import { useCallback, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { useImageCropFlow } from "@/src/hooks/use-image-crop-flow";
import {
  PROFILE_EDIT_INPUT,
  PROFILE_EDIT_PRIMARY_BTN,
  ProfileEditFormRow,
} from "./ProfileEditFormRow";
import { ProfileEditPasswordSection } from "./ProfileEditPasswordSection";

interface ProfileEditClientProps {
  id: string;
  email: string;
  nickname: string;
  role: "USER" | "ADMIN";
  createdAtText: string;
}

export function ProfileEditClient({
  id,
  email,
  nickname,
  role,
  createdAtText,
}: ProfileEditClientProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [editingNickname, setEditingNickname] = useState(nickname);
  const [displayNickname, setDisplayNickname] = useState(nickname);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleProfileImageConfirm = useCallback((file: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSelectedImage(file);
  }, []);

  const { openWithFile, cropModalNode } = useImageCropFlow({
    onCropped: handleProfileImageConfirm,
  });

  async function handleUpdateNickname() {
    setIsUpdating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const trimmed = editingNickname.trim();
    if (!trimmed) {
      setErrorMessage("닉네임을 입력해주세요.");
      setIsUpdating(false);
      return;
    }
    if (trimmed.length > 50) {
      setErrorMessage("닉네임은 50자 이하여야 합니다.");
      setIsUpdating(false);
      return;
    }

    try {
      const data = await fetchJson<{
        ok: boolean;
        data?: { nickname?: string };
      }>("/api/user/update-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });

      const newNickname = data.data?.nickname ?? trimmed;
      setDisplayNickname(newNickname);
      try {
        await updateSession?.({ name: newNickname });
        router.refresh();
      } catch {
        /* session refresh optional */
      }
      setSuccessMessage("닉네임이 성공적으로 변경되었습니다.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "닉네임 변경에 실패했습니다."));
    } finally {
      setIsUpdating(false);
    }
  }

  function handleProfileImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    setImageError(null);
    setImageSuccess(null);
    if (file) {
      openWithFile(file);
    }
  }

  async function handleUpdateProfileImage() {
    if (!selectedImage) {
      setImageError("변경할 프로필 이미지를 선택해주세요.");
      return;
    }

    setIsUpdatingImage(true);
    setImageError(null);
    setImageSuccess(null);

    try {
      const formData = new FormData();
      formData.append("profileImage", selectedImage);

      const data = await fetchJson<{
        ok: boolean;
        data?: { profileImage?: string | null };
      }>("/api/user/update-profile-image", {
        method: "POST",
        body: formData,
      });

      if (data.data?.profileImage) {
        setPreviewUrl(null);
        setSelectedImage(null);
        try {
          await updateSession?.({ profileImage: data.data.profileImage });
        } catch {
          /* session refresh optional */
        }
      }

      setImageSuccess("프로필 이미지가 성공적으로 변경되었습니다.");
    } catch (error) {
      setImageError(
        getApiErrorMessage(error, "프로필 이미지 변경에 실패했습니다.")
      );
    } finally {
      setIsUpdatingImage(false);
    }
  }

  async function handleDeleteAccount() {
    if (role === "ADMIN") return;

    if (
      !confirm(
        "정말로 계정을 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없으며, 작성한 리뷰·댓글 등 모든 데이터가 삭제됩니다."
      )
    ) {
      return;
    }
    if (!confirm("한 번 더 확인합니다. 계정을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/user/account", { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "계정 삭제에 실패했습니다.");
        return;
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      alert("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-[956px] max-w-full flex-col gap-6 px-6 py-8 sm:px-10">
      <section className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">내 정보 수정</h1>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className={PROFILE_EDIT_PRIMARY_BTN}
        >
          마이페이지로
        </button>
      </section>

      {cropModalNode}

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <ProfileEditFormRow label="아이디">
          <input
            value={id}
            readOnly
            className={`w-full max-w-xs ${PROFILE_EDIT_INPUT} bg-zinc-100 text-zinc-800`}
          />
        </ProfileEditFormRow>

        <ProfileEditFormRow label="이메일 주소">
          <input
            value={email}
            readOnly
            className={`w-full max-w-xs ${PROFILE_EDIT_INPUT} bg-zinc-100 text-zinc-800`}
          />
        </ProfileEditFormRow>

        <ProfileEditFormRow label="프로필">
          <div className="space-y-3 py-1">
            <div className="flex items-center gap-3">
              {previewUrl && (
                <div className="h-20 w-20 overflow-hidden rounded-full bg-zinc-100">
                  <Image
                    src={previewUrl}
                    alt="프로필 미리보기"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <label className="inline-flex cursor-pointer items-center justify-center rounded border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                이미지 선택
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={handleUpdateProfileImage}
                  disabled={isUpdatingImage}
                  className={`${PROFILE_EDIT_PRIMARY_BTN} px-3`}
                >
                  {isUpdatingImage ? "저장 중..." : "이미지 저장"}
                </button>
              )}
            </div>
            {imageError && <p className="text-xs text-red-600">{imageError}</p>}
            {imageSuccess && (
              <p className="text-xs text-emerald-600">{imageSuccess}</p>
            )}
          </div>
        </ProfileEditFormRow>

        <ProfileEditFormRow label="닉네임">
          <div className="space-y-3">
            <div className="flex w-full max-w-md gap-2">
              <input
                value={editingNickname}
                onChange={(e) => setEditingNickname(e.target.value)}
                className={`w-full ${PROFILE_EDIT_INPUT}`}
                placeholder="새 닉네임"
              />
              <button
                type="button"
                onClick={handleUpdateNickname}
                disabled={isUpdating}
                className={`shrink-0 ${PROFILE_EDIT_PRIMARY_BTN}`}
              >
                {isUpdating ? "수정 중..." : "저장"}
              </button>
            </div>
            <div className="space-y-1 text-xs text-zinc-600">
              <p>* 특수문자 및 띄어쓰기 사용불가</p>
              <p>* 닉네임 최대 글자 수: 영문 14자 또는 한글 7자 이내</p>
            </div>
            {errorMessage && (
              <p className="text-xs text-red-600">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-xs text-emerald-600">{successMessage}</p>
            )}
            <p className="text-[11px] text-zinc-500">
              현재 닉네임: {displayNickname} · 권한: {role} · 가입일:{" "}
              {createdAtText}
            </p>
          </div>
        </ProfileEditFormRow>

        <ProfileEditPasswordSection id={id} email={email} />
      </section>

      {role !== "ADMIN" && (
        <section className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700">계정 삭제</p>
              <p className="mt-1 text-xs text-red-600">
                계정을 삭제하면 작성한 리뷰·댓글 등 모든 데이터가 삭제되며 복구할 수
                없습니다.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="shrink-0 rounded border border-red-300 bg-white px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeletingAccount ? "처리 중..." : "계정삭제"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
