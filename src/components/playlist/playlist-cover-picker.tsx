"use client";
/** 플레이리스트 커버 미리보기 + 파일 선택 */

import Image from "next/image";
import { useRef, type ReactNode } from "react";

const ACCEPT = "image/jpeg,image/png,image/gif,image/webp";

interface PlaylistCoverPickerProps {
  previewUrl: string | null;
  fallbackUrl?: string | null;
  size?: "sm" | "md";
  selectLabel?: string;
  onPickFile: (file: File) => void;
  actions?: ReactNode;
}

export function PlaylistCoverPicker({
  previewUrl,
  fallbackUrl = null,
  size = "md",
  selectLabel = "사진 선택",
  onPickFile,
  actions,
}: PlaylistCoverPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayUrl = previewUrl || fallbackUrl;
  const boxClass = size === "sm" ? "h-14 w-14" : "h-16 w-16";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative overflow-hidden rounded-lg bg-zinc-100 ${boxClass} ${
          size === "sm" ? "bg-zinc-200" : ""
        }`}
      >
        {displayUrl ? (
          <Image
            src={displayUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--color-text-muted)]">
            No Cover
          </div>
        )}
      </div>
      <div className={`flex ${actions ? "flex-wrap gap-2" : "flex-col gap-1"}`}>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            onPickFile(file);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={
            size === "sm"
              ? "rounded-full border border-zinc-300 bg-white px-3 py-1 text-[11px] text-[var(--color-text-primary)]"
              : "rounded-full border border-zinc-300 px-3 py-1.5 text-[11px] font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
          }
        >
          {selectLabel}
        </button>
        {actions}
      </div>
    </div>
  );
}
