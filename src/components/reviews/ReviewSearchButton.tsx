/** 앨범 리뷰 검색 버튼 */

interface ReviewSearchButtonProps {
  onClick: () => void;
}

export function ReviewSearchButton({ onClick }: ReviewSearchButtonProps) {
  return (
    <button
      type="button"
      aria-label="리뷰 검색"
      onClick={onClick}
      className="flex h-8 w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.25)] transition hover:bg-[#FAFAFA]"
    >
      <svg
        width="46"
        height="32"
        viewBox="4 3 46 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="block"
      >
        <circle
          cx="24.9259"
          cy="17.9259"
          r="5.92593"
          stroke="#43A7B2"
          strokeWidth="2"
        />
        <path
          d="M29.6482 22.6484L35 28.0003"
          stroke="#43A7B2"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
