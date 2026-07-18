"use client";
/** 프로필 수정 클라이언트(닉네임·이미지) */

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ImageCropModal } from "@/src/components/app/ImageCropModal";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { validatePassword } from "@/src/lib/auth/validation";

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
  const [cropModal, setCropModal] = useState<{ src: string; fileName: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);

  const handleProfileImageConfirm = useCallback((file: File) => {
    if (cropModal?.src) URL.revokeObjectURL(cropModal.src);
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setCropModal(null);
  }, [cropModal?.src]);

  const handleProfileImageCancel = useCallback(() => {
    if (cropModal?.src) URL.revokeObjectURL(cropModal.src);
    setCropModal(null);
  }, [cropModal?.src]);

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
      const data = await fetchJson<{ ok: boolean; data?: { nickname?: string } }>(
        "/api/user/update-nickname",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      }
      );

      const newNickname = data.data?.nickname ?? trimmed;
      setDisplayNickname(newNickname);
      try {
        await updateSession?.({ name: newNickname });
        router.refresh();
      } catch {
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
      setCropModal({ src: URL.createObjectURL(file), fileName: file.name });
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

      const data = await fetchJson<{ ok: boolean; data?: { profileImage?: string | null } }>(
        "/api/user/update-profile-image",
        {
        method: "POST",
        body: formData,
      }
      );

      if (data.data?.profileImage) {
        const newUrl: string = data.data.profileImage;
        setPreviewUrl(null);
        setSelectedImage(null);

        try {
          await updateSession?.({ profileImage: newUrl });
        } catch {
        }
      }

      setImageSuccess("프로필 이미지가 성공적으로 변경되었습니다.");
    } catch (error) {
      setImageError(getApiErrorMessage(error, "프로필 이미지 변경에 실패했습니다."));
    } finally {
      setIsUpdatingImage(false);
    }
  }

  async function handleChangePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsChangingPassword(true);
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    const trimmedCurrentPassword = currentPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedNewPasswordConfirm = newPasswordConfirm.trim();

    if (!trimmedCurrentPassword || !trimmedNewPassword || !trimmedNewPasswordConfirm) {
      setChangePasswordError("모든 항목을 입력해주세요.");
      setIsChangingPassword(false);
      return;
    }

    const passwordError = validatePassword(trimmedNewPassword);
    if (passwordError) {
      setChangePasswordError(passwordError);
      setIsChangingPassword(false);
      return;
    }

    if (trimmedCurrentPassword === trimmedNewPassword) {
      setChangePasswordError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      setIsChangingPassword(false);
      return;
    }

    if (trimmedNewPassword !== trimmedNewPasswordConfirm) {
      setChangePasswordError("새 비밀번호 확인이 일치하지 않습니다.");
      setIsChangingPassword(false);
      return;
    }

    try {
      await fetchJson<{ ok: boolean }>("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          email,
          currentPassword: trimmedCurrentPassword,
          newPassword: trimmedNewPassword,
        }),
      });

      setChangePasswordSuccess("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch (error) {
      setChangePasswordError(getApiErrorMessage(error, "비밀번호 변경에 실패했습니다."));
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-[956px] max-w-full flex-col gap-6 px-6 py-8 sm:px-10">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            내 정보 수정
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="rounded bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800"
        >
          마이페이지로
        </button>
      </section>

      {cropModal && (
        <ImageCropModal
          imageSrc={cropModal.src}
          fileName={cropModal.fileName}
          onConfirm={handleProfileImageConfirm}
          onCancel={handleProfileImageCancel}
        />
      )}

      <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div className="grid grid-cols-[120px_1fr] border-b border-zinc-200">
          <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">아이디</div>
          <div className="px-5 py-3">
            <input
              value={id}
              readOnly
              className="w-full max-w-xs rounded border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] border-b border-zinc-200">
          <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">이메일 주소</div>
          <div className="px-5 py-3">
            <input
              value={email}
              readOnly
              className="w-full max-w-xs rounded border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] border-b border-zinc-200">
          <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">프로필</div>
          <div className="space-y-3 px-5 py-4">
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
                  className="rounded bg-black px-3 py-2 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isUpdatingImage ? "저장 중..." : "이미지 저장"}
                </button>
              )}
            </div>
            {imageError && <p className="text-xs text-red-600">{imageError}</p>}
            {imageSuccess && <p className="text-xs text-emerald-600">{imageSuccess}</p>}
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr] border-b border-zinc-200">
          <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">닉네임</div>
          <div className="space-y-3 px-5 py-3">
            <div className="flex w-full max-w-md gap-2">
              <input
                value={editingNickname}
                onChange={(event) => setEditingNickname(event.target.value)}
                className="w-full rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                placeholder="새 닉네임"
              />
              <button
                type="button"
                onClick={handleUpdateNickname}
                disabled={isUpdating}
                className="shrink-0 rounded bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isUpdating ? "수정 중..." : "저장"}
              </button>
            </div>
            <div className="space-y-1 text-xs text-zinc-600">
              <p>* 특수문자 및 띄어쓰기 사용불가</p>
              <p>* 닉네임 최대 글자 수: 영문 14자 또는 한글 7자 이내</p>
            </div>
            {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
            {successMessage && <p className="text-xs text-emerald-600">{successMessage}</p>}
            <p className="text-[11px] text-zinc-500">
              현재 닉네임: {displayNickname} · 권한: {role} · 가입일: {createdAtText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[120px_1fr]">
          <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">비밀번호</div>
          <div className="px-5 py-4">
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div className="grid w-full max-w-2xl grid-cols-1 gap-2 md:grid-cols-3">
                <input
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  type="password"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="현재 비밀번호"
                  autoComplete="current-password"
                />
                <input
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  type="password"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="새 비밀번호"
                  autoComplete="new-password"
                />
                <input
                  value={newPasswordConfirm}
                  onChange={(event) => setNewPasswordConfirm(event.target.value)}
                  type="password"
                  className="rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400"
                  placeholder="새 비밀번호 확인"
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="rounded bg-black px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {isChangingPassword ? "변경 중..." : "비밀번호 변경"}
              </button>
              {changePasswordError && <p className="text-xs text-red-600">{changePasswordError}</p>}
              {changePasswordSuccess && <p className="text-xs text-emerald-600">{changePasswordSuccess}</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

