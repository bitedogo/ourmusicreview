"use client";
/** 디자이너 가이드 — 클릭 시 HEX 복사 칩 */

import { useState } from "react";

export interface ColorChipData {
  name: string;
  hex: string;
  token: string;
  swatch: string;
  note?: string;
}

interface ColorChipProps extends ColorChipData {
  large?: boolean;
}

export function ColorChip({ name, hex, token, swatch, note, large }: ColorChipProps) {
  const [copied, setCopied] = useState(false);

  async function copyHex() {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void copyHex()}
      className="flex w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition hover:border-[var(--color-brand-primary)]"
    >
      <span
        className={large ? "block h-24 w-full" : "block h-16 w-full"}
        style={{ background: swatch }}
      />
      <span className="flex flex-col gap-0.5 px-3 py-2.5">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
          {name}
        </span>
        <span className="font-mono text-xs text-[var(--color-text-secondary)]">
          {copied ? "복사됨" : hex}
        </span>
        <span className="font-mono text-[11px] text-[var(--color-text-muted)]">
          {token}
        </span>
        {note ? (
          <span className="mt-1 text-[11px] leading-4 text-[var(--color-text-secondary)]">
            {note}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function ColorChipGrid({
  chips,
  large,
}: {
  chips: ColorChipData[];
  large?: boolean;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {chips.map((chip) => (
        <ColorChip key={chip.token + chip.hex} large={large} {...chip} />
      ))}
    </div>
  );
}
