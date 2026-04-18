"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DrugCatalog, Drug, slugify, formatDoseRange, CATEGORY_ICONS, getDrugsInCategory } from "@/lib/drugs";
import drugsData from "../../../../public/drugs.json";
import { useParams } from "next/navigation";

const catalog = drugsData as DrugCatalog;

export default function DrugDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const drug = catalog.drugs.find((d) => slugify(d.name) === slug);

  if (!drug) {
    return (
      <div className="wrap" style={{ padding: "4rem 0", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", opacity: 0.2 }}>💀</div>
        <p style={{ color: "var(--text-1)", marginTop: "0.5rem" }}>Fármaco no encontrado</p>
        <Link href="/farmacos" className="btn btn-outline" style={{ marginTop: "1rem" }}>← Volver</Link>
      </div>
    );
  }

  const related = getDrugsInCategory(catalog.drugs, drug.category).filter((d) => d.name !== drug.name).slice(0, 6);

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <nav className="mono" style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.5rem", fontSize: "0.65rem", color: "var(--text-3)", flexWrap: "wrap" }}>
        <Link href="/farmacos" style={{ color: "var(--accent)", textDecoration: "none" }}>fármacos</Link>
        <span>/</span>
        <span>{drug.category.toLowerCase()}</span>
        <span>/</span>
        <span style={{ color: "var(--text-1)" }}>{drug.name.toLowerCase()}</span>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.8rem" }}>{CATEGORY_ICONS[drug.category] || "💊"}</span>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 700, lineHeight: 1.2 }}>{drug.name}</h1>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
              <span className="tag tag-accent">{drug.category}</span>
              <span className="tag tag-muted mono">{drug.typicalDoseUnit}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Description */}
      <Section title="FARMACOLOGÍA">
        <p style={{ color: "var(--text-1)", fontSize: "0.85rem", lineHeight: 1.7 }}>{drug.description}</p>
      </Section>

      {/* Presentation */}
      <Section title="PRESENTACIÓN Y DILUCIÓN">
        <div className="info-grid">
          <KV k="Presentación" v={drug.ampulePresentation} />
          <KV k="Cantidad" v={`${fN(drug.ampuleAmount)} ${drug.ampuleUnit}`} />
          {drug.ampuleVolumeMl > 0 && <KV k="Vol. ampolla" v={`${fN(drug.ampuleVolumeMl)} mL`} />}
          <KV k="Dilución estándar" v={`${fN(drug.standardDilutionMl)} mL`} />
          <KV k="Unidad típica" v={drug.typicalDoseUnit} accent />
          {drug.ampuleVolumeMl > 0 && drug.standardDilutionMl > 0 && <KV k="Concentración" v={calcConc(drug)} accent />}
        </div>
      </Section>

      {/* Doses */}
      {drug.doseRanges.length > 0 && (
        <Section title="RANGOS DE DOSIS">
          <div className="panel">
            <div className="panel-body">
              {drug.doseRanges.map((r, i) => (
                <div key={i} className="data-row">
                  <span className="data-label">{r.label}</span>
                  <span className="data-value mono" style={{ fontSize: "0.8rem" }}>
                    {formatDoseRange(r)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* Inline Calculator */}
      <Section title="CALCULADORA DE INFUSIÓN">
        <InlineCalc drug={drug} />
      </Section>

      {/* Related */}
      {related.length > 0 && (
        <Section title={`OTROS ${drug.category.toUpperCase()}`}>
          <div className="grid-panel" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {related.map((d) => (
              <Link
                key={d.name}
                href={`/farmacos/${slugify(d.name)}`}
                className="card-interactive"
                style={{ display: "block", padding: "0.6rem", textDecoration: "none", color: "inherit" }}
              >
                <div style={{ color: "var(--text-0)", fontSize: "0.8rem", fontWeight: 500 }}>{d.name}</div>
                <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginTop: "0.2rem" }}>
                  {d.ampulePresentation} · {d.typicalDoseUnit}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* Disclaimer */}
      <div className="panel" style={{ borderLeft: "3px solid var(--text-3)", marginTop: "2rem" }}>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", lineHeight: 1.7 }}>
            ⚕️ Información de referencia clínica. Verifique dosis, dilución y vía antes de administrar. No sustituye el juicio profesional.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Inline Calculator ── */

function InlineCalc({ drug }: { drug: Drug }) {
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState(drug.typicalDoseUnit);

  const concMcgMl = useMemo(() => {
    const amtMcg = drug.ampuleUnit === "mg" ? drug.ampuleAmount * 1000 :
                   drug.ampuleUnit === "µg" ? drug.ampuleAmount :
                   drug.ampuleAmount; // U treated as-is
    return drug.standardDilutionMl > 0 ? amtMcg / drug.standardDilutionMl : 0;
  }, [drug]);

  const result = useMemo(() => {
    const w = parseFloat(weight) || 0;
    const d = parseFloat(dose) || 0;
    if (d <= 0 || concMcgMl <= 0) return null;

    let doseMcgMin = 0;
    const u = doseUnit.toLowerCase();

    if (u.includes("/kg/min")) {
      doseMcgMin = d * (w || 70);
      if (u.startsWith("mg")) doseMcgMin *= 1000;
    } else if (u.includes("/kg/h")) {
      doseMcgMin = (d * (w || 70)) / 60;
      if (u.startsWith("mg")) doseMcgMin *= 1000;
    } else if (u.includes("/min")) {
      doseMcgMin = d;
      if (u.startsWith("mg")) doseMcgMin *= 1000;
    } else if (u.includes("/h")) {
      doseMcgMin = d / 60;
      if (u.startsWith("mg")) doseMcgMin *= 1000;
    } else {
      return null;
    }

    const mlH = (doseMcgMin / concMcgMl) * 60;
    const mlMin = doseMcgMin / concMcgMl;
    return { mlH: mlH.toFixed(1), mlMin: mlMin.toFixed(2), doseMcgMin: doseMcgMin.toFixed(2) };
  }, [weight, dose, doseUnit, concMcgMl]);

  const availableUnits = useMemo(() => {
    const units = new Set<string>();
    units.add(drug.typicalDoseUnit);
    drug.doseRanges.forEach((r) => units.add(r.unit));
    return Array.from(units).filter((u) => u && u !== "");
  }, [drug]);

  const needsWeight = doseUnit.includes("/kg");

  return (
    <div className="panel scanline">
      <div className="panel-header"><span className="dot" /> INFUSION CALC</div>
      <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
        {/* Weight */}
        <div>
          <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>
            PESO (kg) {!needsWeight && <span style={{ opacity: 0.4 }}>— no requerido para esta unidad</span>}
          </label>
          <input
            type="number"
            className="calc-input mono"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>

        {/* Dose + Unit */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          <div>
            <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>DOSIS</label>
            <input
              type="number"
              className="calc-input mono"
              placeholder="0.1"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              step="any"
            />
          </div>
          <div>
            <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.25rem" }}>UNIDAD</label>
            <select className="calc-select mono" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)}>
              {availableUnits.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Concentration info */}
        <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", padding: "0.3rem 0", borderTop: "1px solid var(--border)" }}>
          {drug.ampulePresentation} en {fN(drug.standardDilutionMl)} mL → {concMcgMl.toFixed(2)} {drug.ampuleUnit === "U" ? "U" : "µg"}/mL
        </div>

        {/* Result */}
        {result && (
          <div style={{ background: "var(--bg-1)", padding: "1rem", border: "1px solid var(--accent-border)", textAlign: "center" }}>
            <div className="calc-result">{result.mlH} mL/h</div>
            <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              = {result.mlMin} mL/min
            </div>
          </div>
        )}

        {!result && dose && (
          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", textAlign: "center", padding: "0.75rem" }}>
            {needsWeight && !weight ? "↑ Ingrese el peso del paciente" : "Ingrese una dosis válida"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Helpers ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--text-3)", marginBottom: "0.6rem", paddingBottom: "0.35rem", borderBottom: "1px solid var(--border)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function KV({ k, v, accent = false }: { k: string; v: string; accent?: boolean }) {
  return (
    <div>
      <span style={{ color: "var(--text-3)", fontSize: "0.7rem" }}>{k}</span>
      <span className={accent ? "mono" : ""} style={{ color: accent ? "var(--accent)" : "var(--text-0)", fontSize: "0.8rem", fontWeight: 600 }}>{v}</span>
    </div>
  );
}

function fN(n: number): string {
  return n === Math.floor(n) && n < 100000 ? n.toString() : n.toFixed(2);
}

function calcConc(d: Drug): string {
  if (d.ampuleUnit === "U") return `${(d.ampuleAmount / d.standardDilutionMl).toFixed(2)} U/mL`;
  const mcg = d.ampuleUnit === "mg" ? d.ampuleAmount * 1000 : d.ampuleAmount;
  const c = mcg / d.standardDilutionMl;
  return c >= 1000 ? `${(c / 1000).toFixed(2)} mg/mL` : `${c.toFixed(2)} µg/mL`;
}
