"use client";
/** ImageCropModal object-URL 수명·열기/닫기 공통 훅 */

import { useCallback, useState } from "react";
import { ImageCropModal } from "@/src/components/app/ImageCropModal";

export interface ImageCropFlowOptions {
  title?: string;
  description?: string;
  circularCrop?: boolean;
  onCropped: (file: File) => void;
}

interface CropModalState {
  src: string;
  fileName: string;
}

export function useImageCropFlow({
  title,
  description,
  circularCrop = true,
  onCropped,
}: ImageCropFlowOptions) {
  const [cropModal, setCropModal] = useState<CropModalState | null>(null);

  const clear = useCallback(() => {
    setCropModal((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return null;
    });
  }, []);

  const openWithFile = useCallback((file: File) => {
    setCropModal((prev) => {
      if (prev?.src) URL.revokeObjectURL(prev.src);
      return {
        src: URL.createObjectURL(file),
        fileName: file.name,
      };
    });
  }, []);

  const handleConfirm = useCallback(
    (file: File) => {
      setCropModal((prev) => {
        if (prev?.src) URL.revokeObjectURL(prev.src);
        return null;
      });
      onCropped(file);
    },
    [onCropped]
  );

  const cropModalNode = cropModal ? (
    <ImageCropModal
      imageSrc={cropModal.src}
      fileName={cropModal.fileName}
      title={title}
      description={description}
      circularCrop={circularCrop}
      onConfirm={handleConfirm}
      onCancel={clear}
    />
  ) : null;

  return {
    openWithFile,
    clear,
    cropModalNode,
    isOpen: cropModal != null,
  };
}

export const PLAYLIST_COVER_CROP_OPTIONS = {
  title: "플레이리스트 대표 사진 설정",
  description: "정사각형으로 표시될 영역을 선택해주세요.",
  circularCrop: false as const,
};
