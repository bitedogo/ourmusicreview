import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/src/lib/site/branding";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/developer",
          "/developer/",
          "/designer",
          "/designer/",
          "/guide-access",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
