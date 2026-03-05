"use client";

import { useCallback, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

function cropImageToBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const baseName = fileName.replace(/\.[^.]+$/, "") || "profile";
        const file = new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
        resolve(file);
      },
      "image/jpeg",
      0.92
    );
  });
}

interface ImageCropModalProps {
  imageSrc: string;
  fileName: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

export function ImageCropModal({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: "px", width: Math.min(naturalWidth, naturalHeight) * 0.9 },
        1,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

  async function handleConfirm() {
    if (!imgRef || !completedCrop) return;
    setIsProcessing(true);
    try {
      const file = await cropImageToBlob(imgRef, completedCrop, fileName);
      onConfirm(file);
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[70vh] overflow-auto p-4">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            프로필 이미지 크롭
          </h2>
          <p className="mb-4 text-sm text-zinc-600">
            원형으로 표시될 영역을 선택해주세요.
          </p>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
              aspect={1}
              circularCrop
              className="max-h-[50vh]"
            >
              {/* react-image-crop은 HTMLImageElement ref를 직접 요구합니다. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={setImgRef}
                src={imageSrc}
                alt="크롭할 이미지"
                onLoad={onImageLoad}
                className="max-h-[50vh] w-auto"
                style={{ maxWidth: "100%" }}
              />
            </ReactCrop>
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-200 p-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-zinc-200 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!completedCrop || isProcessing}
            className="flex-1 rounded-full bg-black py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isProcessing ? "처리 중..." : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
