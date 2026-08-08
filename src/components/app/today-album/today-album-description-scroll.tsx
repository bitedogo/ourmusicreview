"use client";
/** 오늘의 앨범 소개글 스크롤 — Figma Vector 88/89 (6px · 라운드 · 화살표 없음) */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const THUMB_MIN_PX = 40;

interface TodayAlbumDescriptionScrollProps {
  children: ReactNode;
  className?: string;
}

export function TodayAlbumDescriptionScroll({
  children,
  className = "",
}: TodayAlbumDescriptionScrollProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  const syncMetrics = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    setMetrics({
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
    });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    syncMetrics();

    const resizeObserver = new ResizeObserver(syncMetrics);
    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, [syncMetrics, children]);

  const overflow = metrics.scrollHeight - metrics.clientHeight;
  const needsScroll = overflow > 1;
  const trackHeight = metrics.clientHeight;
  const thumbHeight = needsScroll
    ? Math.max(
        THUMB_MIN_PX,
        (metrics.clientHeight / metrics.scrollHeight) * trackHeight
      )
    : trackHeight;
  const maxThumbOffset = Math.max(0, trackHeight - thumbHeight);
  const thumbOffset =
    overflow > 0 ? (metrics.scrollTop / overflow) * maxThumbOffset : 0;

  const handleThumbPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const el = viewportRef.current;
    if (!el || !needsScroll) return;

    const startY = event.clientY;
    const startScrollTop = el.scrollTop;
    const pointerId = event.pointerId;
    const target = event.currentTarget;
    target.setPointerCapture(pointerId);

    const onMove = (moveEvent: PointerEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const scrollDelta =
        maxThumbOffset > 0 ? (deltaY / maxThumbOffset) * overflow : 0;
      el.scrollTop = startScrollTop + scrollDelta;
    };

    const onUp = () => {
      target.releasePointerCapture(pointerId);
      target.removeEventListener("pointermove", onMove);
      target.removeEventListener("pointerup", onUp);
      target.removeEventListener("pointercancel", onUp);
    };

    target.addEventListener("pointermove", onMove);
    target.addEventListener("pointerup", onUp);
    target.addEventListener("pointercancel", onUp);
  };

  return (
    <div className={`relative ${className}`.trim()}>
      <div
        ref={viewportRef}
        onScroll={syncMetrics}
        className="today-album-description-scroll max-h-[var(--today-album-description-max-height)] overflow-y-auto whitespace-pre-line break-words pr-[14px] text-left text-[11px] font-normal leading-[170%] tracking-[0.03em] text-[#717171] sm:text-[15px]"
      >
        {children}
      </div>

      {needsScroll ? (
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-0 hidden w-[6px] sm:block"
          aria-hidden
        >
          <div className="absolute inset-y-0 left-0 w-[6px] rounded-full bg-[#D9D9D9]" />
          <div
            className="pointer-events-auto absolute left-0 w-[6px] cursor-pointer rounded-full bg-[#505050]"
            style={{
              height: `${thumbHeight}px`,
              transform: `translateY(${thumbOffset}px)`,
            }}
            onPointerDown={handleThumbPointerDown}
          />
        </div>
      ) : null}
    </div>
  );
}
