"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Drug,
  DrugCatalog,
  getCategories,
  getDrugsInCategory,
  searchDrugs,
  slugify,
  CATEGORY_ICONS,
} from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";

const catalog = drugsData as DrugCatalog;

export default function FarmacosPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(catalog.drugs), []);

  const results = useMemo(() => {
    if (query.trim()) return searchDrugs(catalog.drugs, query);
    if (selectedCategory === "__all__")
      return [...catalog.drugs].sort((a, b) => a.name.localeCompare(b.name));
    if (selectedCategory)
      return getDrugsInCategory(catalog.drugs, selectedCategory);
    return [];
  }, [query, selectedCategory]);

  const showCategories = !query.trim() && !selectedCategory;

  return (
    <div className="container-dec py-8">
      {/* Header */}
      <div className="mb-6">
        <div
          className="text-xs mb-2"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
        >
          <span style={{ color: "var(--accent)" }}>$</span> cat /farmacos
          <span className="cursor-blink" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Catálogo de Fármacos
        </h1>
        <p
          className="text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
        >
          {catalog.drugs.length} fármacos · {categories.length} categorías ·
          v{catalog.version} · {catalog.lastUpdated}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
        >
          ⌕
        </span>
        <input
          type="text"
          className="search-input"
          placeholder="buscar fármaco, categoría o descripción..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value) setSelectedCategory(null);
          }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "SF Mono, monospace",
            }}
          >
            [×]
          </button>
        )}
      </div>

      {/* Breadcrumb when category selected */}
      {selectedCategory && (
        <div
          className="flex items-center gap-2 mb-4 text-xs animate-fade-in"
          style={{ fontFamily: "SF Mono, monospace" }}
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className="btn-ghost"
            style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}
          >
            ← back
          </button>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>
            {selectedCategory === "__all__"
              ? `todos (${catalog.drugs.length})`
              : `${CATEGORY_ICONS[selectedCategory] || ""} ${selectedCategory} (${results.length})`}
          </span>
        </div>
      )}

      {/* Search results count */}
      {query.trim() && (
        <p
          className="text-xs mb-4"
          style={{ color: "var(--text-muted)", fontFamily: "SF Mono, monospace" }}
        >
          {results.length === 0
            ? "// sin resultados — intenta otro término"
            : `// ${results.length} resultado${results.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Categories grid */}
      {showCategories && (
        <div className="animate-fade-in">
          <div
            className="text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            Categorías
          </div>
          <div className="category-grid mb-6">
            {categories.map((cat) => {
              const count = getDrugsInCategory(catalog.drugs, cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="text-left p-3 transition-all"
                  style={{
                    background: "var(--bg-card)",
                    cursor: "pointer",
                    border: "none",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">
                      {CATEGORY_ICONS[cat] || "📦"}
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: "var(--text-muted)",
                        fontFamily: "SF Mono, monospace",
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    className="text-xs font-medium leading-tight"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {cat}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setSelectedCategory("__all__")}
            className="w-full text-center p-3 transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "2px",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontFamily: "SF Mono, monospace",
              fontSize: "0.75rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-border)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            [ ver todos — {catalog.drugs.length} fármacos ]
          </button>
        </div>
      )}

      {/* Drug list */}
      {results.length > 0 && (
        <div className="drug-grid animate-fade-in">
          {results.map((drug, i) => (
            <DrugCard key={drug.name + i} drug={drug} />
          ))}
        </div>
      )}

      {/* Empty search */}
      {query.trim() && results.length === 0 && (
        <div
          className="text-center py-16 animate-fade-in"
          style={{ fontFamily: "SF Mono, monospace" }}
        >
          <div className="text-3xl mb-3" style={{ opacity: 0.3 }}>
            💀
          </div>
          <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
            Sin resultados
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Ese fármaco no está en nuestra base de datos.
            <br />
            Si existe, probablemente tampoco está en tu hospital.
          </p>
        </div>
      )}
    </div>
  );
}

function DrugCard({ drug }: { drug: Drug }) {
  return (
    <Link
      href={`/farmacos/${slugify(drug.name)}`}
      className="block p-4 transition-all no-underline"
      style={{ background: "var(--bg-card)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-card-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-card)";
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3
          className="text-sm font-semibold leading-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {drug.name}
        </h3>
      </div>

      <span className="badge badge-category">{drug.category}</span>

      <p
        className="text-xs mt-2 leading-relaxed"
        style={{
          color: "var(--text-muted)",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {drug.description}
      </p>

      <div className="flex items-center gap-2 mt-2.5">
        <span className="badge badge-unit">{drug.ampulePresentation}</span>
        <span className="badge badge-unit">{drug.typicalDoseUnit}</span>
      </div>
    </Link>
  );
}
