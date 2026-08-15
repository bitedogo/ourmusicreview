/** 가이드 문서 내부 마크다운 링크를 사이트 경로로 변환 */

export function rewriteGuideHref(
  href: string | undefined,
  basePath: string
): string {
  if (!href) return "";
  if (href.startsWith("#")) return href;

  const markdownMatch = href.match(/^\.\/([\w-]+)\.md(#.*)?$/);
  if (markdownMatch) {
    return `${basePath}/${markdownMatch[1]}${markdownMatch[2] ?? ""}`;
  }

  if (href.startsWith("../") && href.endsWith(".md")) {
    return "";
  }

  return href;
}
