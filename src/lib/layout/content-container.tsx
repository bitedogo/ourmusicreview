import type { CSSProperties, ReactNode } from "react";

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
      style={{ maxWidth: "var(--layout-content-max-width)", ...style }}
    >
      {children}
    </Tag>
  );
}
