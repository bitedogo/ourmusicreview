/** 개발자 가이드 사이드바·본문 셸 */

import { GuideShell } from "@/src/components/guides/guide-shell";
import { DEVELOPER_DOCS } from "@/src/lib/developer/docs";

interface DocsShellProps {
  activeSlug?: string;
  children: React.ReactNode;
}

export function DocsShell({ activeSlug, children }: DocsShellProps) {
  return (
    <GuideShell
      basePath="/developer"
      label="DEVELOPER GUIDE"
      docs={DEVELOPER_DOCS}
      activeSlug={activeSlug}
    >
      {children}
    </GuideShell>
  );
}
