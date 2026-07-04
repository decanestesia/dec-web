"use client";

// ============================================================
// Riesgo cardíaco perioperatorio — RCRI (Índice de Lee revisado)
// + capacidad funcional en METs
//
// RCRI: 6 factores predictores, 1 punto cada uno:
//   1) Cirugía de alto riesgo (intraperitoneal, intratorácica o
//      vascular suprainguinal)
//   2) Cardiopatía isquémica
//   3) Insuficiencia cardíaca congestiva
//   4) Enfermedad cerebrovascular (ACV / AIT)
//   5) Diabetes mellitus en tratamiento con insulina
//   6) Creatinina sérica > 2.0 mg/dL
//
// Riesgo de evento cardíaco mayor (IAM, edema pulmonar,
// fibrilación ventricular / paro cardíaco, bloqueo AV completo)
// según nº de factores:
//   0  → 0.4 %
//   1  → 0.9 %
//   2  → 6.6 %
//   ≥3 → 11 %
//
// FUENTES (Vancouver breve):
//   Lee TH, Marcantonio ER, Mangione CM, et al. Derivation and
//   prospective validation of a simple index for prediction of
//   cardiac risk of major noncardiac surgery. Circulation.
//   1999;100(10):1043-1049.  (derivación/validación del RCRI)
//
//   Fleisher LA, Fleischmann KE, Auerbach AD, et al. 2014
//   ACC/AHA Guideline on Perioperative Cardiovascular Evaluation
//   and Management of Patients Undergoing Noncardiac Surgery.
//   J Am Coll Cardiol. 2014;64(22):e77-e137.  (METs; umbral <4)
//
// Porcentajes, factores y umbrales de literatura aceptada.
// NO inventados.
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
// Definición de los 6 factores del RCRI
// ------------------------------------------------------------
type FactorKey =
  | "highRiskSurgery"
  | "ischemicHeart"
  | "chf"
  | "cerebrovascular"
  | "insulinDiabetes"
  | "creatinine";

interface FactorDef {
  key: FactorKey;
  label: string;
  hint: string;
}

const FACTORS: FactorDef[] = [
  {
    key: "highRiskSurgery",
    label: "Cirugía de alto riesgo",
    hint: "intraperitoneal, intratorácica o vascular suprainguinal",
  },
  {
    key: "ischemicHeart",
    label: "Cardiopatía isquémica",
    hint: "IAM previo, angina, ondas Q, uso de nitratos o prueba de isquemia +",
  },
  {
    key: "chf",
    label: "Insuficiencia cardíaca congestiva",
    hint: "antecedente de ICC, EAP, disnea paroxística, crepitantes o S3",
  },
  {
    key: "cerebrovascular",
    label: "Enfermedad cerebrovascular",
    hint: "antecedente de ACV o AIT",
  },
  {
    key: "insulinDiabetes",
    label: "Diabetes en tratamiento con insulina",
    hint: "solo si requiere insulina (no orales/dieta)",
  },
  {
    key: "creatinine",
    label: "Creatinina > 2.0 mg/dL",
    hint: "creatinina sérica preoperatoria mayor de 2.0 mg/dL (>177 µmol/L)",
  },
];

// ------------------------------------------------------------
// Riesgo de evento cardíaco mayor por nº de factores — Lee 1999
// (índice de clase; ≥3 factores comparten la clase de mayor riesgo)
// ------------------------------------------------------------
interface RiskClass {
  band: string; // etiqueta de clase
  className: string; // Clase I–IV
  event: number; // % de evento cardíaco mayor
  level: "low" | "moderate" | "high" | "veryHigh";
  color: string;
}

