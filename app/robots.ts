import type { MetadataRoute } from "next";

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
    sitemap: "https://www.comeonoru.com/sitemap.xml",
    host: "https://www.comeonoru.com",
  };
}
