"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getStoredSlideSource,
  setSlideSource,
  type SlideSource,
} from "@/src/lib/slide-source";

export function useSlideSourceState() {
  const [slideSource, setSlideSourceState] = useState<SlideSource>("user");

  useEffect(() => {
    setSlideSourceState(getStoredSlideSource());
  }, []);

  useEffect(() => {
    const handler = () => setSlideSourceState(getStoredSlideSource());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const updateSlideSource = useCallback((source: SlideSource) => {
    setSlideSource(source);
    setSlideSourceState(source);
  }, []);

  return { slideSource, updateSlideSource };
}
