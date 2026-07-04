// ============================================================
// /preview-contraste — RUTA TEMPORAL de propuesta.
// NO cambia el tema real (globals.css intacto). Solo previsualiza,
// con colores hardcodeados, cómo mejoraría el contraste subiendo
// --text-2 y --text-3 (el gris tenue) en claro y oscuro, manteniendo
// la estética. Bórrala cuando decidas. No está en el navbar.
// ============================================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preview contraste (temporal) — DEC",
  robots: { index: false, follow: false },
};

interface Palette {
  bg0: string; bg2: string; border: string; borderHi: string;
  t0: string; t1: string; t2: string; t3: string; accent: string; accentBorder: string;
}

const darkNow: Palette = {
  bg0: "#050608", bg2: "#0f1218", border: "#1a1e28", borderHi: "#2a2f3d",
  t0: "#f0f2f5", t1: "#c0c5cf", t2: "#7a8194", t3: "#464d5e", accent: "#10b981", accentBorder: "rgba(16,185,129,0.25)",
};
const darkNew: Palette = {
  ...darkNow, t2: "#9aa0b0", t3: "#6a7183", borderHi: "#363b4a",
};
const lightNow: Palette = {
  bg0: "#f8f9fb", bg2: "#e8eaef", border: "#e2e4ea", borderHi: "#cdd0d8",
  t0: "#0a0c10", t1: "#3a3f4c", t2: "#6b7280", t3: "#b0b5c0", accent: "#059669", accentBorder: "rgba(5,150,105,0.2)",
};
const lightNew: Palette = {
  ...lightNow, t2: "#565d6b", t3: "#8a90a0", border: "#d5d8e0",
};

const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

function SampleCard({ p, label }: { p: Palette; label: string }) {
  return (
    <div style={{ background: p.bg0, padding: "1rem", border: `1px solid ${p.border}` }}>
      <div style={{ fontFamily: mono, fontSize: "0.6rem", color: p.t3, letterSpacing: "0.08em", marginBottom: "0.6rem" }}>
        {label.toUpperCase()}
      </div>
      <div style={{ background: p.bg2, padding: "0.8rem", border: `1px solid ${p.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "0.5rem" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.accent, display: "inline-block" }} />
          <span style={{ fontFamily: mono, fontSize: "0.6rem", color: p.t3, letterSpacing: "0.1em" }}>INFUSION CALC</span>
        </div>
        <div style={{ color: p.t1, fontSize: "0.72rem", fontFamily: mono }}>
          50 mg (liofilizado)
          <span style={{ color: p.t2 }}> → diluir a 250 mL</span>
        </div>
        <div style={{ marginTop: 6, display: "inline-block", padding: "0.25rem 0.5rem", color: p.accent, fontFamily: mono, fontSize: "0.72rem", fontWeight: 600, background: p.bg0, border: `1px solid ${p.accentBorder}` }}>
          = 0.2 mg/mL · 200 µg/mL
        </div>
        <div style={{ fontFamily: mono, fontSize: "0.6rem", color: p.t3, marginTop: "0.6rem" }}>PESO (kg)</div>
        <div style={{ background: p.bg0, border: `1px solid ${p.borderHi}`, padding: "0.35rem 0.5rem", color: p.t0, fontFamily: mono, fontSize: "0.75rem", marginTop: 3 }}>70</div>
      </div>
      {/* Escala de texto */}
      <div style={{ marginTop: "0.8rem", display: "grid", gap: 3 }}>
        <div style={{ color: p.t0, fontSize: "0.72rem" }}>text-0 · título principal legible</div>
        <div style={{ color: p.t1, fontSize: "0.72rem" }}>text-1 · texto de cuerpo</div>
        <div style={{ color: p.t2, fontSize: "0.72rem", fontFamily: mono }}>text-2 · etiquetas y notas secundarias</div>
        <div style={{ color: p.t3, fontSize: "0.72rem", fontFamily: mono }}>text-3 · captions y hints (el que costaba leer)</div>
      </div>
    </div>
  );
}

function ChangeRow({ v, now, next }: { v: string; now: string; next: string }) {
  return (
    <tr style={{ borderBottom: "1px solid var(--border)" }}>
      <td style={{ padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.7rem", color: "var(--text-1)" }}>{v}</td>
      <td style={{ padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.7rem" }}>
        <span style={{ display: "inline-block", width: 12, height: 12, background: now, border: "1px solid var(--border-hi)", verticalAlign: "middle", marginRight: 6 }} />
        <span style={{ color: "var(--text-3)" }}>{now}</span>
      </td>
      <td style={{ padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.7rem" }}>
        <span style={{ display: "inline-block", width: 12, height: 12, background: next, border: "1px solid var(--border-hi)", verticalAlign: "middle", marginRight: 6 }} />
        <span style={{ color: "var(--accent)" }}>{next}</span>
      </td>
    </tr>
  );
}

export default function PreviewContraste() {
  return (
    <div className="wrap" style={{ paddingTop: "2rem", paddingBottom: "3rem", maxWidth: 900, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "1rem" }}>
        <b>$</b> preview --contraste --dry-run
      </div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "0.4rem" }}>Propuesta de contraste</h1>
      <p style={{ color: "var(--text-2)", fontSize: "0.85rem", marginBottom: "0.3rem" }}>
        Ruta <b>temporal</b> — no cambia nada del tema real. Solo sube el gris tenue (<code>--text-2</code> y <code>--text-3</code>)
        para mejor legibilidad, manteniendo la estética. Compara <b>actual</b> vs <b>propuesto</b> en claro y oscuro.
      </p>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.62rem", opacity: 0.7, marginBottom: "1.5rem" }}>
        {"// si te gusta, aplico estos valores en globals.css; si no, bórrala y aquí no pasó nada"}
      </p>

      <h2 className="mono" style={{ fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>// OSCURO</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <SampleCard p={darkNow} label="actual" />
        <SampleCard p={darkNew} label="propuesto" />
      </div>

      <h2 className="mono" style={{ fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>// CLARO</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
        <SampleCard p={lightNow} label="actual" />
        <SampleCard p={lightNew} label="propuesto" />
      </div>

      <h2 className="mono" style={{ fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>// CAMBIOS PROPUESTOS</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0.5rem" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-hi)" }}>
            <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.62rem", color: "var(--text-3)" }}>VARIABLE</th>
            <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.62rem", color: "var(--text-3)" }}>ACTUAL</th>
            <th style={{ textAlign: "left", padding: "0.35rem 0.5rem", fontFamily: mono, fontSize: "0.62rem", color: "var(--text-3)" }}>PROPUESTO</th>
          </tr>
        </thead>
        <tbody>
          <ChangeRow v="oscuro --text-2" now="#7a8194" next="#9aa0b0" />
          <ChangeRow v="oscuro --text-3" now="#464d5e" next="#6a7183" />
          <ChangeRow v="oscuro --border-hi" now="#2a2f3d" next="#363b4a" />
          <ChangeRow v="claro --text-2" now="#6b7280" next="#565d6b" />
          <ChangeRow v="claro --text-3" now="#b0b5c0" next="#8a90a0" />
          <ChangeRow v="claro --border" now="#e2e4ea" next="#d5d8e0" />
        </tbody>
      </table>
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", opacity: 0.7 }}>
        {"// text-0/text-1 y los acentos NO cambian · misma paleta, solo más legible"}
      </p>
    </div>
  );
}
