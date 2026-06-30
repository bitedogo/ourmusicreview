"use client";

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
