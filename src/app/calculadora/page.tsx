"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type Drug,
  type DrugCatalog,
  searchDrugs,
  slugify,
} from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";
import { InfusionCalculator } from "@/app/farmacos/[slug]/InfusionCalculator";

const catalog = drugsData as DrugCatalog;
const drugsWithCalc = catalog.drugs.filter(
  (d) => d.infusion && d.infusion.length > 0
);

export default function CalculadoraPage() {
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState<Drug | null>(null);

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return drugsWithCalc.slice(0, 30);
    return searchDrugs(drugsWithCalc, searchQ).slice(0, 30);
  }, [searchQ]);

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./infusion-calc.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Calculadora de Infusión
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
          }}
        >
          {drugsWithCalc.length} fármacos con cálculo bidireccional · v
          {catalog.version}
        </p>
      </div>

      {!selected ? (
        <>
          {/* Search */}
          <div className="search-box" style={{ marginBottom: "1.25rem" }}>
            <span className="search-icon mono">⌕</span>
            <input
              type="text"
              placeholder="seleccionar fármaco..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              autoFocus
            />
            {searchQ && (
              <button
                onClick={() => setSearchQ("")}
                className="mono"
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-3)",
                  fontSize: "0.7rem",
                }}
              >
                [×]
              </button>
            )}
          </div>

          {searchQ.trim() && (
            <p
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.65rem",
                marginBottom: "0.75rem",
              }}
            >
              {filtered.length === 0
                ? "// sin resultados"
                : `// ${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
            </p>
          )}

          {/* Drug list */}
          {filtered.length > 0 ? (
            <div className="drug-grid fade-up">
              {filtered.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelected(d)}
                  className="card-interactive"
                  style={{
                    padding: "0.75rem",
                    background: "var(--bg-2)",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <h3
                      style={{
                        color: "var(--text-0)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        lineHeight: 1.3,
                      }}
                    >
                      {d.name}
                    </h3>
                    <span className="tag tag-accent mono">CALC</span>
                  </div>
                  <span className="tag tag-accent">{d.category}</span>
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.6rem",
                      marginTop: "0.5rem",
                    }}
                  >
                    {d.infusion!.length} indicación
                    {d.infusion!.length === 1 ? "" : "es"}
                    {d.infusion![0]?.ampule_presentation &&
                      ` · ${d.infusion![0].ampule_presentation}`}
                  </div>
                </button>
              ))}
            </div>
          ) : searchQ.trim() ? (
            <div
              className="fade-up"
              style={{ textAlign: "center", padding: "3rem 0" }}
            >
              <div
                style={{
                  fontSize: "2.5rem",
                  opacity: 0.2,
                  marginBottom: "0.75rem",
                }}
              >
                💀
              </div>
              <p
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.65rem",
                  lineHeight: 1.7,
                }}
              >
                Sin calculadora para ese fármaco.
                <br />
                <Link
                  href="/farmacos"
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  → buscar en el catálogo completo
                </Link>
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="fade-up">
          {/* Selected drug header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.75rem",
              marginBottom: "1.25rem",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
              <span style={{ fontSize: "1.5rem" }}>{selected.category_icon}</span>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.2 }}>
                  {selected.name}
                </h2>
                <span
                  className="tag tag-accent"
                  style={{ marginTop: "0.35rem" }}
                >
                  {selected.category}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <button
                onClick={() => setSelected(null)}
                className="btn btn-outline btn-sm"
              >
                ← cambiar
              </button>
              <Link
                href={`/farmacos/${slugify(selected.name)}`}
                className="btn btn-fill btn-sm"
                style={{ textDecoration: "none" }}
              >
                ficha completa →
              </Link>
            </div>
          </div>

          {/* Calculator */}
          {selected.infusion && (
            <InfusionCalculator
              drugName={selected.name}
              entries={selected.infusion}
            />
          )}
        </div>
      )}
    </div>
  );
}