// Clases del índice original (Lee et al., Circulation 1999)
const RISK_CLASSES: Record<0 | 1 | 2 | 3, RiskClass> = {
  0: {
    band: "Riesgo bajo",
    className: "Clase I",
    event: 0.4,
    level: "low",
    color: "var(--accent)",
  },
  1: {
    band: "Riesgo bajo",
    className: "Clase II",
    event: 0.9,
    level: "low",
    color: "var(--accent)",
  },
  2: {
    band: "Riesgo intermedio",
    className: "Clase III",
    event: 6.6,
    level: "moderate",
    color: "var(--amber)",
  },
  3: {
    band: "Riesgo elevado",
    className: "Clase IV",
    event: 11,
    level: "high",
    color: "var(--red)",
  },
};

// Mapea la puntuación (0–6) a la clase de riesgo (≥3 → clase IV)
function classForScore(score: number): RiskClass {
  const key = (score >= 3 ? 3 : score) as 0 | 1 | 2 | 3;
  return RISK_CLASSES[key];
}

// ------------------------------------------------------------
// Capacidad funcional en METs — ACC/AHA 2014
// Umbral clásico: < 4 METs = capacidad funcional pobre / desconocida
// → riesgo perioperatorio aumentado; considerar evaluación adicional.
// ≥ 4 METs (subir 2 pisos, caminar cuesta arriba, correr corto)
// = capacidad funcional adecuada.
// ------------------------------------------------------------
const METS_THRESHOLD = 4;

interface MetsInterpretation {
  ok: boolean; // true si ≥ 4 METs
  headline: string;
  detail: string;
  color: string;
}

function interpretMets(mets: number): MetsInterpretation {
  if (mets >= METS_THRESHOLD) {
    return {
      ok: true,
      headline: `Capacidad funcional adecuada (≥ ${METS_THRESHOLD} METs)`,
      detail:
        "≥ 4 METs (p. ej. subir 2 tramos de escaleras, caminar cuesta arriba, trote corto). Con buena capacidad funcional suele poder procederse a cirugía sin pruebas cardíacas adicionales, salvo hallazgos que las justifiquen.",
      color: "var(--accent)",
    };
  }
  return {
    ok: false,
    headline: `Capacidad funcional pobre (< ${METS_THRESHOLD} METs)`,
    detail:
      "< 4 METs (o desconocida): capacidad funcional limitada asociada a mayor riesgo perioperatorio. En cirugía de riesgo elevado, valorar si una prueba de estrés cambiaría el manejo (ACC/AHA 2014).",
    color: "var(--amber)",
  };
}

