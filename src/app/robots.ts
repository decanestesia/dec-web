import type { MetadataRoute } from "next";

// robots.txt — permite todo lo público, bloquea rutas privadas/administrativas
// y de edición. El sitemap solo lista rutas públicas (ver src/app/sitemap.ts).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/perfil",
        "/auth/",
        "/blog/nuevo",
        "/blog/editar",
      ],
    },
    sitemap: "https://decanestesia.com/sitemap.xml",
  };
}
