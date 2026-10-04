import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://maison-glazy.vercel.app/",
      lastModified: new Date("2026-10-04"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
