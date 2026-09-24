import type { MetadataRoute } from "next";
import { getEssays } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
 const base = "https://www.ahmethaktaneker.com";
 return [...["", "/yazilar", "/hakkimda", "/iletisim"].map(path => ({ url: base + path })), ...getEssays().map(essay => ({ url: `${base}/yazilar/${essay.slug}`, lastModified: essay.date }))];
}
