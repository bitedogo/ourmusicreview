import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ConditionalAppHeader } from "./components/conditional-app-header";
import { ConditionalFooter } from "./components/conditional-footer";
import { pretendard } from "@/src/lib/fonts/pretendard";
import {
  LOGO_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_SRC,
  OG_IMAGE_WIDTH,
} from "@/src/lib/site/branding";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.comeonoru.com"),
  title: {
    default: "ORU | Music Review & Community",
    template: "%s | ORU",
  },
  description:
    "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.",
  applicationName: "ORU",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://www.comeonoru.com",
    siteName: "ORU",
    title: "ORU | Music Review & Community",
    description:
      "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.",
    locale: "ko_KR",
    images: [
      {
        url: OG_IMAGE_SRC,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: LOGO_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORU | Music Review & Community",
    description:
      "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.",
    images: [OG_IMAGE_SRC],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${pretendard.className}`}
      suppressHydrationWarning
    >
      <body className="font-sans flex min-h-screen flex-col antialiased overflow-x-clip bg-white text-zinc-900">
        <Providers>
          <ConditionalAppHeader />
          <main className="flex flex-1 flex-col bg-white">{children}</main>
          <ConditionalFooter />
        </Providers>
      </body>
    </html>
  );
}
