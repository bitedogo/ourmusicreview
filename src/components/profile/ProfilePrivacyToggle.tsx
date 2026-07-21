/** 프로필 Figma 스타일 공개/비공개 토글 */

interface ProfilePrivacyToggleProps {
  isPublic: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

export function ProfilePrivacyToggle({
  isPublic,
  onChange,
  disabled,
  size = "md",
}: ProfilePrivacyToggleProps) {
  const isSm = size === "sm";

  return (
    <div
      className={`box-border flex items-center border border-[#D9D9D9] bg-[#FAFAFA] ${
        isSm
          ? "h-[25px] w-[90px] rounded-[5px] px-[4px]"
          : "h-[35px] w-[111px] rounded-[10px] px-[5px]"
      }`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`flex items-center justify-center transition disabled:opacity-50 ${
          isSm
            ? "h-[17px] w-[38px] rounded-[4px] text-[9px] leading-[11px]"
            : "h-6 w-[47px] rounded-[6px] text-[13px] leading-4"
        } ${
          isPublic
            ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
            : "bg-transparent text-[#D9D9D9]"
        }`}
      >
        공개
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`flex flex-1 items-center justify-center transition disabled:opacity-50 ${
          isSm
            ? "h-[17px] rounded-[4px] text-[9px] leading-[11px]"
            : "h-6 rounded-[6px] text-[13px] leading-4"
        } ${
          !isPublic
            ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
            : "bg-transparent text-[#D9D9D9]"
        }`}
      >
        비공개
      </button>
    </div>
  );
}
