/** 개발자 가이드 마크다운 HTML 본문 */

import { renderGuideMarkdown } from "@/src/lib/guides/render-markdown";

interface MarkdownBodyProps {
  markdown: string;
  basePath?: string;
}

export function MarkdownBody({
  markdown,
  basePath = "/developer",
}: MarkdownBodyProps) {
  const html = renderGuideMarkdown(markdown, basePath);

  return (
    <div
      className="developer-markdown"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
