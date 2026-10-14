/** 에디터 HTML·본문 유틸 */

const EMBEDDED_AUDIO_TAG_RE = /<\/?(?:audio|source)\b[^>]*>/gi;

export function htmlContainsEmbeddedAudio(html: string): boolean {
  return /<(?:audio|source)\b/i.test(html);
}

export function stripEmbeddedAudio(html: string): string {
  return html.replace(EMBEDDED_AUDIO_TAG_RE, "");
}

export function normalizeHtml(value: string): string {
  return stripEmbeddedAudio(value).replace(/<p><\/p>/g, "<p><br></p>");
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

export function getHtmlPlainText(html: string): string {
  const stripped = (html ?? "").replace(/<[^>]*>/g, "").trim();
  return decodeHtmlEntities(stripped);
}

const FIRST_IMG_SRC_RE =
  /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;

export function getFirstHtmlImageSrc(html: string): string | null {
  const match = FIRST_IMG_SRC_RE.exec(html ?? "");
  const raw = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  if (!raw) return null;
  const src = decodeHtmlEntities(raw);
  if (src.startsWith("data:")) return null;
  if (!/^https?:\/\//i.test(src) && !src.startsWith("/")) return null;
  return src;
}

export function getHtmlExcerpt(html: string, maxLength = 140): string {
  const plain = getReviewPreviewText(html).replace(/\s+/g, " ").trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}…`;
}

const PREVIEW_HTML_MAX = 8000;

export function getHtmlPreview(html: string): string {
  const withoutMedia = normalizeHtml(html ?? "")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/<\/?a\b[^>]*>/gi, "")
    .replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br><br>");
  if (isEditorContentEmpty(withoutMedia) || !getHtmlPlainText(withoutMedia)) {
    return "";
  }
  if (withoutMedia.length <= PREVIEW_HTML_MAX) return withoutMedia;
  const cut = withoutMedia.slice(0, PREVIEW_HTML_MAX);
  const lastTagEnd = cut.lastIndexOf(">");
  return lastTagEnd > 0 ? cut.slice(0, lastTagEnd + 1) : cut;
}

export function getReviewPreviewText(html: string): string {
  const stripped = (html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return decodeHtmlEntities(stripped);
}

export function isEditorContentEmpty(html: string): boolean {
  const trimmed = html.trim();
  return !trimmed || trimmed === "<p><br></p>";
}

const COMPOSER_TITLE_MAX = 60;

export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function titleFromPlainBody(
  text: string,
  maxLength = COMPOSER_TITLE_MAX
): string {
  const firstLine =
    (text ?? "")
      .replace(/\r\n/g, "\n")
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line) ?? "";
  if (firstLine.length <= maxLength) return firstLine;
  return firstLine.slice(0, maxLength).trimEnd();
}

export function plainTextToEditorHtml(text: string): string {
  const lines = (text ?? "").replace(/\r\n/g, "\n").split("\n");
  const hasText = lines.some((line) => line.trim());
  if (!hasText) return "";
  return lines
    .map((line) =>
      line.trim() ? `<p>${escapeHtmlText(line)}</p>` : "<p><br></p>"
    )
    .join("");
}
