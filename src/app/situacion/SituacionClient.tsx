"use client";

// ============================================================
// BÚSQUEDA POR SITUACIÓN — Client Component
//
// Buscador "¿qué hago si…?": input con filtro en vivo (substring
// normalizado sobre título + sinónimos + categoría) sobre SITUATIONS.
// Cada resultado es una tarjeta grande y legible (estética terminal
// DEC) con: pasos inmediatos, fármaco(s) + dosis (enlazan a la ficha
// /farmacos/[slug]) y enlace a la guía/algoritmo/protocolo ampliado.
//
// Sin dependencias externas de búsqueda: el matcher está en
// src/lib/situaciones.ts. Los datos clínicos (pasos/dosis) resumen
// contenido ya existente del repo — ninguna dosis inventada.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  SITUATIONS,
  searchSituations,
  CATEGORY_LABEL,
  CATEGORY_ACCENT,
  type Situation,
  type SituationCategory,
} from "@/lib/situaciones";

// Categorías presentes (para los chips de filtro rápido).
const CATEGORIES = Array.from(
  new Set(SITUATIONS.map((s) => s.categoria))
) as SituationCategory[];

// Sugerencias de arranque cuando el input está vacío.
const SUGGESTIONS = [
  "hipotensión",
  "laringoespasmo",
  "bradicardia",
  "desaturación",
  "broncoespasmo",
  "anafilaxia",
  "hemorragia",
  "LAST",
  "hipertermia maligna",
  "NVPO",
];

export default function SituacionClient() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SituationCategory | null>(null);

  const results = useMemo(() => {
    const base = searchSituations(query);
    return category ? base.filter((s) => s.categoria === category) : base;
  }, [query, category]);

  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 860, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> qué hago si…
      </div>

      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Búsqueda por situación
        </h1>
        <p style={{ color: "var(--text-2)", fontSize: "0.85rem", lineHeight: 1.6 }}>
          Escribe la situación crítica del quirófano y obtén los pasos inmediatos, el fármaco de
          primera línea con su dosis y el enlace a la guía completa y a la ficha del fármaco.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.35rem", opacity: 0.6 }}>
          {"// el resumen es para orientar rápido; la guía se lee entera antes de necesitarla"}
        </p>
      </header>

      {/* Buscador */}
      <div style={{ position: "sticky", top: 44, zIndex: 10, background: "var(--bg-0)", paddingTop: "0.5rem", paddingBottom: "0.75rem" }}>
        <div style={{ position: "relative" }}>
          <span
            className="mono"
            style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--accent)", fontSize: "0.9rem", pointerEvents: "none" }}
          >
            ▸
          </span>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="hipotensión, laringoespasmo, anafilaxia, LAST…"
            aria-label="Buscar situación crítica"
            className="mono"
            style={{
              width: "100%",
              background: "var(--bg-2)",
              border: "1px solid var(--border-hi)",
              color: "var(--text-0)",
              padding: "0.85rem 2.5rem 0.85rem 2.2rem",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpiar búsqueda"
              className="mono"
              style={{ position: "absolute", right: "0.6rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-2)", fontSize: "0.85rem", padding: "0.3rem 0.4rem" }}
            >
              [×]
            </button>
          )}
        </div>

        {/* Chips de categoría */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
          <FilterChip label="todas" active={category === null} onClick={() => setCategory(null)} accent="var(--accent)" />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              label={CATEGORY_LABEL[c]}
              active={category === c}
              onClick={() => setCategory((cur) => (cur === c ? null : c))}
              accent={CATEGORY_ACCENT[c]}
            />
          ))}
        </div>
      </div>

      {/* Sugerencias (solo con input vacío y sin filtro) */}
      {!query && !category && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", margin: "0.25rem 0 1.25rem" }}>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            prueba:
          </span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="mono"
              style={{ background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-2)", fontSize: "0.68rem", padding: "0.25rem 0.55rem", cursor: "pointer" }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Contador */}
      <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", margin: "0.5rem 0 1rem" }}>
        {results.length} situación{results.length === 1 ? "" : "es"}
        {query ? ` para "${query}"` : ""}
        {category ? ` · ${CATEGORY_LABEL[category]}` : ""}
      </div>

      {/* Resultados */}
      {results.length === 0 ? (
        <div className="panel" style={{ borderLeft: "3px solid var(--amber)" }}>
          <div className="panel-body" style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.6 }}>
            Sin coincidencias para <b>&ldquo;{query}&rdquo;</b>. Prueba un término más general
            (ej. &ldquo;presión baja&rdquo;, &ldquo;convulsión&rdquo;, &ldquo;sangrado&rdquo;) o revisa las{" "}
            <Link href="/guias" style={{ color: "var(--accent)" }}>guías</Link> y{" "}
            <Link href="/algoritmos" style={{ color: "var(--accent)" }}>algoritmos</Link> completos.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {results.map((s) => (
            <SituationCard key={s.id} sit={s} />
          ))}
        </div>
      )}

      {/* Disclaimer sobrio */}
      <footer style={{ marginTop: "2.5rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", lineHeight: 1.8, opacity: 0.85 }}>
          Resumen de acción rápida con dosis de literatura aceptada, tomadas de las guías, algoritmos
          y protocolos de DEC (no inventadas). No sustituye la guía completa, la monitorización, el
          juicio clínico ni el protocolo institucional. Verifica dosis, dilución y vía antes de
          administrar — la responsabilidad de cada dosis es del clínico que la administra.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <Link href="/codigo" className="btn btn-outline btn-sm">modo código azul →</Link>
          <Link href="/guias" className="btn btn-outline btn-sm">todas las guías →</Link>
          <Link href="/algoritmos" className="btn btn-outline btn-sm">algoritmos →</Link>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------
