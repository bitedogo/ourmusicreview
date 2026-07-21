/** Masterpiece 추가 + 배지 (말풍선·추가 카드 공용) */

interface MasterpiecePlusBadgeProps {
  /** 말풍선 인라인용 소형 / 추가 카드용 */
  size?: "sm" | "md";
}

export function MasterpiecePlusBadge({ size = "sm" }: MasterpiecePlusBadgeProps) {
  const isSm = size === "sm";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border-[#71BCC5] align-middle ${
        isSm
          ? "mx-0.5 h-[22px] w-[22px] translate-y-[-1px] border-2"
          : "h-[54px] w-[54px] border-[3px]"
      }`}
      aria-hidden
    >
      <span className={`relative block ${isSm ? "h-[11px] w-[11px]" : "h-8 w-8"}`}>
        <span
          className={`absolute left-0 top-1/2 h-0 w-full -translate-y-1/2 border-[#71BCC5] ${
            isSm ? "border-t-[1.5px]" : "border-t-2"
          }`}
        />
        <span
          className={`absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-[#71BCC5] ${
            isSm ? "border-l-[1.5px]" : "border-l-2"
          }`}
        />
      </span>
    </span>
  );
}
