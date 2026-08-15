"use client";
/** 오늘의 앨범 커스텀 스크롤 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const THUMB_MIN_PX = 40;

interface TodayAlbumScrollFrameProps {
  children: ReactNode;
  className?: string;
  viewportClassName: string;
  trackClassName?: string;
  trackHeightPx?: number;
  trackOffsetTopPx?: number;
  trackAlways?: boolean;
}

export function TodayAlbumScrollFrame({
  children,
  className = "",
  viewportClassName,
  trackClassName = "right-0 top-0 bottom-0",
  trackHeightPx,
  trackOffsetTopPx = 0,
  trackAlways = false,
}: TodayAlbumScrollFrameProps) {
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
    const observer = new ResizeObserver(syncMetrics);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [syncMetrics, children]);

  const overflow = metrics.scrollHeight - metrics.clientHeight;
  const needsScroll = overflow > 1;
  const trackHeight = trackHeightPx ?? metrics.clientHeight;
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
      el.scrollTop =
        startScrollTop +
        (maxThumbOffset > 0
          ? ((moveEvent.clientY - startY) / maxThumbOffset) * overflow
          : 0);
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

  const showTrack = trackAlways || needsScroll;

  return (
    <div className={`relative overflow-hidden ${className}`.trim()}>
      <div
        ref={viewportRef}
        onScroll={syncMetrics}
        className={`today-album-scroll ${viewportClassName}`.trim()}
      >
        {children}
      </div>

      {showTrack ? (
        <div
          className={`pointer-events-none absolute hidden w-[var(--today-album-scrollbar-size)] sm:block ${trackClassName}`.trim()}
          style={
            trackHeightPx != null
              ? { height: `${trackHeightPx}px`, top: `${trackOffsetTopPx}px` }
              : undefined
          }
          aria-hidden
        >
          <div className="absolute inset-y-0 left-0 w-full rounded-full bg-[var(--today-album-scrollbar-track)]" />
          <div
            className="pointer-events-auto absolute left-0 w-full cursor-pointer rounded-full bg-[var(--today-album-scrollbar-thumb)]"
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
