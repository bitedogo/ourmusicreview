/** 프로필 i 아이콘 툴팁 — hover(데스크톱) / tap(모바일) */

import { useEffect, useRef, useState, type MouseEvent } from "react";

export function useProfileInfoTip() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const canHoverRef = useRef(false);

  useEffect(() => {
    canHoverRef.current = window.matchMedia("(hover: hover)").matches;
  }, []);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return {
    open,
    rootRef,
    canHoverRef,
    onMouseEnter: () => {
      if (canHoverRef.current) setOpen(true);
    },
    onMouseLeave: () => {
      if (canHoverRef.current) setOpen(false);
    },
    onToggleClick: (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!canHoverRef.current) {
        setOpen((prev) => !prev);
      }
    },
  };
}
