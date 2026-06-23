import localFont from "next/font/local";

/** 앱 전역 폰트 — Pretendard만 사용합니다. */
export const pretendard = localFont({
  src: [
    {
      path: "../../../public/fonts/pretendard-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/pretendard-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../public/fonts/pretendard-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../../public/fonts/pretendard-latin-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});
