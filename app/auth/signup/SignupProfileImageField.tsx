"use client";
/** 회원가입 - 프로필 사진 선택 및 크롭 필드 */

import { useCallback } from "react";
import { useImageCropFlow } from "@/src/hooks/use-image-crop-flow";

interface SignupProfileImageFieldProps {
  profileImage: File | null;
  onImageConfirm: (file: File) => void;
}

export function SignupProfileImageField({
  profileImage,
  onImageConfirm,
}: SignupProfileImageFieldProps) {
  const handleConfirm = useCallback(
    (file: File) => {
      onImageConfirm(file);
    },
    [onImageConfirm]
  );

  const { openWithFile, cropModalNode } = useImageCropFlow({
    onCropped: handleConfirm,
  });

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">프로필 사진</label>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer rounded border border-zinc-300 bg-white px-3 py-2 text-xs hover:bg-zinc-50">
          파일 선택
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              e.target.value = "";
              if (file) {
                openWithFile(file);
              }
            }}
          />
        </label>
        <span className="text-xs text-zinc-500">
          {profileImage ? profileImage.name : "선택된 파일 없음"}
        </span>
      </div>
      <div className="space-y-0.5 text-xs text-zinc-500">
        <p>파일 선택 후 크롭하여 프로필 이미지를 설정할 수 있습니다.</p>
      </div>

      {cropModalNode}
    </div>
  );
}
