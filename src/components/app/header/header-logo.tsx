/** 헤더 로고 */

import Link from "next/link";
import Image from "next/image";
import { LOGO } from "@/src/lib/layout";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";

export function HeaderLogo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center justify-center">
      <Image
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={LOGO.width}
        height={Math.round(LOGO.height)}
        className="h-auto w-[var(--logo-width)]"
        style={{ width: "var(--logo-width)", height: "var(--logo-height)" }}
        priority
      />
    </Link>
  );
}