// Chip de filtro por categoría
// ------------------------------------------------------------
function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      className="mono"
      style={{
        cursor: "pointer",
        fontSize: "0.66rem",
        padding: "0.28rem 0.6rem",
        textTransform: "lowercase",
        letterSpacing: "0.03em",
        background: active ? accent : "var(--bg-2)",
        color: active ? "#000" : "var(--text-2)",
        border: `1px solid ${active ? accent : "var(--border)"}`,
        fontWeight: active ? 700 : 500,
      }}
    >
      {label}
    </button>
  );
}

// ------------------------------------------------------------
// Tarjeta de situación (grande, legible)
// ------------------------------------------------------------
function SituationCard({ sit }: { sit: Situation }) {
  const accent = CATEGORY_ACCENT[sit.categoria];

  return (
    <article
      className="panel"
      style={{ background: "var(--bg-2)", borderTop: `2px solid ${accent}`, overflow: "hidden" }}
    >
      {/* Cabecera */}
      <div className="panel-body" style={{ display: "grid", gap: "0.9rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap" }}>
            <h2 style={{ color: "var(--text-0)", fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
              {sit.titulo}
            </h2>
            <span
              className="mono"
              style={{ color: accent, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em", flexShrink: 0, fontWeight: 700 }}
            >
              {CATEGORY_LABEL[sit.categoria]}
            </span>
          </div>
          <p style={{ color: "var(--text-2)", fontSize: "0.82rem", lineHeight: 1.55, marginTop: "0.35rem" }}>
            {sit.resumen}
          </p>
        </div>

        {/* Pasos inmediatos */}
        <div>
          <div className="mono" style={{ color: "var(--accent)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "0.55rem" }}>
            ▸ pasos inmediatos
          </div>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {sit.pasos.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span
                  className="mono"
                  style={{
                    flexShrink: 0,
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: accent,
                    color: "#000",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ color: "var(--text-1)", fontSize: "0.83rem", lineHeight: 1.55, paddingTop: "0.1rem" }}>
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fármacos + dosis */}
        {sit.farmacos.length > 0 && (
          <div>
            <div className="mono" style={{ color: "var(--cyan)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 700, marginBottom: "0.55rem" }}>
              ▸ fármacos · dosis
            </div>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              {sit.farmacos.map((f, i) => {
                const inner = (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: "0.6rem",
                      flexWrap: "wrap",
                      background: "var(--bg-1)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${accent}`,
                      padding: "0.5rem 0.7rem",
                    }}
                  >
                    <span style={{ color: "var(--text-0)", fontSize: "0.83rem", fontWeight: 700 }}>
                      {f.nombre}
                      {f.slug && (
                        <span className="mono" style={{ color: "var(--accent)", fontSize: "0.6rem", marginLeft: "0.4rem" }}>
                          ficha →
                        </span>
                      )}
                    </span>
                    <span className="mono" style={{ color: "var(--accent)", fontSize: "0.8rem", fontWeight: 700 }}>
                      {f.dosis}
                    </span>
                  </div>
                );
                return f.slug ? (
                  <Link key={i} href={`/farmacos/${f.slug}`} style={{ textDecorationLine: "none" }} className="card-interactive">
                    {inner}
                  </Link>
                ) : (
                  <div key={i}>{inner}</div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pie: fuente + enlace a la guía */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap", paddingTop: "0.35rem", borderTop: "1px solid var(--border)" }}>
          <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.58rem", lineHeight: 1.5, flex: "1 1 220px" }}>
            {sit.fuente}
          </span>
          {sit.guiaHref && (
            <Link
              href={sit.guiaHref}
              className="mono"
              style={{ color: accent, fontSize: "0.68rem", fontWeight: 700, textDecorationLine: "none", whiteSpace: "nowrap" }}
            >
abrir {sit.guiaLabel ?? "guía"} →
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
