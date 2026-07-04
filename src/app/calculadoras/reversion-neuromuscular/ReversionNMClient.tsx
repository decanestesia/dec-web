"use client";

// ============================================================
// Reversión de bloqueo neuromuscular
// Decide reversor y dosis según profundidad del bloqueo (TOF/PTC)
// y clase de relajante (aminoesteroideo vs benzilisoquinolínico).
//
// LÓGICA CLÍNICA (constantes/umbrales exactos de la especificación
// y de literatura aceptada):
//
// SUGAMMADEX — solo aminoesteroideos (rocuronio, vecuronio):
//   - Bloqueo moderado (reaparición de T2; TOF-count 1–2): 2 mg/kg.
//   - Bloqueo profundo (PTC 1–2, sin T2):                   4 mg/kg.
//   - Reversión inmediata ~3 min post-rocuronio 1.2 mg/kg:  16 mg/kg.
//   Vial 200 mg/2 mL → 100 mg/mL.
//
// NEOSTIGMINA — cualquier no-despolarizante, SOLO si hay recuperación
//   espontánea (TOF-count ≥ 2, idealmente 4 con fade):
//   - Dosis 0.03–0.07 mg/kg (máx 5 mg total).
//   - Requiere anticolinérgico: glicopirrolato 0.2 mg por cada 1 mg de
//     neostigmina (o atropina).
//   - NO revierte bloqueo profundo/intenso (inefectiva; sin colinesterasa
//     que inhibir cuando no hay recuperación de la placa motora).
//
// FUENTES (Vancouver breve):
//  - Ficha técnica/prospecto Bridion (sugammadex), Merck/EMA-FDA:
//    2 mg/kg (moderado, reaparición T2), 4 mg/kg (profundo, PTC 1–2),
//    16 mg/kg (reversión inmediata post-rocuronio 1.2 mg/kg).
//  - Thilen SR, Weigel WA, Todd MM, et al. 2023 ASA Practice Guidelines
//    for Monitoring and Antagonism of Neuromuscular Blockade.
//    Anesthesiology. 2023;138(1):13-41.
//  - Brull SJ, Kopman AF. Current Status of Neuromuscular Reversal and
//    Monitoring. Anesthesiology. 2017;126(1):173-190.
//  - Miller's Anesthesia, 9.ª ed. (farmacología de reversión).
//
// Dosis/umbrales de literatura aceptada. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Parsing — acepta coma o punto como separador decimal
// ------------------------------------------------------------
function parseNumber(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// ------------------------------------------------------------
// Clase de relajante
// ------------------------------------------------------------
type RelaxantKey = "rocuronio" | "vecuronio" | "atracurio" | "cisatracurio";

interface RelaxantDef {
  key: RelaxantKey;
  label: string;
  aminosteroid: boolean; // true → reversible con sugammadex
  note: string;
}

const RELAXANTS: RelaxantDef[] = [
  {
    key: "rocuronio",
    label: "Rocuronio",
    aminosteroid: true,
    note: "aminoesteroideo — encapsula sugammadex",
  },
  {
    key: "vecuronio",
    label: "Vecuronio",
    aminosteroid: true,
    note: "aminoesteroideo — encapsula sugammadex",
  },
  {
    key: "atracurio",
    label: "Atracurio",
    aminosteroid: false,
    note: "benzilisoquinolínico — sugammadex NO lo revierte",
  },
  {
    key: "cisatracurio",
    label: "Cisatracurio",
    aminosteroid: false,
    note: "benzilisoquinolínico — sugammadex NO lo revierte",
  },
];

// ------------------------------------------------------------
// Profundidad del bloqueo (picker)
// ------------------------------------------------------------
type DepthKey = "intenso" | "profundo" | "moderado" | "superficial";

interface DepthDef {
  key: DepthKey;
  label: string;
  monitor: string; // descriptor del monitoreo
  // dosis de sugammadex (mg/kg) para aminoesteroideos en esta profundidad;
  // null = no hay recomendación estándar de dosis fija (usar 16 mg/kg rescate,
  // manejado aparte) — aquí "intenso" usa 16 mg/kg de reversión inmediata.
  sugammadexMgKg: number;
  // ¿la neostigmina es apropiada en esta profundidad?
  neostigmineOk: boolean;
}

const DEPTHS: DepthDef[] = [
  {
    key: "intenso",
    label: "Intenso",
    monitor: "PTC 0 — sin respuesta postetánica",
    sugammadexMgKg: 16,
    neostigmineOk: false,
  },
  {
    key: "profundo",
    label: "Profundo",
    monitor: "PTC 1–2, sin T2",
    sugammadexMgKg: 4,
    neostigmineOk: false,
  },
  {
    key: "moderado",
    label: "Moderado",
    monitor: "reaparición de T2 (TOF-count 1–2)",
    sugammadexMgKg: 2,
    neostigmineOk: false,
  },
  {
    key: "superficial",
    label: "Superficial",
    monitor: "TOF-count 4 con fade (TOF-ratio < 0.9)",
    sugammadexMgKg: 2,
    neostigmineOk: true,
  },
];

// ------------------------------------------------------------
// Constantes de dosificación
// ------------------------------------------------------------
const SUGAMMADEX_CONC_MG_ML = 100; // 200 mg / 2 mL
const NEOSTIGMINE_MG_KG_MIN = 0.03;
const NEOSTIGMINE_MG_KG_MAX = 0.07;
const NEOSTIGMINE_MAX_MG = 5;
const NEOSTIGMINE_CONC_MG_ML = 1; // vial habitual 0.5 mg/mL o 1 mg/mL; usamos 1 mg/mL para volumen aprox.
const GLYCOPYRROLATE_PER_NEOSTIGMINE = 0.2; // 0.2 mg glicopirrolato por cada 1 mg neostigmina

type Severity = "ok" | "warn" | "danger";

interface Recommendation {
  reverser: "sugammadex" | "neostigmina" | "ninguno";
  headline: string;
  color: string;
  severity: Severity;
  doseLine: string | null; // dosis principal (mg) + rango
  volumeLine: string | null; // volumen aprox.
  anticholinergicLine: string | null; // anticolinérgico asociado
  detail: string;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function buildRecommendation(
  weight: number | null,
  relaxant: RelaxantDef,
  depth: DepthDef
): Recommendation {
  // Sin peso válido no calculamos dosis, pero sí la conducta cualitativa.
  const w = weight !== null && weight > 0 ? weight : null;

  // ---- Aminoesteroideos (rocuronio / vecuronio) → sugammadex ----
  if (relaxant.aminosteroid) {
    const mgKg = depth.sugammadexMgKg;
    const totalMg = w !== null ? Math.round(w * mgKg) : null;
    const volMl = totalMg !== null ? round1(totalMg / SUGAMMADEX_CONC_MG_ML) : null;

    const immediate = depth.key === "intenso";
    const headline = immediate
      ? "Sugammadex 16 mg/kg (reversión inmediata)"
      : `Sugammadex ${mgKg} mg/kg`;

    const detail = immediate
      ? "Bloqueo intenso (PTC 0) tras dosis de intubación de rocuronio (~1.2 mg/kg): usar 16 mg/kg para reversión inmediata (p. ej. escenario no-intubo-no-ventilo). Sugammadex encapsula el rocuronio/vecuronio; no requiere anticolinérgico."
      : depth.key === "profundo"
      ? "Bloqueo profundo (PTC 1–2, sin T2): 4 mg/kg de sugammadex. No requiere anticolinérgico. La neostigmina es inefectiva a esta profundidad."
      : depth.key === "moderado"
      ? "Bloqueo moderado (reaparición de T2, TOF-count 1–2): 2 mg/kg de sugammadex. No requiere anticolinérgico."
      : "Bloqueo superficial (TOF-count 4 con fade): 2 mg/kg de sugammadex garantiza reversión completa (TOF-ratio ≥ 0.9). Alternativa: neostigmina + anticolinérgico si se dispone de monitoreo objetivo.";

    return {
      reverser: "sugammadex",
      headline,
      color: "var(--accent)",
      severity: "ok",
      doseLine:
        totalMg !== null
          ? `${totalMg} mg  ( ${mgKg} mg/kg × ${w} kg )`
          : `${mgKg} mg/kg — ingresa el peso para el total en mg`,
      volumeLine:
        volMl !== null
          ? `≈ ${volMl} mL  ( vial 200 mg/2 mL = ${SUGAMMADEX_CONC_MG_ML} mg/mL )`
          : null,
      anticholinergicLine: "no requiere anticolinérgico",
      detail,
    };
  }

  // ---- Benzilisoquinolínicos (atracurio / cisatracurio) ----
  // Sugammadex NO los revierte → neostigmina, pero solo si hay recuperación.
  if (!depth.neostigmineOk) {
    // Bloqueo intenso/profundo/moderado sin recuperación suficiente:
    // neostigmina inefectiva y sugammadex no aplica → esperar recuperación.
    return {
      reverser: "ninguno",
      headline: "Esperar recuperación espontánea",
      color: "var(--red)",
      severity: "danger",
      doseLine: null,
      volumeLine: null,
      anticholinergicLine: null,
      detail: `${relaxant.label} es benzilisoquinolínico: el sugammadex NO lo revierte. La neostigmina es inefectiva con bloqueo ${depth.label.toLowerCase()} (${depth.monitor}). Conducta: mantener ventilación/sedación y esperar la recuperación espontánea hasta TOF-count ≥ 2 (idealmente 4) antes de administrar neostigmina.`,
    };
  }

  // Benzilisoquinolínico con bloqueo superficial (TOF-count 4) → neostigmina.
  const lowMg = w !== null ? round1(w * NEOSTIGMINE_MG_KG_MIN) : null;
  const highMgRaw = w !== null ? w * NEOSTIGMINE_MG_KG_MAX : null;
  const highMg = highMgRaw !== null ? round1(Math.min(highMgRaw, NEOSTIGMINE_MAX_MG)) : null;
  const capped = highMgRaw !== null && highMgRaw > NEOSTIGMINE_MAX_MG;

  // Dosis "de referencia" para volumen y anticolinérgico: la dosis alta (limitada al máx).
  const doseForAnticholinergic = highMg;
  const glyco =
    doseForAnticholinergic !== null
      ? round1(doseForAnticholinergic * GLYCOPYRROLATE_PER_NEOSTIGMINE)
      : null;
  const volMl =
    doseForAnticholinergic !== null
      ? round1(doseForAnticholinergic / NEOSTIGMINE_CONC_MG_ML)
      : null;

  return {
    reverser: "neostigmina",
    headline: "Neostigmina 0.03–0.07 mg/kg + anticolinérgico",
    color: "var(--amber)",
    severity: "warn",
    doseLine:
      lowMg !== null && highMg !== null
        ? `${lowMg}–${highMg} mg  ( 0.03–0.07 mg/kg × ${w} kg${capped ? ", limitada a máx 5 mg" : ""} )`
        : `0.03–0.07 mg/kg (máx 5 mg) — ingresa el peso para el total en mg`,
    volumeLine:
      volMl !== null
        ? `≈ ${volMl} mL a la dosis alta ( vial ${NEOSTIGMINE_CONC_MG_ML} mg/mL )`
        : null,
    anticholinergicLine:
      glyco !== null
        ? `Glicopirrolato ≈ ${glyco} mg ( 0.2 mg por cada 1 mg de neostigmina ), o atropina ≈0.4 mg por cada 1 mg de neostigmina`
        : "Glicopirrolato 0.2 mg por cada 1 mg de neostigmina, o atropina",
    detail: `${relaxant.label} solo se revierte con neostigmina. Administrar únicamente con recuperación espontánea presente (TOF-count 4 con fade). Coadministrar anticolinérgico para bloquear los efectos muscarínicos (bradicardia, secreciones). Vigilar recurarización y confirmar TOF-ratio ≥ 0.9 antes de extubar.`,
  };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function ReversionNMClient() {
  const [weightText, setWeightText] = useState("");
  const [relaxantKey, setRelaxantKey] = useState<RelaxantKey>("rocuronio");
  const [depthKey, setDepthKey] = useState<DepthKey>("moderado");

  const weight = useMemo(() => parseNumber(weightText), [weightText]);

  const relaxant = useMemo(
    () => RELAXANTS.find((r) => r.key === relaxantKey) ?? RELAXANTS[0],
    [relaxantKey]
  );
  const depth = useMemo(
    () => DEPTHS.find((d) => d.key === depthKey) ?? DEPTHS[0],
    [depthKey]
  );

  const rec = useMemo(
    () => buildRecommendation(weight, relaxant, depth),
    [weight, relaxant, depth]
  );

  const weightValid = weight !== null && weight > 0 && weight <= 300;

  const clearAll = () => {
    setWeightText("");
    setRelaxantKey("rocuronio");
    setDepthKey("moderado");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./reversion-nm.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Reversión de bloqueo neuromuscular
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          reversor y dosis según profundidad (TOF/PTC) y clase de relajante
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el bloqueo residual no avisa: lo hace el estimulador"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.9rem" }}>
          {/* Peso */}
          <div style={{ maxWidth: 220 }}>
            <label className="mono" style={labelStyle}>
              Peso (kg)
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="70"
              value={weightText}
              onChange={(e) => setWeightText(e.target.value)}
              min={0}
              max={300}
              step="any"
            />
            {!weightValid && weightText.trim().length > 0 ? (
              <div
                className="mono"
                style={{ color: "var(--red)", fontSize: "0.55rem", marginTop: "0.3rem" }}
              >
                {"// peso fuera de rango (0–300 kg)"}
              </div>
            ) : null}
          </div>

          {/* Relajante (picker) */}
          <div>
            <label className="mono" style={labelStyle}>
              Relajante administrado
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {RELAXANTS.map((r) => {
                const active = r.key === relaxantKey;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRelaxantKey(r.key)}
                    className="mono"
                    style={{
                      padding: "0.55rem 0.5rem",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      border: "none",
                      textAlign: "left",
                      background: active ? "var(--accent)" : "var(--bg-1)",
                      color: active ? "#000" : "var(--text-2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {r.label}
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.5rem",
                        marginTop: "0.15rem",
                        opacity: active ? 0.75 : 0.6,
                      }}
                    >
                      {r.aminosteroid ? "aminoesteroideo" : "benzilisoquinolínico"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.35rem" }}
            >
              {"// " + relaxant.note}
            </div>
          </div>

          {/* Profundidad (picker) */}
          <div>
            <label className="mono" style={labelStyle}>
              Profundidad del bloqueo
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {DEPTHS.map((d) => {
                const active = d.key === depthKey;
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => setDepthKey(d.key)}
                    className="mono"
                    style={{
                      padding: "0.55rem 0.5rem",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      border: "none",
                      textAlign: "left",
                      background: active ? "var(--accent)" : "var(--bg-1)",
                      color: active ? "#000" : "var(--text-2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {d.label}
                    <span
                      style={{
                        display: "block",
                        fontSize: "0.5rem",
                        marginTop: "0.15rem",
                        opacity: active ? 0.75 : 0.6,
                      }}
                    >
                      {d.monitor}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RECOMENDACIÓN
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Reversor grande */}
          <div style={{ textAlign: "center", padding: "0.5rem 0 0.25rem" }}>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.6rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "0.3rem",
              }}
            >
              Reversor recomendado
            </div>
            <div
              className="calc-result"
              style={{ color: rec.color, fontSize: "1.5rem" }}
            >
              {rec.reverser === "sugammadex"
                ? "SUGAMMADEX"
                : rec.reverser === "neostigmina"
                ? "NEOSTIGMINA"
                : "— ESPERAR —"}
            </div>
          </div>

          {/* Bloque de dosis */}
          <div
            className="panel"
            style={{
              borderLeft: `3px solid ${rec.color}`,
              background: "var(--bg-1)",
            }}
          >
            <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className="mono"
                  style={{
                    color: rec.color,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {rec.headline}
                </span>
                <span
                  className="mono"
                  style={{
                    fontSize: "0.55rem",
                    padding: "0.1rem 0.4rem",
                    background: "var(--bg-3)",
                    color: "var(--text-2)",
                    border: "1px solid var(--border-hi)",
                    borderRadius: "9999px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {relaxant.label} · {depth.label.toLowerCase()}
                </span>
              </div>

              {/* Líneas de dosis / volumen / anticolinérgico */}
              {rec.doseLine ? (
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  <div
                    className="mono"
                    style={{ fontSize: "0.55rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Dosis
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: "0.9rem", color: "var(--text-0)", fontWeight: 700 }}
                  >
                    {rec.doseLine}
                  </div>
                </div>
              ) : null}

              {rec.volumeLine ? (
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  <div
                    className="mono"
                    style={{ fontSize: "0.55rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Volumen aprox.
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: "0.8rem", color: "var(--cyan)", fontWeight: 600 }}
                  >
                    {rec.volumeLine}
                  </div>
                </div>
              ) : null}

              {rec.anticholinergicLine ? (
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  <div
                    className="mono"
                    style={{ fontSize: "0.55rem", color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em" }}
                  >
                    Anticolinérgico
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: "0.8rem", color: "var(--text-1)", fontWeight: 600 }}
                  >
                    {rec.anticholinergicLine}
                  </div>
                </div>
              ) : null}

              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  margin: "0.2rem 0 0",
                }}
              >
                {rec.detail}
              </p>
            </div>
          </div>

          {/* Aviso de seguridad para neostigmina en bloqueo insuficiente */}
          {rec.severity === "danger" ? (
            <div
              className="mono"
              style={{
                fontSize: "0.6rem",
                color: "var(--red)",
                lineHeight: 1.6,
                border: "1px dashed var(--red)",
                padding: "0.6rem 0.75rem",
                background: "var(--bg-1)",
              }}
            >
              {"// no revertir con neostigmina en bloqueo profundo/intenso: es inefectiva"}
              <br />
              {"// sugammadex no aplica a benzilisoquinolínicos — mantener soporte y esperar"}
            </div>
          ) : null}
        </div>
      </div>

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          reiniciar
        </button>
      </div>

      {/* ==================== REFERENCIA: sugammadex ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> SUGAMMADEX — solo aminoesteroideos (roc/vec)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Profundidad", "Monitoreo", "Dosis"].map((h) => (
                    <th
                      key={h}
                      className="mono"
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.6rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-2)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { d: "Moderado", m: "reaparición T2 (TOF 1–2)", dose: "2 mg/kg" },
                  { d: "Profundo", m: "PTC 1–2, sin T2", dose: "4 mg/kg" },
                  {
                    d: "Reversión inmediata",
                    m: "PTC 0, ~3 min post-roc 1.2 mg/kg",
                    dose: "16 mg/kg",
                  },
                ].map((row) => (
                  <tr key={row.d} style={{ borderTop: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.d}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.72rem",
                        color: "var(--text-1)",
                      }}
                    >
                      {row.m}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--accent)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.dose}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== REFERENCIA: neostigmina ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> NEOSTIGMINA — cualquier no-despolarizante
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              Dosis <strong>0.03–0.07 mg/kg</strong> (máximo{" "}
              <strong>5 mg</strong> totales).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Solo con <strong>recuperación espontánea</strong> presente
              (TOF-count ≥ 2, idealmente 4 con fade). <strong>No revierte</strong>{" "}
              bloqueo profundo/intenso: es inefectiva.
            </li>
            <li style={{ marginBottom: "0" }}>
              Siempre con <strong>anticolinérgico</strong>: glicopirrolato 0.2 mg
              por cada 1 mg de neostigmina (o atropina), para bloquear los efectos
              muscarínicos (bradicardia, secreciones).
            </li>
          </ul>
        </div>
      </div>

      {/* ==================== NOTAS CLÍNICAS ==================== */}
      <div className="panel" style={{ marginBottom: "1.25rem" }}>
        <div className="panel-header">
          <span className="dot" /> NOTAS
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              El sugammadex encapsula fármacos <strong>aminoesteroideos</strong>
              {" "}(rocuronio, vecuronio); no revierte
              benzilisoquinolínicos (atracurio, cisatracurio).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Dosificar sugammadex por el <strong>peso real</strong> y la
              profundidad medida objetivamente. Confirmar recuperación con
              TOF-ratio ≥ 0.9 antes de extubar; vigilar recurarización.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Sugammadex se une a <strong>anticonceptivos hormonales</strong>
              {" "}(equivale a una dosis omitida) y puede causar bradicardia y,
              raramente, anafilaxia.
            </li>
            <li style={{ marginBottom: "0" }}>
              La <strong>monitorización cuantitativa</strong> (aceleromiografía) es
              el estándar recomendado por la guía ASA 2023 para decidir reversor,
              dosis y momento de extubación.
            </li>
          </ul>
        </div>
      </div>

      {/* ==================== FUENTES ==================== */}
      <div
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.6rem",
          lineHeight: 1.8,
          marginBottom: "1.25rem",
        }}
      >
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>Fuentes</div>
        Ficha técnica/prospecto de sugammadex (Bridion), Merck — EMA/FDA:
        2 mg/kg (moderado, reaparición de T2), 4 mg/kg (profundo, PTC 1–2),
        16 mg/kg (reversión inmediata post-rocuronio 1.2 mg/kg).
        <br />
        Thilen SR, Weigel WA, Todd MM, et al. 2023 ASA Practice Guidelines for
        Monitoring and Antagonism of Neuromuscular Blockade. Anesthesiology.
        2023;138(1):13-41.
        <br />
        Brull SJ, Kopman AF. Current Status of Neuromuscular Reversal and
        Monitoring. Anesthesiology. 2017;126(1):173-190.
      </div>

      {/* Disclaimer con humor negro */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          opacity: 0.6,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        {"// dosis de prospecto y guía aceptada — verifica peso, vial y monitoreo"}
        <br />
        {"// no sustituye el estimulador de nervio ni el juicio clínico"}
        <br />
        {"// el bloqueo residual no se ve; se mide"}
      </p>

      {/* Volver */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/calculadoras"
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.7rem",
            textDecoration: "none",
          }}
        >
          ← /calculadoras
        </Link>
      </div>
    </div>
  );
}
