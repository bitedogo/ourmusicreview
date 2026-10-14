"use client";
/** 피드 본문 — 일곱 줄 넘으면 더보기로 펼침 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";

const PREVIEW_CLASS =
  "text-[14px] leading-relaxed text-[var(--color-text-primary)] [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-200 [&_blockquote]:pl-3 [&_li]:ml-4 [&_ol]:list-decimal [&_strong]:font-semibold [&_b]:font-semibold [&_em]:italic [&_ul]:list-disc";

interface BoardFeedExcerptProps {
  html: string;
  href: string;
}

export function BoardFeedExcerpt({ html, href }: BoardFeedExcerptProps) {
  const clampRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const el = clampRef.current;
    if (!el || expanded) return;

    function measure() {
      if (!el) return;
      setCanExpand(el.scrollHeight - el.clientHeight > 1);
    }

    const observer = new MutationObserver(measure);
    observer.observe(el, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(el);
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [html, expanded]);

  return (
    <div className="mt-2">
      <Link href={href} className="block">
        <div
          ref={clampRef}
          className={`${PREVIEW_CLASS} ${
            expanded ? "" : "max-h-[calc(1.625em*7)] overflow-hidden"
          }`}
        >
          <HtmlRenderer html={html} variant="preview" />
        </div>
      </Link>
      {canExpand && !expanded ? (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="text-[13px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)]"
          >
            더보기
          </button>
        </div>
      ) : null}
    </div>
  );
}
