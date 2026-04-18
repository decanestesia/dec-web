"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DrugCatalog, Drug, getCategories, getDrugsInCategory, searchDrugs, slugify, CATEGORY_ICONS } from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";

const catalog = drugsData as DrugCatalog;

export default function FarmacosPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => getCategories(catalog.drugs), []);
  const results = useMemo(() => {
    if (query.trim()) return searchDrugs(catalog.drugs, query);
    if (selectedCategory === "__all__") return [...catalog.drugs].sort((a, b) => a.name.localeCompare(b.name));
    if (selectedCategory) return getDrugsInCategory(catalog.drugs, selectedCategory);
    return [];
  }, [query, selectedCategory]);

  const showCats = !query.trim() && !selectedCategory;

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}><b>$</b> cat /db/farmacos</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Catálogo de Fármacos</h1>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.25rem" }}>
          {catalog.drugs.length} fármacos · {categories.length} categorías · v{catalog.version} · {catalog.lastUpdated}
        </p>
      </div>

      {/* Search */}
      <div className="search-box" style={{ marginBottom: "1.25rem" }}>
        <span className="search-icon mono">⌕</span>
        <input
          type="text"
          placeholder="buscar fármaco, categoría o descripción..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value) setSelectedCategory(null); }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="mono"
            style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.7rem" }}
          >[×]</button>
        )}
      </div>

      {/* Breadcrumb */}
      {selectedCategory && (
        <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <button onClick={() => setSelectedCategory(null)} className="btn btn-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.6rem" }}>← back</button>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem" }}>/</span>
          <span className="mono" style={{ color: "var(--text-1)", fontSize: "0.65rem" }}>
            {selectedCategory === "__all__" ? `todos (${catalog.drugs.length})` : `${CATEGORY_ICONS[selectedCategory] || ""} ${selectedCategory} (${results.length})`}
          </span>
        </div>
      )}

      {query.trim() && (
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginBottom: "0.75rem" }}>
          {results.length === 0 ? "// sin resultados" : `// ${results.length} resultado${results.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Categories */}
      {showCats && (
        <div className="fade-up">
          <div className="prompt mono" style={{ marginBottom: "0.5rem" }}><b>$</b> ls categorías/</div>
          <div className="cat-grid" style={{ marginBottom: "1rem" }}>
            {categories.map((cat) => {
              const count = getDrugsInCategory(catalog.drugs, cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="card-interactive"
                  style={{ padding: "0.65rem", background: "var(--bg-2)", border: "none", textAlign: "left", cursor: "pointer", color: "var(--text-0)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <span style={{ fontSize: "1rem" }}>{CATEGORY_ICONS[cat] || "📦"}</span>
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{count}</span>
                  </div>
                  <div style={{ color: "var(--text-1)", fontSize: "0.7rem", fontWeight: 500, lineHeight: 1.3 }}>{cat}</div>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setSelectedCategory("__all__")}
            className="card-interactive mono"
            style={{ width: "100%", padding: "0.6rem", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.7rem", cursor: "pointer", textAlign: "center" }}
          >
            [ ver todos — {catalog.drugs.length} fármacos ]
          </button>
        </div>
      )}

      {/* Drug list */}
      {results.length > 0 && (
        <div className="drug-grid fade-up">
          {results.map((drug, i) => (
            <DrugCard key={drug.name + i} drug={drug} />
          ))}
        </div>
      )}

      {/* Empty */}
      {query.trim() && results.length === 0 && (
        <div className="fade-up" style={{ textAlign: "center", padding: "4rem 0" }}>
          <div style={{ fontSize: "2.5rem", opacity: 0.2, marginBottom: "0.75rem" }}>💀</div>
          <p style={{ color: "var(--text-1)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>Sin resultados</p>
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem" }}>
            Ese fármaco no está en nuestra base de datos.<br />Si existe, probablemente tampoco está en tu hospital.
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
      className="card-interactive"
      style={{ display: "block", padding: "0.75rem", textDecoration: "none", color: "inherit" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.35rem" }}>
        <h3 style={{ color: "var(--text-0)", fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.3 }}>{drug.name}</h3>
      </div>
      <span className="tag tag-accent">{drug.category}</span>
      <p style={{ color: "var(--text-3)", fontSize: "0.7rem", marginTop: "0.4rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
        {drug.description}
      </p>
      <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
        <span className="tag tag-muted mono">{drug.ampulePresentation}</span>
        <span className="tag tag-muted mono">{drug.typicalDoseUnit}</span>
      </div>
    </Link>
  );
}
