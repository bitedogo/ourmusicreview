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
  title: "ORU",
  description: "Music Review & Community",
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
