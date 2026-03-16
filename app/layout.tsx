import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "./components/app-header";
import { Footer } from "./components/Footer";

const pretendard = localFont({
  src: [
    {
      path: "../node_modules/@fontsource/pretendard/files/pretendard-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/pretendard/files/pretendard-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/pretendard/files/pretendard-latin-800-normal.woff2",
      weight: "800",
      style: "normal",
    },
    {
      path: "../node_modules/@fontsource/pretendard/files/pretendard-latin-900-normal.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-pretendard",
  display: "swap",
});

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
        url: "/oru-num6-hq.png",
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
    images: ["/oru-num6-hq.png"],
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
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
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
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} font-sans flex min-h-screen flex-col antialiased overflow-x-hidden bg-white text-zinc-900`}
      >
        <Providers>
          <AppHeader />
          <main className="flex-1 bg-white pt-20 sm:pt-24">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
