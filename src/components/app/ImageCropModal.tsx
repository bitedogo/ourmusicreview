"use client";
/** 프로필·이미지 크롭 모달 */

import { useCallback, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const MAX_OUTPUT_SIZE = 400;
const OUTPUT_QUALITY = 0.85;

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

    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    const outputScale = Math.min(
      1,
      MAX_OUTPUT_SIZE / Math.max(sourceWidth, sourceHeight)
    );
    canvas.width = Math.round(sourceWidth * outputScale);
    canvas.height = Math.round(sourceHeight * outputScale);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const supportsWebp = canvas
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
    const mimeType = supportsWebp ? "image/webp" : "image/jpeg";
    const ext = supportsWebp ? "webp" : "jpg";

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const baseName = fileName.replace(/\.[^.]+$/, "") || "profile";
        const file = new File([blob], `${baseName}.${ext}`, { type: mimeType });
        resolve(file);
      },
      mimeType,
      OUTPUT_QUALITY
    );
  });
}

interface ImageCropModalProps {
  imageSrc: string;
  fileName: string;
  onConfirm: (file: File) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  /** 기본 true(프로필). 플레이리스트 대표사진은 사각형 */
  circularCrop?: boolean;
}

export function ImageCropModal({
  imageSrc,
  fileName,
  onConfirm,
  onCancel,
  title = "프로필 이미지 크롭",
  description = "원형으로 표시될 영역을 선택해주세요.",
  circularCrop = true,
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
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[70vh] overflow-auto p-4">
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">{title}</h2>
          <p className="mb-4 text-sm text-zinc-600">{description}</p>
          <div className="flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
              aspect={1}
              circularCrop={circularCrop}
              className="min-h-[200px] min-w-[200px] flex items-center justify-center"
            >
              <img
                ref={setImgRef}
                src={imageSrc}
                alt="크롭할 이미지"
                onLoad={onImageLoad}
                className="w-full h-auto object-contain"
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
