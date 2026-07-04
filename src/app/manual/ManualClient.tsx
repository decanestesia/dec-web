"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CATEGORIES,
  SECTIONS,
  PLATFORM_LABEL,
  type Platform,
  type Section,
} from "@/lib/registry";

const PLATFORM_ORDER: Platform[] = ["web", "ios", "ipados", "watch"];

export function ManualClient() {
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();

  // Filtro en vivo: título, navLabel, short, manual, fuentes, categoría.
  const filtered = useMemo(() => {
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) => {
      const hay = [
        s.title,
        s.navLabel,
        s.short,
        s.manual,
        s.slug,
        s.category,
        ...(s.sources ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [q]);

  // Categorías con al menos una sección tras el filtro, en orden de CATEGORIES.
  const groups = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        cat,
        items: filtered.filter((s) => s.category === cat.key),
      })).filter((g) => g.items.length > 0),
    [filtered],
  );

  const total = SECTIONS.length;
  const shown = filtered.length;

  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: 900 }}>
      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> man dec
      </div>

      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.6rem" }}>
          Manual del sistema
        </h1>
        <p style={{ color: "var(--text-1)", fontSize: "0.95rem", lineHeight: 1.6, maxWidth: 640 }}>
          Índice vivo de DEC. Cada módulo del sistema —qué es, qué hace y cómo se usa— generado
          automáticamente del registro central de secciones. Si agregamos o cambiamos una
          herramienta, este manual se actualiza solo.
        </p>
        <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.5rem", opacity: 0.6 }}>
          {"// una sola fuente de verdad · navbar, portada y manual derivan de aquí"}
        </p>
      </header>

      {/* ── Buscador en vivo ───────────────────────────────────────── */}
      <div className="search-box" style={{ marginBottom: "0.6rem" }}>
        <span className="search-icon mono">▸</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="filtrar el manual… (ej: crisis, propofol, RCRI, eeg)"
          aria-label="Filtrar secciones del manual"
          autoComplete="off"
        />
      </div>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginBottom: "1.75rem" }}>
        {shown === total ? `${total} secciones` : `${shown} de ${total} secciones`}
      </p>

      {/* ── Sin resultados ─────────────────────────────────────────── */}
      {groups.length === 0 && (
        <div className="panel" style={{ padding: "1.5rem", textAlign: "center" }}>
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.8rem" }}>
            sin coincidencias para <span style={{ color: "var(--accent)" }}>&quot;{query}&quot;</span>
          </p>
        </div>
      )}

      {/* ── Grupos por categoría ───────────────────────────────────── */}
      {groups.map(({ cat, items }) => (
        <section key={cat.key} style={{ marginBottom: "2.5rem" }}>
          <div style={{ marginBottom: "0.9rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
            <h2 className="mono" style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)" }}>
              {cat.label}
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: "0.72rem", marginTop: "0.25rem" }}>{cat.desc}</p>
          </div>

          <div style={{ display: "grid", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
            {items.map((s) => (
              <ManualEntry key={s.slug} section={s} />
            ))}
          </div>
        </section>
      ))}

      {/* ── Pie ────────────────────────────────────────────────────── */}
      <div className="panel" style={{ marginTop: "1rem" }}>
        <div className="panel-header">
          <span className="dot" style={{ background: "var(--amber)", boxShadow: "0 0 6px var(--amber)" }} /> nota
        </div>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-2)", fontSize: "0.68rem", lineHeight: 1.7 }}>
            DEC es una herramienta de apoyo a la decisión clínica. Verifica siempre dosis, dilución y
            vía antes de tocar al paciente — la firma en la hoja de anestesia sigue siendo tuya.
          </p>
        </div>
      </div>
    </div>
  );
}

function ManualEntry({ section: s }: { section: Section }) {
  return (
    <div style={{ background: "var(--bg-2)" }}>
      <Link
        href={s.slug}
        className="card-interactive"
        style={{ display: "block", textDecoration: "none", color: "inherit", padding: "0.95rem 1rem" }}
      >
        {/* Título + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", flexWrap: "wrap", marginBottom: "0.4rem" }}>
          {s.icon && <span style={{ fontSize: "1.05rem" }}>{s.icon}</span>}
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: 700,
              color: s.urgent ? "var(--red)" : "var(--text-0)",
            }}
          >
            {s.title}
          </span>
          <code className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem" }}>{s.slug}</code>
          {s.isNew && (
            <span className="tag tag-accent mono" style={{ fontSize: "0.5rem" }}>nuevo</span>
          )}
          {s.urgent && (
            <span
              className="tag mono"
              style={{ fontSize: "0.5rem", color: "var(--red)", borderColor: "var(--red)", background: "transparent" }}
            >
              crisis
            </span>
          )}
        </div>

        {/* Descripción del manual */}
        <p style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65, marginBottom: "0.55rem" }}>
          {s.manual}
        </p>

        {/* Fuentes */}
        {s.sources && s.sources.length > 0 && (
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            {s.sources.map((src) => (
              <span key={src} className="tag tag-muted mono">{src}</span>
            ))}
          </div>
        )}

        {/* Plataformas + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
            {PLATFORM_ORDER.filter((p) => s.platforms.includes(p)).map((p) => (
              <span
                key={p}
                className="mono"
                style={{
                  fontSize: "0.55rem",
                  letterSpacing: "0.04em",
                  color: "var(--text-3)",
                  border: "1px solid var(--border-hi)",
                  padding: "1px 5px",
                }}
                title={`Disponible en ${PLATFORM_LABEL[p]}`}
              >
                {PLATFORM_LABEL[p]}
              </span>
            ))}
          </div>
          <span className="mono" style={{ color: "var(--accent)", fontSize: "0.66rem" }}>abrir →</span>
        </div>
      </Link>
    </div>
  );
}
