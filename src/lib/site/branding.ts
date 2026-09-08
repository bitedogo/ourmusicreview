/** 사이트 브랜드명·공개 URL·로고 상수 */

const DEFAULT_SITE_URL = "https://www.comeonoru.com";

function normalizeSiteUrl(value: string | undefined): string {
  if (!value) return DEFAULT_SITE_URL;

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_NAME = "ORU";
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const SITE_DESCRIPTION =
  "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.";

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${SITE_URL}/`).toString();
}

export const LOGO_SRC = "/oru_logo.png";
export const LOGO_ALT = "ORU 로고";

export const OG_IMAGE_SRC = LOGO_SRC;
export const OG_IMAGE_WIDTH = 1000;
export const OG_IMAGE_HEIGHT = 517;
