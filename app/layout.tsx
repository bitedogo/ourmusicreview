import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "./components/app-header";
import { Footer } from "./components/Footer";
import { pretendard } from "@/src/lib/fonts/pretendard";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.comeonoru.com"),
  title: {
    default: "ORU | Music Review & Community",
    template: "%s | ORU",
  },
  description:
    "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.",
  applicationName: "ORU",
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
        url: "/orumusicweb.png",
        width: 824,
        height: 232,
        alt: "ORU 로고",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ORU | Music Review & Community",
    description:
      "음악을 기록하고 공유하는 커뮤니티 ORU. 앨범 리뷰를 남기고, 새로운 음악을 발견해보세요.",
    images: ["/orumusicweb.png"],
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
      <body className="font-sans flex min-h-screen flex-col antialiased overflow-x-hidden bg-white text-zinc-900">
        <Providers>
          <AppHeader />
          <main className="flex-1 bg-white">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
