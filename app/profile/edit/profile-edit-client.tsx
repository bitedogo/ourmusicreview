"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileEditClientProps {
  id: string;
  nickname: string;
  role: "USER" | "ADMIN";
  createdAtText: string;
  profileImage: string | null;
}

export function ProfileEditClient({
  id,
  nickname,
  role,
  createdAtText,
  profileImage,
}: ProfileEditClientProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [editingNickname, setEditingNickname] = useState(nickname);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(
    profileImage ?? null
  );
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSuccess, setImageSuccess] = useState<string | null>(null);

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
      const response = await fetch("/api/user/update-nickname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: trimmed }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setErrorMessage(
          data?.error ??
            `닉네임 변경에 실패했습니다. (status: ${response.status})`
        );
        return;
      }

      setSuccessMessage("닉네임이 성공적으로 변경되었습니다.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `요청 중 오류가 발생했습니다: ${error.message}`
          : "요청 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function handleProfileImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedImage(file);
    setImageError(null);
    setImageSuccess(null);

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
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

      const response = await fetch("/api/user/update-profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setImageError(
          data?.error ??
            `프로필 이미지 변경에 실패했습니다. (status: ${response.status})`
        );
        return;
      }

      if (data.profileImage) {
        const newUrl: string = data.profileImage;
        setCurrentProfileImage(newUrl);
        setPreviewUrl(null);
        setSelectedImage(null);

        // 헤더 등 NextAuth 세션에도 즉시 반영
        try {
          await updateSession?.({ profileImage: newUrl });
        } catch {
          // 세션 업데이트 실패는 치명적이지 않으므로 무시
        }
      }

      setImageSuccess("프로필 이미지가 성공적으로 변경되었습니다.");
    } catch (error) {
      setImageError(
        error instanceof Error
          ? `요청 중 오류가 발생했습니다: ${error.message}`
          : "요청 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsUpdatingImage(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-10 sm:px-16">
      {/* 상단: 제목 + 뒤로가기 */}
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            내 정보 수정
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            계정 정보를 확인하고 닉네임을 변경할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          마이페이지로
        </button>
      </section>

      {/* 계정 정보 요약 + 프로필 이미지 */}
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-sm">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">
          계정 정보
        </h2>
        <div className="flex items-center gap-6">
          {/* 프로필 이미지 + 수정 버튼 */}
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-zinc-100">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="프로필 미리보기"
                  className="h-full w-full object-cover"
                />
              ) : currentProfileImage ? (
                <img
                  src={currentProfileImage}
                  alt="현재 프로필 이미지"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                  NO IMAGE
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
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
                  className="inline-flex items-center justify-center rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {isUpdatingImage ? "저장 중..." : "이미지 저장"}
                </button>
              )}
            </div>
          </div>

          {/* 텍스트 정보 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">아이디</span>
              <span className="font-medium text-zinc-900">
                {id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">현재 닉네임</span>
              <span className="font-medium text-zinc-900">
                {nickname}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">권한</span>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                {role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">가입일</span>
              <span className="text-xs text-zinc-700">
                {createdAtText}
              </span>
            </div>
            {imageError && (
              <p className="mt-2 text-xs text-red-600">{imageError}</p>
            )}
            {imageSuccess && (
              <p className="mt-2 text-xs text-emerald-600">{imageSuccess}</p>
            )}
          </div>
        </div>
      </section>

      {/* 닉네임 수정 폼 */}
      <section className="mb-10 rounded-2xl border border-zinc-200 bg-white p-6 text-sm shadow-sm">
        <h2 className="mb-3 text-sm font-semibold tracking-tight">
          닉네임 변경
        </h2>
        <p className="mb-3 text-xs text-zinc-500">
          화면 상단과 리뷰에 표시될 닉네임을 변경할 수 있습니다.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={editingNickname}
            onChange={(e) => setEditingNickname(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            placeholder="새 닉네임"
          />
          <button
            type="button"
            onClick={handleUpdateNickname}
            disabled={isUpdating}
            className="inline-flex w-full items-center justify-center rounded-full bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400 sm:w-auto"
          >
            {isUpdating ? "수정 중..." : "닉네임 저장"}
          </button>
        </div>
        {errorMessage && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-900">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            {successMessage}
          </div>
        )}
      </section>

      {/* (별도 프로필 이미지 섹션은 제거됨) */}
    </div>
  );
}

