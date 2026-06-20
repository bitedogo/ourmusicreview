import Link from "next/link";
import Image from "next/image";
import { LOGO_ALT, LOGO_HEIGHT, LOGO_SRC, LOGO_WIDTH } from "@/src/lib/site/branding";

export function HeaderLogo() {
  return (
    <Link href="/" className="inline-flex shrink-0 items-center justify-center">
      <Image
        src={LOGO_SRC}
        alt={LOGO_ALT}
        width={LOGO_WIDTH}
        height={Math.round(LOGO_HEIGHT)}
        className="h-auto w-[141px]"
        style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT }}
        priority
      />
    </Link>
  );
}
