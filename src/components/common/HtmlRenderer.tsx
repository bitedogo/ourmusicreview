"use client";
/** 안전한 HTML 본문 렌더러 */

import { useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  htmlContainsEmbeddedAudio,
  isEditorContentEmpty,
  normalizeHtml,
} from "@/src/lib/utils/editor";

interface HtmlRendererProps {
  html: string;
  className?: string;
  variant?: "full" | "preview";
}

const FULL_ALLOWED_TAGS = [
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
];

const PREVIEW_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "div",
  "span",
];

export function HtmlRenderer({
  html,
  className = "",
  variant = "full",
}: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPreview = variant === "preview";
  const hadAudio = !isPreview && htmlContainsEmbeddedAudio(html);
  const cleaned = normalizeHtml(html ?? "");
  const isEmpty = isEditorContentEmpty(cleaned);

  useEffect(() => {
    if (containerRef.current && !isEmpty) {
      containerRef.current.innerHTML = DOMPurify.sanitize(cleaned, {
        ALLOWED_TAGS: isPreview ? PREVIEW_ALLOWED_TAGS : FULL_ALLOWED_TAGS,
        ALLOWED_ATTR: isPreview
          ? ["class"]
          : [
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
    } else if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, [cleaned, isEmpty, isPreview]);

  if (isEmpty && !hadAudio) {
    if (isPreview) return null;
    return (
      <div className={`text-sm text-[var(--color-text-muted)] ${className}`}>
        내용이 없습니다.
      </div>
    );
  }

  if (isPreview) {
    return (
      <div
        ref={containerRef}
        className={`html-preview ${className}`}
        style={{ wordBreak: "break-word" }}
      />
    );
  }

  return (
    <div className="space-y-3">
      {hadAudio ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          이 글에 있던 음원 파일은 더 이상 재생할 수 없습니다.
        </p>
      ) : null}
      {isEmpty ? null : (
        <div
          ref={containerRef}
          className={`toastui-editor-contents ${className}`}
          style={{
            wordBreak: "break-word",
            lineHeight: "1.75",
          }}
        />
      )}
    </div>
  );
}
