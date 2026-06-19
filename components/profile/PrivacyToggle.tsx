"use client";

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
    <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${
          isPublic
            ? "bg-white text-[var(--color-brand-primary)] shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        공개
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`rounded-md px-2.5 py-1 text-[10px] font-semibold transition disabled:opacity-50 ${
          !isPublic
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
      >
        비공개
      </button>
    </div>
  );
}
