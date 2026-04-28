import type { MetadataRoute } from "next";
import { loadCatalogSync, slugify } from "@/lib/drugs";

const BASE = "https://decanestesia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalog = loadCatalogSync();
  const today = new Date().toISOString().split("T")[0];

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: today, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/farmacos`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/calculadora`, lastModified: today, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/blog`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/app-ios`, lastModified: today, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/legal/privacidad`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/terminos`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/legal/disclaimer`, lastModified: today, changeFrequency: "yearly", priority: 0.3 },
  ];

  const drugPages: MetadataRoute.Sitemap = catalog.drugs.map((d) => ({
    url: `${BASE}/farmacos/${slugify(d.name)}`,
    lastModified: catalog.last_updated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...drugPages];
}
