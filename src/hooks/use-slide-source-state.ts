"use client";
/** 마이페이지 슬라이드 소스 상태 훅 */

import { useCallback, useSyncExternalStore } from "react";
import {
  getStoredSlideSource,
  setSlideSource,
  subscribeSlideSource,
  type SlideSource,
} from "@/src/lib/slide-source";

const getServerSlideSource = (): SlideSource => "user";

export function useSlideSourceState() {
  const slideSource = useSyncExternalStore(
    subscribeSlideSource,
    getStoredSlideSource,
    getServerSlideSource
  );

  const updateSlideSource = useCallback((source: SlideSource) => {
    setSlideSource(source);
  }, []);

  return { slideSource, updateSlideSource };
}
