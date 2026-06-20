export const SLIDE_SOURCE_KEY = "slide-source";

export type SlideSource = "user" | "admin";

export function getStoredSlideSource(): SlideSource {
  if (typeof window === "undefined") return "user";
  const value = localStorage.getItem(SLIDE_SOURCE_KEY);
  return value === "admin" ? "admin" : "user";
}

export function setSlideSource(source: SlideSource) {
  localStorage.setItem(SLIDE_SOURCE_KEY, source);
}
