import { DrugCatalog, slugify } from "@/lib/drugs";
import drugsData from "../../public/drugs.json";
import type { MetadataRoute } from "next";

const catalog = drugsData as DrugCatalog;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://decanestesia.com";

  const drugPages = catalog.drugs.map((d) => ({
    url: `${base}/farmacos/${slugify(d.name)}`,
    lastModified: new Date(catalog.lastUpdated),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/farmacos`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/calculadora`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/app-ios`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    ...drugPages,
  ];
}