// ------------------------------------------------------------
// Recomendación global según clase RCRI (pragmática, ACC/AHA 2014)
// ------------------------------------------------------------
function recommendationForClass(rc: RiskClass): string {
  switch (rc.level) {
    case "low":
      return "Riesgo cardíaco bajo. Con capacidad funcional ≥ 4 METs suele procederse a cirugía sin estudios cardíacos adicionales. Optimizar comorbilidades y continuar la medicación cardiovascular indicada (p. ej. betabloqueo ya establecido).";
    case "moderate":
      return "Riesgo intermedio. Integrar con la capacidad funcional: si es ≥ 4 METs, generalmente proceder; si es < 4 METs o desconocida y la cirugía es de riesgo elevado, valorar si una prueba de estrés modificaría el manejo. Optimización médica y evaluación cardiológica según el caso.";
    default:
      return "Riesgo elevado. En cirugía electiva de riesgo elevado, considerar evaluación cardiológica antes del procedimiento, sobre todo si la capacidad funcional es < 4 METs o desconocida y una prueba cambiaría el manejo. Optimizar terapia médica; individualizar el balance riesgo/beneficio y el momento quirúrgico.";
  }
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function RiesgoCardiacoClient() {
  const [factors, setFactors] = useState<Record<FactorKey, boolean>>({
    highRiskSurgery: false,
    ischemicHeart: false,
    chf: false,
    cerebrovascular: false,
    insulinDiabetes: false,
    creatinine: false,
  });
  const [metsText, setMetsText] = useState("");

  const toggle = (key: FactorKey) =>
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }));

  const score = useMemo(
    () => FACTORS.reduce((acc, f) => acc + (factors[f.key] ? 1 : 0), 0),
    [factors]
  );

  const riskClass = useMemo(() => classForScore(score), [score]);
  const recommendation = useMemo(
    () => recommendationForClass(riskClass),
    [riskClass]
  );

  // METs opcional — solo interpreta si es un número > 0
  const mets = useMemo(() => parseNumber(metsText), [metsText]);
  const metsValid = mets !== null && mets > 0;
  const metsInterp = useMemo(
    () => (metsValid ? interpretMets(mets!) : null),
    [mets, metsValid]
  );

  const clearAll = () => {
    setFactors({
      highRiskSurgery: false,
      ischemicHeart: false,
      chf: false,
      cerebrovascular: false,
      insulinDiabetes: false,
      creatinine: false,
    });
    setMetsText("");
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
          <b>$</b> ./riesgo-cardiaco.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Riesgo cardíaco perioperatorio
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
          RCRI (Índice de Lee revisado) + capacidad funcional en METs — cirugía
          no cardíaca
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el corazón no firma el consentimiento informado"}
          </span>
        </p>
      </div>

      {/* ==================== FACTORES RCRI ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FACTORES RCRI (1 punto c/u)
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
          {FACTORS.map((f) => {
            const active = factors[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => toggle(f.key)}
                aria-pressed={active}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.7rem",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: "0.65rem 0.75rem",
                  border: `1px solid ${
                    active ? "var(--accent-border)" : "var(--border)"
                  }`,
                  background: active ? "var(--accent-glow)" : "var(--bg-1)",
                  transition: "all 0.15s",
                }}
              >
                {/* Checkbox visual */}
                <span
                  className="mono"
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: "1.15rem",
                    height: "1.15rem",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${
                      active ? "var(--accent)" : "var(--border-hi)"
                    }`,
                    background: active ? "var(--accent)" : "transparent",
                    color: active ? "#000" : "var(--text-3)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {active ? "✓" : ""}
                </span>

                <span style={{ display: "grid", gap: "0.15rem", flex: 1 }}>
                  <span
                    style={{
                      color: active ? "var(--text-0)" : "var(--text-1)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {f.label}
                  </span>
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.58rem" }}
                  >
                    {"// " + f.hint}
                  </span>
                </span>

                <span
                  className="mono"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-3)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {active ? "+1" : "0"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== METs (opcional) ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CAPACIDAD FUNCIONAL — METs (opcional)
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
          <div style={{ maxWidth: 200 }}>
            <label className="mono" style={labelStyle}>
              METs estimados
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="4"
              value={metsText}
              onChange={(e) => setMetsText(e.target.value)}
              min={0}
              max={20}
              step="any"
            />
          </div>
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.6,
            }}
          >
            {"// 1 MET = reposo · 4 METs = subir 2 pisos / caminar cuesta arriba"}
            <br />
            {"// umbral < 4 METs = capacidad funcional pobre → riesgo aumentado (ACC/AHA 2014)"}
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RESULTADO
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Score + evento % grande */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Puntuación */}
            <div
              style={{
                textAlign: "center",
                padding: "0.5rem 0.25rem",
                border: "1px solid var(--border)",
                background: "var(--bg-1)",
              }}
            >
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Puntuación RCRI
              </div>
              <div className="calc-result" style={{ color: riskClass.color }}>
                {score}
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "1rem" }}
                >
                  {" "}
                  / 6
                </span>
              </div>
            </div>

            {/* Evento % */}
            <div
              style={{
                textAlign: "center",
                padding: "0.5rem 0.25rem",
                border: "1px solid var(--border)",
                background: "var(--bg-1)",
              }}
            >
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Evento cardíaco mayor
              </div>
              <div className="calc-result" style={{ color: riskClass.color }}>
                {riskClass.event}
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "1rem" }}
                >
                  {" "}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Clase de riesgo + recomendación */}
          <div
            className="panel"
            style={{
              borderLeft: `3px solid ${riskClass.color}`,
              background: "var(--bg-1)",
            }}
          >
            <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
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
                    color: riskClass.color,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {riskClass.band}
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
                  {riskClass.className}
                </span>
              </div>
              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {recommendation}
              </p>
            </div>
          </div>

          {/* Interpretación METs (solo si hay input válido) */}
          {metsInterp ? (
            <div
              className="panel"
              style={{
                borderLeft: `3px solid ${metsInterp.color}`,
                background: "var(--bg-1)",
              }}
            >
              <div
                className="panel-body"
                style={{ display: "grid", gap: "0.3rem" }}
              >
                <span
                  className="mono"
                  style={{
                    color: metsInterp.color,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                  }}
                >
                  {metsInterp.headline}
                </span>
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.76rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {metsInterp.detail}
                </p>
              </div>
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

      {/* ==================== REFERENCIA: riesgo por clase ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RIESGO POR PUNTUACIÓN (Lee et al. 1999)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 440,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Factores", "Clase", "Evento mayor", "Banda"].map((h) => (
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
                {(
                  [
                    { pts: "0", key: 0 as const },
                    { pts: "1", key: 1 as const },
                    { pts: "2", key: 2 as const },
                    { pts: "≥ 3", key: 3 as const },
                  ]
                ).map((row) => {
                  const rc = RISK_CLASSES[row.key];
                  const isActive =
                    (row.key === 3 && score >= 3) || row.key === score;
                  return (
                    <tr
                      key={row.pts}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: isActive
                          ? "var(--accent-glow)"
                          : "transparent",
                      }}
                    >
                      <td
                        className="mono"
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.76rem",
                          color: "var(--text-0)",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.pts}
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.74rem",
                          color: "var(--text-2)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rc.className}
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.76rem",
                          color: rc.color,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rc.event} %
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.74rem",
                          color: "var(--text-1)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rc.band}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="mono"
          style={{
            padding: "0.6rem 0.75rem",
            borderTop: "1px solid var(--border)",
            color: "var(--text-3)",
            fontSize: "0.55rem",
            lineHeight: 1.6,
          }}
        >
          {"// evento cardíaco mayor: IAM, edema pulmonar, FV / paro, bloqueo AV completo"}
          <br />
          {"// riesgo poblacional del índice — el paciente concreto puede diferir"}
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
              El RCRI predice <strong>riesgo cardíaco en cirugía no
              cardíaca</strong>; cada uno de los 6 predictores pesa igual (1
              punto). La diabetes cuenta <strong>solo si requiere insulina</strong>.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Combina el índice con la <strong>capacidad funcional</strong>: una
              capacidad ≥ 4 METs suele permitir proceder sin pruebas adicionales;
              una capacidad {"< 4"} METs o desconocida en cirugía de riesgo eleva
              la sospecha (ACC/AHA 2014).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Los eventos considerados son <strong>IAM, edema agudo de pulmón,
              fibrilación ventricular o paro y bloqueo AV completo</strong>.
              Existen modelos más recientes (NSQIP MICA, calculadora ACS-NSQIP)
              que pueden complementar la estimación.
            </li>
            <li style={{ marginBottom: "0" }}>
              No sustituye la valoración integral: comorbilidad, urgencia,
              magnitud de la cirugía, biomarcadores (troponina/BNP) y
              optimización médica mandan sobre el número.
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
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>
          Fuentes
        </div>
        Lee TH, Marcantonio ER, Mangione CM, et al. Derivation and prospective
        validation of a simple index for prediction of cardiac risk of major
        noncardiac surgery. Circulation. 1999;100(10):1043-1049.
        <br />
        Fleisher LA, Fleischmann KE, Auerbach AD, et al. 2014 ACC/AHA Guideline
        on Perioperative Cardiovascular Evaluation and Management of Patients
        Undergoing Noncardiac Surgery. J Am Coll Cardiol.
        2014;64(22):e77-e137.
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
        {"// RCRI + METs — riesgo poblacional de literatura aceptada, no destino"}
        <br />
        {"// no sustituye la valoración individual ni la optimización preoperatoria"}
        <br />
        {"// el índice estratifica; el paro cardíaco no consulta el índice"}
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
