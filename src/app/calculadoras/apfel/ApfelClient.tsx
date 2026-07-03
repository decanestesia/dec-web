"use client";

// ============================================================
// Score de Apfel — riesgo de náusea y vómito postoperatorio (NVPO)
//
// 4 factores de riesgo simplificados, 1 punto cada uno:
//   1) Sexo femenino
//   2) No fumador
//   3) Antecedente de NVPO y/o cinetosis (mareo por movimiento)
//   4) Uso previsto de opioides postoperatorios
//
// Suma 0–4 → riesgo aproximado de NVPO a 24 h:
//   0 → ~10 %   ·   1 → ~21 %   ·   2 → ~39 %
//   3 → ~61 %   ·   4 → ~79 %
//
// FUENTE (Vancouver):
//   Apfel CC, Läärä E, Koivuranta M, Greim CA, Roewer N.
//   A simplified risk score for predicting postoperative nausea
//   and vomiting: conclusions from cross-validations between two
//   centers. Anesthesiology. 1999;91(3):693-700.
//
// Estrategia de profilaxis (nº de antieméticos según nº de factores)
// según guías de consenso NVPO:
//   Gan TJ, Belani KG, Bergese S, et al. Fourth Consensus Guidelines
//   for the Management of Postoperative Nausea and Vomiting.
//   Anesth Analg. 2020;131(2):411-448.
//
// Porcentajes y cortes de literatura aceptada. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Definición de los 4 factores
// ------------------------------------------------------------
type FactorKey = "female" | "nonSmoker" | "historyPonvMotion" | "postopOpioids";

interface FactorDef {
  key: FactorKey;
  label: string;
  hint: string;
}

const FACTORS: FactorDef[] = [
  {
    key: "female",
    label: "Sexo femenino",
    hint: "predictor independiente más potente en el modelo",
  },
  {
    key: "nonSmoker",
    label: "No fumador",
    hint: "el tabaquismo activo se asocia a MENOR NVPO",
  },
  {
    key: "historyPonvMotion",
    label: "Antecedente de NVPO o cinetosis",
    hint: "NVPO previa y/o mareo por movimiento",
  },
  {
    key: "postopOpioids",
    label: "Opioides postoperatorios",
    hint: "uso previsto de opioides tras la cirugía",
  },
];

// ------------------------------------------------------------
// Riesgo aproximado por puntuación — Apfel et al. 1999
// (probabilidad de NVPO en las primeras 24 h)
// ------------------------------------------------------------
const RISK_BY_SCORE: Record<0 | 1 | 2 | 3 | 4, number> = {
  0: 10,
  1: 21,
  2: 39,
  3: 61,
  4: 79,
};

// ------------------------------------------------------------
// Interpretación / estrategia de profilaxis
// Estratificación pragmática de las guías de consenso NVPO:
//   riesgo bajo (0–1)    → medidas basales; no siempre profilaxis
//   riesgo moderado (2)  → 1–2 intervenciones antieméticas
//   riesgo alto (3–4)    → ≥ 2 intervenciones + abordaje multimodal
// ------------------------------------------------------------
type RiskLevel = "low" | "moderate" | "high";

interface Interpretation {
  level: RiskLevel;
  band: string; // etiqueta de banda de riesgo
  color: string;
  strategy: string; // recomendación de profilaxis
  interventions: string; // nº de antieméticos sugeridos
}

