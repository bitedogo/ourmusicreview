import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppHeader } from "./components/app-header";
import { Footer } from "./components/Footer";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistMono.variable} font-sans flex min-h-screen flex-col antialiased overflow-x-hidden bg-white text-zinc-900`}
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
