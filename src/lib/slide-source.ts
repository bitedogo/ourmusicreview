/** 슬라이드 소스(유저/피처드) 판별 */

export const SLIDE_SOURCE_KEY = "slide-source";

export type SlideSource = "user" | "admin";

export function getStoredSlideSource(): SlideSource {
  if (typeof window === "undefined") return "user";
  const value = localStorage.getItem(SLIDE_SOURCE_KEY);
  return value === "admin" ? "admin" : "user";
}

const listeners = new Set<() => void>();

export function setSlideSource(source: SlideSource) {
  localStorage.setItem(SLIDE_SOURCE_KEY, source);
  listeners.forEach((listener) => listener());
}

export function subscribeSlideSource(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}