function interpret(score: number): Interpretation {
  if (score <= 1) {
    return {
      level: "low",
      band: "Riesgo bajo",
      color: "var(--accent)",
      interventions: "0–1 intervención",
      strategy:
        "Reducir el riesgo basal (anestesia regional cuando sea posible, evitar/limitar opioides y anestésicos volátiles, hidratación adecuada). La profilaxis farmacológica sistemática suele no estar indicada; considerar 1 antiemético en casos seleccionados.",
    };
  }
  if (score === 2) {
    return {
      level: "moderate",
      band: "Riesgo moderado",
      color: "var(--amber)",
      interventions: "1–2 intervenciones",
      strategy:
        "Profilaxis con 1–2 antieméticos de clases distintas (p. ej. dexametasona al inicio + antagonista 5-HT3 al final), junto con medidas para reducir el riesgo basal.",
    };
  }
  return {
    level: "high",
    band: "Riesgo alto",
    color: "var(--red)",
    interventions: "≥ 2 intervenciones",
    strategy:
      "Abordaje multimodal: ≥ 2 antieméticos de mecanismos diferentes más una técnica que reduzca el riesgo basal (anestesia regional o TIVA con propofol, minimizar opioides). Combinaciones de 3 clases en los perfiles de mayor riesgo.",
  };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function ApfelClient() {
  const [factors, setFactors] = useState<Record<FactorKey, boolean>>({
    female: false,
    nonSmoker: false,
    historyPonvMotion: false,
    postopOpioids: false,
  });

  const toggle = (key: FactorKey) =>
    setFactors((prev) => ({ ...prev, [key]: !prev[key] }));

  const score = useMemo(
    () => FACTORS.reduce((acc, f) => acc + (factors[f.key] ? 1 : 0), 0),
    [factors]
  );

  const risk = RISK_BY_SCORE[score as 0 | 1 | 2 | 3 | 4];
  const interpretation = useMemo(() => interpret(score), [score]);

  const clearAll = () =>
    setFactors({
      female: false,
      nonSmoker: false,
      historyPonvMotion: false,
      postopOpioids: false,
    });

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./apfel.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Score de Apfel</h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          riesgo de náusea y vómito postoperatorio (NVPO) — 4 factores
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el estómago del paciente no leyó tu plan anestésico"}
          </span>
        </p>
      </div>

      {/* ==================== FACTORES ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FACTORES DE RIESGO (1 punto c/u)
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

      {/* ==================== RESULTADO ==================== */}
      <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RESULTADO
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Score + riesgo grande */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Score */}
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
                Puntuación
              </div>
              <div
                className="calc-result"
                style={{ color: interpretation.color }}
              >
                {score}
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "1rem" }}
                >
                  {" "}
                  / 4
                </span>
              </div>
            </div>

            {/* Riesgo % */}
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
                Riesgo NVPO ~24 h
              </div>
              <div
                className="calc-result"
                style={{ color: interpretation.color }}
              >
                ~{risk}
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

          {/* Interpretación / estrategia */}
          <div
            className="panel"
            style={{
              borderLeft: `3px solid ${interpretation.color}`,
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
                    color: interpretation.color,
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {interpretation.band}
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
                  profilaxis: {interpretation.interventions}
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
                {interpretation.strategy}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          reiniciar factores
        </button>
      </div>

      {/* ==================== REFERENCIA: riesgo por puntuación ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RIESGO POR PUNTUACIÓN (Apfel et al. 1999)
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
                  {["Puntos", "Riesgo NVPO", "Banda", "Profilaxis"].map((h) => (
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
                {([0, 1, 2, 3, 4] as const).map((s) => {
                  const it = interpret(s);
                  return (
                    <tr
                      key={s}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background:
                          s === score ? "var(--accent-glow)" : "transparent",
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
                        {s}
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.76rem",
                          color: it.color,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        ~{RISK_BY_SCORE[s]} %
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.74rem",
                          color: "var(--text-1)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {it.band}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.72rem",
                          color: "var(--text-2)",
                        }}
                      >
                        {it.interventions}
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
          {"// probabilidad aproximada de NVPO en las primeras 24 h postoperatorias"}
          <br />
          {"// riesgo poblacional del modelo — el paciente concreto puede diferir"}
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
              El score simplificado de Apfel usa 4 predictores independientes con
              igual peso; cada factor presente suma 1 punto (rango 0–4).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Fue <strong>derivado y validado en adultos</strong>. No está diseñado
              para población pediátrica, donde se usan escalas específicas (p. ej.
              score de Eberhart / POVOC).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La estrategia de profilaxis se basa en{" "}
              <strong>combinar intervenciones de mecanismos distintos</strong> y en
              reducir el riesgo basal (anestesia regional, TIVA con propofol,
              minimizar opioides y volátiles, evitar N₂O, normovolemia).
            </li>
            <li style={{ marginBottom: "0" }}>
              El score estima probabilidad, no certeza: un paciente de 0 puntos aún
              puede vomitar y uno de 4 puede no hacerlo. Individualiza según cirugía
              y preferencias.
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
        Apfel CC, Läärä E, Koivuranta M, Greim CA, Roewer N. A simplified risk
        score for predicting postoperative nausea and vomiting: conclusions from
        cross-validations between two centers. Anesthesiology.
        1999;91(3):693-700.
        <br />
        Gan TJ, Belani KG, Bergese S, et al. Fourth Consensus Guidelines for the
        Management of Postoperative Nausea and Vomiting. Anesth Analg.
        2020;131(2):411-448.
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
        {"// score de Apfel — riesgo poblacional de literatura aceptada, no destino"}
        <br />
        {"// no sustituye el juicio clínico ni la valoración individual del paciente"}
        <br />
        {"// el antiemético llega tarde si esperas a ver el resultado del score"}
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
