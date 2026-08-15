/** 가이드 마크다운 → HTML (서버 전용) */

import { Marked } from "marked";
import { rewriteGuideHref } from "@/src/lib/guides/links";

function escapeAttr(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderGuideMarkdown(markdown: string, basePath: string): string {
  const marked = new Marked();

  marked.use({
    gfm: true,
    renderer: {
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const nextHref = rewriteGuideHref(href, basePath);
        if (!nextHref) return text;

        const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
        const extra =
          nextHref.startsWith("http://") || nextHref.startsWith("https://")
            ? ' target="_blank" rel="noreferrer"'
            : "";

        return `<a href="${escapeAttr(nextHref)}"${titleAttr}${extra}>${text}</a>`;
      },
    },
  });

  return marked.parse(markdown, { async: false }) as string;
}
