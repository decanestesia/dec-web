import type { Metadata } from "next";
import Link from "next/link";
import { loadCatalogSync, slugify } from "@/lib/drugs";
import { FarmacosClient } from "./FarmacosClient";

export const metadata: Metadata = {
  title: "Catálogo de Fármacos",
  description:
    "Catálogo completo de fármacos anestésicos, vasoactivos y de cuidados críticos. Dosis, diluciones, farmacología, efectos adversos, advertencias y embarazo.",
};

export default function FarmacosPage() {
  const catalog = loadCatalogSync();

  // Pre-render the static structure server-side for SEO + performance
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Catálogo de fármacos</h1>
        <p className="text-foreground/70">
          {catalog.drug_count} fármacos en {catalog.category_count} categorías
          terapéuticas. Última actualización: {catalog.last_updated}.
        </p>
      </header>

      <FarmacosClient catalog={catalog} />

      {/* SEO: lista server-rendered de todos los fármacos por categoría */}
      <noscript>
        <div className="space-y-8 mt-8">
          {catalog.categories.map((cat) => {
            const drugs = catalog.drugs
              .filter((d) => d.category === cat.name)
              .sort((a, b) => a.name.localeCompare(b.name, "es"));
            return (
              <section key={cat.name}>
                <h2 className="text-2xl font-semibold mb-3">
                  {cat.icon} {cat.name}
                </h2>
                <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {drugs.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={`/farmacos/${slugify(d.name)}`}
                        className="text-emerald-600 hover:underline"
                      >
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </noscript>
    </div>
  );
}
