import type { CSSProperties, ReactNode } from "react";
import { HOME_CONTENT_MAX_WIDTH } from "./constants";

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
    <Tag
      className={className}
      style={{ maxWidth: HOME_CONTENT_MAX_WIDTH, ...style }}
    >
      {children}
    </Tag>
  );
}
