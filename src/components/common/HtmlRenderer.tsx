"use client";

import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";

interface HtmlRendererProps {
  html: string;
  className?: string;
}

/**
 * Toast UI Editor로 작성된 HTML 내용을 안전하게 렌더링하는 컴포넌트
 * DOMPurify를 사용하여 XSS 공격을 방지합니다.
 */
export function HtmlRenderer({ html, className = "" }: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && html) {
      // DOMPurify로 HTML을 정제하여 안전하게 렌더링
      const sanitizedHtml = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          "p",
          "br",
          "strong",
          "em",
          "u",
          "s",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
          "blockquote",
          "pre",
          "code",
          "a",
          "img",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "hr",
          "div",
          "span",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "class",
          "style",
          "width",
          "height",
        ],
        ALLOW_DATA_ATTR: false,
      });

      containerRef.current.innerHTML = sanitizedHtml;
    } else if (containerRef.current && !html) {
      // 빈 내용인 경우 빈 문자열로 설정
      containerRef.current.innerHTML = "";
    }
  }, [html]);

  if (!html || html.trim() === "" || html.trim() === "<p><br></p>") {
    return (
      <div className={`text-sm text-zinc-400 ${className}`}>
        내용이 없습니다.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`toastui-editor-contents ${className}`}
      style={{
        wordBreak: "break-word",
        lineHeight: "1.75",
      }}
    />
  );
}
