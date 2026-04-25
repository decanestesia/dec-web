"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { DrugCatalog, slugify, CATEGORY_ICONS } from "@/lib/drugs";
import { fetchAllDrugs, fetchCategories, fetchCategoryMap, DbCategory } from "@/lib/supabase";
import drugsData from "../../../public/drugs.json";

const localCatalog = drugsData as DrugCatalog;

interface CatalogDrug {
  name: string;
  description: string;
  category: string;
  hasInfusion: boolean;
}

export default function FarmacosPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [allDrugs, setAllDrugs] = useState<CatalogDrug[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFromSupabase() {
      try {
        const [dbDrugs, categories, catMap] = await Promise.all([
          fetchAllDrugs(),
          fetchCategories(),
          fetchCategoryMap(),
        ]);
        if (dbDrugs.length === 0) throw new Error("Empty");

        const catLookup: Record<string, DbCategory> = {};
        categories.forEach((c) => { catLookup[c.id] = c; });

        const drugCatLookup: Record<string, string> = {};
        catMap.forEach((m) => {
          if (m.is_primary && catLookup[m.category_id]) {
            drugCatLookup[m.drug_id] = catLookup[m.category_id].name;
          }
        });

        const localNames = new Set(localCatalog.drugs.map((d) => d.name));

        setAllDrugs(
          dbDrugs.map((d) => ({
            name: d.name,
            description: d.description || d.mechanism_of_action || "",
            category: drugCatLookup[d.id] || "Otros",
            hasInfusion: localNames.has(d.name),
          }))
        );
      } catch {
        setAllDrugs(
          localCatalog.drugs.map((d) => ({
            name: d.name,
            description: d.description,
            category: d.category,
            hasInfusion: true,
          }))
        );
      }
      setLoading(false);
    }
    loadFromSupabase();
  }, []);

  const categories = useMemo(() => {
    const cats = new Map<string, number>();
    allDrugs.forEach((d) => cats.set(d.category, (cats.get(d.category) || 0) + 1));
    return Array.from(cats.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [allDrugs]);

  const results = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return allDrugs.filter(
        (d) => d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      );
    }
    if (selectedCategory === "__all__") return [...allDrugs].sort((a, b) => a.name.localeCompare(b.name));
    if (selectedCategory) return allDrugs.filter((d) => d.category === selectedCategory).sort((a, b) => a.name.localeCompare(b.name));
    return [];
  }, [query, selectedCategory, allDrugs]);

  const showCats = !query.trim() && !selectedCategory;

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem" }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}><b>$</b> cat /db/farmacos</div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Catálogo de Fármacos</h1>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.25rem" }}>
          {loading ? "cargando..." : `${allDrugs.length} fármacos · ${categories.length} categorías`}
        </p>
      </div>

      <div className="search-box" style={{ marginBottom: "1.25rem" }}>
        <span className="search-icon mono">⌕</span>
        <input type="text" placeholder="buscar fármaco, categoría o descripción..." value={query}
          onChange={(e) => { setQuery(e.target.value); if (e.target.value) setSelectedCategory(null); }} />
        {query && (
          <button onClick={() => setQuery("")} className="mono"
            style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "0.7rem" }}>
            [×]
          </button>
        )}
      </div>

      {selectedCategory && (
        <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <button onClick={() => setSelectedCategory(null)} className="btn btn-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.6rem" }}>← back</button>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem" }}>/</span>
          <span className="mono" style={{ color: "var(--text-1)", fontSize: "0.65rem" }}>
            {selectedCategory === "__all__" ? `todos (${allDrugs.length})` : `${CATEGORY_ICONS[selectedCategory] || ""} ${selectedCategory} (${results.length})`}
          </span>
        </div>
      )}

      {query.trim() && (
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginBottom: "0.75rem" }}>
          {results.length === 0 ? "// sin resultados" : `// ${results.length} resultado${results.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {showCats && !loading && (
        <div className="fade-up">
          <div className="prompt mono" style={{ marginBottom: "0.5rem" }}><b>$</b> ls categorías/</div>
          <div className="cat-grid" style={{ marginBottom: "1rem" }}>
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => setSelectedCategory(cat.name)} className="card-interactive"
                style={{ padding: "0.65rem", background: "var(--bg-2)", border: "none", textAlign: "left", cursor: "pointer", color: "var(--text-0)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "1rem" }}>{CATEGORY_ICONS[cat.name] || "📦"}</span>
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>{cat.count}</span>
                </div>
                <div style={{ color: "var(--text-1)", fontSize: "0.7rem", fontWeight: 500, lineHeight: 1.3 }}>{cat.name}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setSelectedCategory("__all__")} className="card-interactive mono"
            style={{ width: "100%", padding: "0.6rem", background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.7rem", cursor: "pointer", textAlign: "center" }}>
            [ ver todos — {allDrugs.length} fármacos ]
          </button>
        </div>
      )}

      {loading && (
        <div className="mono" style={{ textAlign: "center", color: "var(--text-3)", fontSize: "0.65rem", padding: "3rem 0" }}>
          cargando catálogo...
        </div>
      )}

      {results.length > 0 && (
        <div className="drug-grid fade-up">
          {results.map((drug, i) => (
            <Link key={drug.name + i} href={`/farmacos/${slugify(drug.name)}`} className="card-interactive"
              style={{ display: "block", padding: "0.75rem", textDecoration: "none", color: "inherit" }}>
              <div style={{ marginBottom: "0.35rem" }}>
                <h3 style={{ color: "var(--text-0)", fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.3 }}>{drug.name}</h3>
              </div>
              <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                <span className="tag tag-accent">{drug.category}</span>
                {drug.hasInfusion && <span className="tag tag-muted mono">infusión</span>}
              </div>
              <p style={{ color: "var(--text-3)", fontSize: "0.7rem", marginTop: "0.4rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                {drug.description}
              </p>
            </Link>
          ))}
        </div>
      )}

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
