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
