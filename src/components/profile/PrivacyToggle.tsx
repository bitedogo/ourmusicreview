"use client";
/** 프로필 공개/비공개 토글 */

export function PrivacyToggle({
  isPublic,
  onChange,
  disabled,
}: {
  isPublic: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex rounded-lg bg-zinc-100 p-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`rounded-md px-3 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
          isPublic
            ? "bg-white text-[var(--color-brand-primary)] shadow-sm"
            : "text-zinc-400 hover:text-zinc-600"
        }`}
      >
        공개
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`rounded-md px-3 py-1 text-[11px] font-semibold transition disabled:opacity-50 ${
          !isPublic
            ? "bg-white text-zinc-700 shadow-sm"
            : "text-zinc-400 hover:text-zinc-600"
        }`}
      >
        비공개
      </button>
    </div>
  );
}
