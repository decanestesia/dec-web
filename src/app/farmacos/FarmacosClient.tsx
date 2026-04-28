"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type DrugCatalog,
  type Drug,
  searchDrugs,
  slugify,
} from "@/lib/drugs";

interface Props {
  catalog: DrugCatalog;
}

export function FarmacosClient({ catalog }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const results = useMemo(() => {
    if (query.trim()) return searchDrugs(catalog.drugs, query);
    if (activeCat) return catalog.drugs.filter((d) => d.category === activeCat);
    return null; // mostrar categorías
  }, [query, activeCat, catalog.drugs]);

  return (
    <>
      {/* Search bar */}
      <div className="mb-6 sticky top-16 z-10 bg-background/95 backdrop-blur py-2">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setActiveCat(null);
            }}
            placeholder="Buscar por nombre, mecanismo o categoría…"
            className="w-full px-4 py-3 pl-11 rounded-lg border border-foreground/20 bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Buscar fármaco"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-foreground/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 text-foreground/50 hover:text-foreground"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Active category badge */}
      {activeCat && !query && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-foreground/70">Categoría:</span>
          <button
            type="button"
            onClick={() => setActiveCat(null)}
            className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-sm hover:bg-emerald-500/25"
          >
            {activeCat} ✕
          </button>
        </div>
      )}

      {/* Results: search, filtered by category, or category grid */}
      {results !== null ? (
        <DrugList drugs={results} query={query} />
      ) : (
        <CategoryGrid catalog={catalog} onSelect={setActiveCat} />
      )}
    </>
  );
}

function CategoryGrid({
  catalog,
  onSelect,
}: {
  catalog: DrugCatalog;
  onSelect: (cat: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {catalog.categories.map((cat) => (
        <button
          key={cat.name}
          type="button"
          onClick={() => onSelect(cat.name)}
          className="p-4 rounded-lg border border-foreground/15 hover:border-emerald-500 hover:bg-emerald-500/5 transition text-left group"
        >
          <div className="text-3xl mb-2">{cat.icon}</div>
          <div className="font-medium leading-tight group-hover:text-emerald-600">
            {cat.name}
          </div>
          <div className="text-sm text-foreground/60 mt-1">
            {cat.drug_count} fármaco{cat.drug_count === 1 ? "" : "s"}
          </div>
        </button>
      ))}
    </div>
  );
}

function DrugList({ drugs, query }: { drugs: Drug[]; query: string }) {
  if (drugs.length === 0) {
    return (
      <div className="text-center py-12 text-foreground/60">
        <div className="text-4xl mb-2">🔍</div>
        <p>
          Sin resultados para <strong>{query}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-foreground/60 mb-3">
        {drugs.length} resultado{drugs.length === 1 ? "" : "s"}
      </p>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {drugs.map((d) => (
          <li key={d.id}>
            <Link
              href={`/farmacos/${slugify(d.name)}`}
              className="block p-3 rounded-lg border border-foreground/10 hover:border-emerald-500 hover:bg-emerald-500/5 transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate flex items-center gap-2">
                    <span>{d.name}</span>
                    {d.infusion && d.infusion.length > 0 && (
                      <span
                        title="Tiene calculadora de infusión"
                        className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      >
                        Calc
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/60 truncate">
                    {d.category_icon} {d.category}
                  </div>
                </div>
              </div>
              {d.description && (
                <p className="text-sm text-foreground/70 mt-1 line-clamp-2">
                  {d.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
