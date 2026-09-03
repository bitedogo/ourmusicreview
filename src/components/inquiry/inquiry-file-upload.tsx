"use client";
/** 문의 첨부파일 업로드 */

import { useRef, useState } from "react";
import {
  INQUIRY_FILE_MAX_COUNT,
  type InquiryAttachment,
} from "@/src/lib/inquiries/types";
import { uploadInquiryAttachmentApi } from "@/src/lib/inquiries/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";

interface InquiryFileUploadProps {
  attachments: InquiryAttachment[];
  onChange: (attachments: InquiryAttachment[]) => void;
  disabled?: boolean;
}

export function InquiryFileUpload({
  attachments,
  onChange,
  disabled = false,
}: InquiryFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length || disabled) return;
    const remaining = INQUIRY_FILE_MAX_COUNT - attachments.length;
    if (remaining <= 0) {
      setError(`첨부 파일은 최대 ${INQUIRY_FILE_MAX_COUNT}개까지입니다.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    const next = [...attachments];

    for (const file of Array.from(fileList).slice(0, remaining)) {
      try {
        const data = await uploadInquiryAttachmentApi(file);
        next.push(data.data.attachment);
      } catch (uploadError) {
        setError(getApiErrorMessage(uploadError, "파일 업로드에 실패했습니다."));
        break;
      }
    }

    onChange(next);
    setIsUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(attachments.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          void handleFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-[7.5rem] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-4 py-6 text-center transition hover:border-[#43A7B2]/60 hover:bg-[#EFFAF8] ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#43A7B2] shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 16V4M12 4 8 8M12 4l4 4M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {isUploading ? "업로드 중..." : "클릭하거나 파일을 드래그하세요"}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          PNG, JPG, GIF, WebP, PDF, TXT · 최대 {INQUIRY_FILE_MAX_COUNT}개 · 파일당 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain"
          onChange={(event) => {
            void handleFiles(event.target.files);
          }}
        />
      </div>

      {error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}

      {attachments.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <li
              key={`${file.url}-${index}`}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-[var(--color-text-secondary)]"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="shrink-0 text-[var(--color-text-muted)] hover:text-red-500"
                aria-label={`${file.name} 삭제`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
