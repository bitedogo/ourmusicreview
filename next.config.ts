import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: [
      "zdggogbgkvgjkjngvxwn.supabase.co",
      "lh3.googleusercontent.com",
      "is1-ssl.mzstatic.com",
    ],
  },
};

export default nextConfig;
