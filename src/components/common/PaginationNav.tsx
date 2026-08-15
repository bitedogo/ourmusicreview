/** 전역 페이지네이션 */

import Link from "next/link";
import { getPaginationItems } from "@/src/lib/utils/pagination";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  /** Link 모드 — 페이지별 href */
  buildHref?: (page: number) => string;
  /** Button 모드 — 클릭 핸들러 */
  onPageChange?: (page: number) => void;
  className?: string;
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="12"
      height="20"
      viewBox="0 0 12 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={direction === "right" ? "-scale-x-100" : undefined}
    >
      <path
        d="M10 2L2 10L10 18"
        stroke="#43A7B2"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const pageBtnClass =
  "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] text-[16px] font-normal leading-[145%] tracking-[-0.005em] transition";

const arrowBtnClass =
  "inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center";

export function PaginationNav({
  currentPage,
  totalPages,
  buildHref,
  onPageChange,
  className = "",
}: PaginationNavProps) {
  if (totalPages < 2) return null;

  const items = getPaginationItems(currentPage, totalPages);
  const firstPage = 1;
  const lastPage = totalPages;
  const canGoFirst = currentPage > firstPage;
  const canGoLast = currentPage < lastPage;

  function goTo(page: number) {
    onPageChange?.(page);
  }

  function renderPage(page: number) {
    const isActive = page === currentPage;
    const btnClass = `${pageBtnClass} ${
      isActive ? "bg-[#43A7B2] text-white" : "bg-white text-[var(--color-text-primary)] hover:bg-zinc-50"
    }`;

    if (buildHref) {
      return (
        <Link
          key={page}
          href={buildHref(page)}
          className={btnClass}
          aria-current={isActive ? "page" : undefined}
        >
          {page}
        </Link>
      );
    }

    return (
      <button
        key={page}
        type="button"
        onClick={() => goTo(page)}
        className={btnClass}
        aria-current={isActive ? "page" : undefined}
      >
        {page}
      </button>
    );
  }

  /** 왼쪽=첫 페이지, 오른쪽=마지막 페이지 */
  function renderEndArrow(direction: "left" | "right") {
    const targetPage = direction === "left" ? firstPage : lastPage;
    const enabled = direction === "left" ? canGoFirst : canGoLast;
    const label = direction === "left" ? "첫 페이지로 이동" : "마지막 페이지로 이동";
    const stateClass = enabled
      ? "opacity-100"
      : "pointer-events-none opacity-30";

    if (buildHref) {
      if (!enabled) {
        return (
          <span className={`${arrowBtnClass} ${stateClass}`} aria-hidden>
            <Chevron direction={direction} />
          </span>
        );
      }
      return (
        <Link
          href={buildHref(targetPage)}
          className={`${arrowBtnClass} ${stateClass}`}
          aria-label={label}
        >
          <Chevron direction={direction} />
        </Link>
      );
    }

    return (
      <button
        type="button"
        disabled={!enabled}
        onClick={() => goTo(targetPage)}
        className={`${arrowBtnClass} ${stateClass}`}
        aria-label={label}
      >
        <Chevron direction={direction} />
      </button>
    );
  }

  return (
    <nav
      aria-label="페이지 탐색"
      className={`inline-flex h-[50px] items-center gap-[10px] p-[10px] ${className}`.trim()}
    >
      {renderEndArrow("left")}

      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <span
            key={`e-${idx}`}
            className="inline-flex h-[30px] w-[30px] shrink-0 items-end justify-center text-[24px] font-normal leading-[145%] tracking-[-0.005em] text-[var(--color-text-primary)]"
            aria-hidden
          >
            ...
          </span>
        ) : (
          renderPage(item)
        )
      )}

      {renderEndArrow("right")}
    </nav>
  );
}
