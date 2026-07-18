/** 페이지 콘텐츠 컨테이너 레이아웃 */

import type { CSSProperties, ReactNode } from "react";

export const contentMaxWidthStyle: CSSProperties = {
  maxWidth: "var(--layout-content-max-width)",
};

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "main" | "footer";
}

export function ContentContainer({
  children,
  className = "",
  style,
  as: Tag = "div",
}: ContentContainerProps) {
  return (
    <Tag className={className} style={{ ...contentMaxWidthStyle, ...style }}>
      {children}
    </Tag>
  );
}
