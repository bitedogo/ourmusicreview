import type { NextConfig } from "next";

function getSupabaseStorageHostname(): string {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      return new URL(supabaseUrl).hostname;
    } catch {
      // fall through to legacy default
    }
  }
  return "zdggogbgkvgjkjngvxwn.supabase.co";
}

function getR2PublicHostname(): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  try {
    return new URL(base).hostname;
  } catch {
    return null;
  }
}

const r2Hostname = getR2PublicHostname();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/developer": ["./developer/**/*.md"],
    "/developer/[slug]": ["./developer/**/*.md"],
    "/designer": ["./designer/**/*.md"],
    "/designer/[slug]": ["./designer/**/*.md"],
  },
  images: {
    // Vercel Image Optimization 캐시 — 원본 Storage Egress 감소
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: getSupabaseStorageHostname(),
        port: "",
        pathname: "/storage/v1/object/public/profiles/**",
      },
      ...(r2Hostname
        ? [
            {
              protocol: "https" as const,
              hostname: r2Hostname,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.mzstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
