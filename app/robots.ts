import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://maison-glazy.vercel.app/sitemap.xml",
    host: "https://maison-glazy.vercel.app",
  };
}
