/** Masterpiece 추가 + 배지 (말풍선·추가 카드 공용) */

interface MasterpiecePlusBadgeProps {
  /** 말풍선 인라인용 소형 */
  size?: "sm" | "md";
}

const SIZE_CLASS = {
  sm: {
    outer: "h-[22px] w-[22px] border-2",
    inner: "h-[11px] w-[11px]",
    stroke: "border-[1.5px]",
  },
  md: {
    outer: "h-[54px] w-[54px] border-[3px]",
    inner: "h-8 w-8",
    stroke: "border-2",
  },
} as const;

export function MasterpiecePlusBadge({ size = "sm" }: MasterpiecePlusBadgeProps) {
  const s = SIZE_CLASS[size];

  return (
    <span
      className={`mx-0.5 inline-flex shrink-0 items-center justify-center rounded-full border-[#71BCC5] align-middle ${s.outer} ${size === "sm" ? "translate-y-[-1px]" : ""}`}
      aria-hidden
    >
      <span className={`relative block ${s.inner}`}>
        <span
          className={`absolute left-0 top-1/2 h-0 w-full -translate-y-1/2 border-t-[#71BCC5] ${s.stroke}`}
        />
        <span
          className={`absolute left-1/2 top-0 h-full w-0 -translate-x-1/2 border-l-[#71BCC5] ${s.stroke}`}
        />
      </span>
    </span>
  );
}
