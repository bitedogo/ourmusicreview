/**
 * Pretendard Variable 폰트 로더 (한글·100–900 굵기).
 * 파일: PretendardVariable.woff2 (SIL OFL, orioncactus/pretendard)
 */

import localFont from "next/font/local";

export const pretendard = localFont({
  src: "./PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});
