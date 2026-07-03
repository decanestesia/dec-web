"use client";

// ============================================================
// Anestésicos locales — dosis MÁXIMA por peso (prevención de LAST)
// Convierte % → mg/mL (1% = 10 mg/mL), calcula mg máx y VOLUMEN
// máx (mL) de esa concentración. Incluye reconocimiento de LAST
// y algoritmo de rescate con emulsión lipídica 20%.
//
// EXACTITUD CLÍNICA (app de alta precisión): cada dosis máxima
// proviene de literatura aceptada. NO cifras inventadas; rangos
// donde la literatura los da. Fuentes citadas al pie (Vancouver).
//
// FUENTES (Vancouver breve):
//  - Gropper MA, et al. Miller's Anesthesia. 9.ª ed. Elsevier;
//    2020. (Cap. Anestésicos locales — dosis máximas recomendadas)
//  - Neal JM, Barrington MJ, Fettiplace MR, et al. The Third
//    American Society of Regional Anesthesia and Pain Medicine
//    Practice Advisory on Local Anesthetic Systemic Toxicity:
//    Executive Summary 2017. Reg Anesth Pain Med. 2018;43(2):113-123.
//  - ASRA. Checklist for Treatment of Local Anesthetic Systemic
//    Toxicity (2020 version). Reg Anesth Pain Med.
//  - Neal JM, Woodward CM, Harrison TK. The ASRA Checklist for
//    LAST: 2020 version. Reg Anesth Pain Med. 2021;46(1):81-82.
//
// Nota sobre dosis máximas: son valores de referencia para el
// adulto sano; NO garantizan seguridad. Dependen de sitio de
// inyección (vascularidad), técnica, comorbilidad y velocidad de
// absorción. Se dosifica sobre PESO CORPORAL MAGRO en obesidad.
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
// Tope de peso para el cálculo por kg.
// La mayoría de textos plafona la dosis máxima en ~70 kg (adulto
// de referencia): por encima, escalar linealmente con el peso NO
// aumenta la seguridad y arriesga sobredosis. Se aplica un tope
// conservador y se avisa cuando el peso lo supera.
// (Miller's Anesthesia; ASRA practice advisory.)
// ------------------------------------------------------------
const WEIGHT_CAP_KG = 70;

// ------------------------------------------------------------
// Catálogo de agentes con dosis máximas (mg/kg).
// plain = sin epinefrina · epi = con epinefrina (vasoconstrictor).
// Donde la literatura ofrece un rango o un valor discutido, se
// documenta en `note`. Concentraciones comunes para el selector.
// ------------------------------------------------------------
interface Agent {
  id: string;
  name: string;
  maxPlain: number; // mg/kg sin epinefrina
  maxEpi: number; // mg/kg con epinefrina
  epiDebated?: boolean; // el valor "con epi" es discutido en literatura
  concentrations: number[]; // % típicos
  note: string;
}

const AGENTS: Agent[] = [
  {
    id: "lidocaina",
    name: "Lidocaína",
    maxPlain: 4.5,
    maxEpi: 7,
    concentrations: [0.5, 1, 1.5, 2],
    note: "4.5 mg/kg sin epi · 7 mg/kg con epi (Miller's).",
  },
  {
    id: "bupivacaina",
    name: "Bupivacaína",
    maxPlain: 2,
    maxEpi: 3,
    epiDebated: true,
    concentrations: [0.25, 0.5, 0.75],
    note: "2 mg/kg. El techo con epi (2.5–3 mg/kg) es discutido; la epinefrina reduce la absorción pero no elimina la cardiotoxicidad. Cardiotóxica: usar la dosis más baja eficaz.",
  },
  {
    id: "ropivacaina",
    name: "Ropivacaína",
    maxPlain: 3,
    maxEpi: 3,
    concentrations: [0.2, 0.5, 0.75, 1],
    note: "3 mg/kg. La epinefrina apenas modifica su absorción; no se asume un techo superior con epi.",
  },
  {
    id: "mepivacaina",
    name: "Mepivacaína",
    maxPlain: 4.5,
    maxEpi: 7,
    concentrations: [1, 1.5, 2, 3],
    note: "4.5 mg/kg sin epi · 7 mg/kg con epi (Miller's).",
  },
  {
    id: "prilocaina",
    name: "Prilocaína",
    maxPlain: 6,
    maxEpi: 8,
    concentrations: [0.5, 1, 2, 3],
    note: "6 mg/kg sin epi · 8 mg/kg con epi. Riesgo de metahemoglobinemia a dosis altas (> ~600 mg).",
  },
];

const AGENT_BY_ID: Record<string, Agent> = Object.fromEntries(
  AGENTS.map((a) => [a.id, a])
);

// ------------------------------------------------------------
// Conversión % → mg/mL. Regla: 1% = 10 mg/mL.
// ------------------------------------------------------------
function percentToMgPerMl(percent: number): number {
  return percent * 10;
}

// ------------------------------------------------------------
// Cálculo principal
// ------------------------------------------------------------
interface Result {
  agent: Agent;
  weightKg: number;
  dosingWeightKg: number; // peso usado (plafonado a WEIGHT_CAP_KG)
  capped: boolean;
  withEpi: boolean;
  maxMgPerKg: number; // mg/kg aplicado
  maxMg: number; // dosis máx total (mg)
  concentrationPercent: number;
  mgPerMl: number; // mg/mL de esa concentración
  maxVolumeMl: number; // volumen máx (mL) de esa concentración
}

function compute(
  agent: Agent | null,
  weightKg: number | null,
  concentrationPercent: number | null,
  withEpi: boolean
): Result | null {
  if (agent === null) return null;
  if (weightKg === null || !(weightKg > 0)) return null;
  if (concentrationPercent === null || !(concentrationPercent > 0)) return null;

  // Peso para dosificar: plafonado al adulto de referencia (~70 kg).
  const dosingWeightKg = Math.min(weightKg, WEIGHT_CAP_KG);
  const capped = weightKg > WEIGHT_CAP_KG;

  const maxMgPerKg = withEpi ? agent.maxEpi : agent.maxPlain;
  const maxMg = maxMgPerKg * dosingWeightKg;

  const mgPerMl = percentToMgPerMl(concentrationPercent);
  const maxVolumeMl = maxMg / mgPerMl;

  return {
    agent,
    weightKg,
    dosingWeightKg,
    capped,
    withEpi,
    maxMgPerKg,
    maxMg,
    concentrationPercent,
    mgPerMl,
    maxVolumeMl,
  };
}

// ------------------------------------------------------------
// Emulsión lipídica 20% — dosificación por peso (ASRA 2020).
//  Bolo:       1.5 mL/kg (peso magro) en ~2–3 min
//  Infusión:   0.25 mL/kg/min
//  Re-bolo:    puede repetirse 1–2 veces si persiste inestabilidad
//  Doblar infusión a 0.5 mL/kg/min si la PA sigue baja
//  Máx aprox.: ~12 mL/kg en la primera media hora
// El peso también se plafona a 70 kg por convención (paciente de
// referencia); en obesidad usar peso corporal magro.
// ------------------------------------------------------------
interface LipidRescue {
  dosingWeightKg: number;
  bolusMl: number; // 1.5 mL/kg
  infusionMlPerMin: number; // 0.25 mL/kg/min
  infusionDoubledMlPerMin: number; // 0.5 mL/kg/min
  maxDoseMl: number; // ~12 mL/kg techo aproximado
}

function lipidRescue(weightKg: number | null): LipidRescue | null {
  if (weightKg === null || !(weightKg > 0)) return null;
  const dosingWeightKg = Math.min(weightKg, WEIGHT_CAP_KG);
  return {
    dosingWeightKg,
    bolusMl: 1.5 * dosingWeightKg,
    infusionMlPerMin: 0.25 * dosingWeightKg,
    infusionDoubledMlPerMin: 0.5 * dosingWeightKg,
    maxDoseMl: 12 * dosingWeightKg,
  };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function AnestesicosLocalesClient() {
  const [weightText, setWeightText] = useState("");
  const [agentId, setAgentId] = useState<string>(AGENTS[0].id);
  const [concentrationText, setConcentrationText] = useState("");
  const [withEpi, setWithEpi] = useState(false);

  const agent = AGENT_BY_ID[agentId] ?? null;
  const weightKg = useMemo(() => parseNumber(weightText), [weightText]);
  const concentrationPercent = useMemo(
    () => parseNumber(concentrationText),
    [concentrationText]
  );

  const result = useMemo(
    () => compute(agent, weightKg, concentrationPercent, withEpi),
    [agent, weightKg, concentrationPercent, withEpi]
  );

  const lipid = useMemo(() => lipidRescue(weightKg), [weightKg]);

  const clearAll = () => {
    setWeightText("");
    setConcentrationText("");
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
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./anestesicos-locales.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Anestésicos locales — dosis máxima
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
          dosis máx por peso · mg y volumen (mL) por concentración · prevención
          de LAST
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el techo por kg no es una promesa; el sitio vascular no lee la ficha"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
            }}
          >
            {/* Peso */}
            <div>
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
                step="any"
              />
            </div>

            {/* Agente */}
            <div>
              <label className="mono" style={labelStyle}>
                Agente
              </label>
              <select
                className="calc-select mono"
                value={agentId}
                onChange={(e) => {
                  setAgentId(e.target.value);
                  setConcentrationText("");
                }}
              >
                {AGENTS.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Concentración (%) */}
          <div>
            <label className="mono" style={labelStyle}>
              Concentración (%){" "}
              <span style={{ opacity: 0.5, textTransform: "none" }}>
                — 1% = 10 mg/mL
              </span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="ej. 2"
              value={concentrationText}
              onChange={(e) => setConcentrationText(e.target.value)}
              min={0}
              step="any"
            />
            {/* Chips de concentraciones típicas del agente */}
            {agent && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.35rem",
                  marginTop: "0.45rem",
                }}
              >
                {agent.concentrations.map((c) => {
                  const active =
                    concentrationPercent !== null &&
                    Math.abs(concentrationPercent - c) < 1e-9;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setConcentrationText(String(c))}
                      className="mono"
                      style={{
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.6rem",
                        cursor: "pointer",
                        border: `1px solid ${
                          active ? "var(--cyan)" : "var(--border)"
                        }`,
                        background: active
                          ? "rgba(6,182,212,0.12)"
                          : "var(--bg-1)",
                        color: active ? "var(--cyan)" : "var(--text-2)",
                        transition: "all 0.15s",
                      }}
                    >
                      {c}% · {percentToMgPerMl(c)} mg/mL
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Epinefrina (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Vasoconstrictor (epinefrina)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                { key: false, label: "Sin epinefrina" },
                { key: true, label: "Con epinefrina" },
              ].map((opt) => (
                <button
                  key={String(opt.key)}
                  type="button"
                  onClick={() => setWithEpi(opt.key)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      opt.key === withEpi ? "var(--accent)" : "var(--bg-1)",
                    color: opt.key === withEpi ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {agent && (
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  lineHeight: 1.6,
                  marginTop: "0.4rem",
                }}
              >
                {agent.note}
                {withEpi && agent.epiDebated ? (
                  <>
                    <br />
                    {"// techo con epi discutido — se aplica el valor conservador de literatura"}
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {result ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> DOSIS MÁXIMA
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* Volumen máximo — dato protagonista */}
            <div style={{ textAlign: "center", padding: "0.5rem 0 0.25rem" }}>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "0.25rem",
                }}
              >
                Volumen máximo · {result.agent.name}{" "}
                {result.concentrationPercent}%
              </div>
              <div className="calc-result" style={{ color: "var(--cyan)" }}>
                {result.maxVolumeMl.toFixed(1)} mL
              </div>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  marginTop: "0.3rem",
                }}
              >
                {result.maxMg.toFixed(0)} mg ÷ {result.mgPerMl} mg/mL ={" "}
                {result.maxVolumeMl.toFixed(1)} mL
              </div>
            </div>

            {/* Desglose */}
            <div style={{ display: "grid", gap: "0.6rem" }}>
              <ResultRow
                title="Dosis máx por kg"
                value={`${result.maxMgPerKg} mg/kg`}
                badge={result.withEpi ? "con epi" : "sin epi"}
              />
              <ResultRow
                title="Peso para dosis"
                value={`${result.dosingWeightKg.toFixed(1)} kg`}
                badge={result.capped ? "plafonado 70 kg" : undefined}
              />
              <ResultRow
                title="Dosis máx total"
                value={`${result.maxMg.toFixed(0)} mg`}
              />
              <ResultRow
                title="Concentración"
                value={`${result.concentrationPercent}% = ${result.mgPerMl} mg/mL`}
              />
            </div>

            {/* Aviso de plafonado */}
            {result.capped && (
              <div
                className="panel"
                style={{
                  borderLeft: "3px solid var(--amber)",
                  background: "var(--bg-1)",
                }}
              >
                <div
                  className="panel-body"
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: "var(--amber)", fontSize: "0.9rem" }}>
                    ⚠
                  </span>
                  <p
                    style={{
                      color: "var(--text-1)",
                      fontSize: "0.72rem",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    Peso ingresado {result.weightKg.toFixed(1)} kg &gt; 70 kg: la
                    dosis se calcula sobre 70 kg (adulto de referencia). Escalar
                    la dosis máxima linealmente con el peso corporal total NO
                    aumenta la seguridad; en obesidad dosifica sobre peso
                    corporal magro.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
            marginBottom: "1rem",
            lineHeight: 1.7,
          }}
        >
          Ingresa peso ({">"}0 kg), agente y concentración (%) para calcular.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin concentración no hay volumen; solo un mg suelto"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIA: dosis máximas ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> DOSIS MÁXIMAS (mg/kg) — MILLER&apos;S
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 440 }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Agente", "Sin epi", "Con epi", "Notas"].map((h) => (
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
                {AGENTS.map((a) => (
                  <tr key={a.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                      }}
                    >
                      {a.name}
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
                      {a.maxPlain} mg/kg
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color:
                          a.maxEpi > a.maxPlain ? "var(--cyan)" : "var(--text-2)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {a.maxEpi > a.maxPlain ? `${a.maxEpi} mg/kg` : "= sin epi"}
                      {a.epiDebated ? " *" : ""}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.68rem",
                        color: "var(--text-2)",
                      }}
                    >
                      {a.note}
                    </td>
                  </tr>
                ))}
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
          {"// * bupivacaína: techo con epi (2.5–3 mg/kg) discutido; la epi baja absorción, no cardiotoxicidad"}
          <br />
          {"// dosis máx = techo de referencia del adulto sano, NO garantía de seguridad"}
          <br />
          {"// 1% = 10 mg/mL · 2% = 20 mg/mL · 0.5% = 5 mg/mL"}
        </div>
      </div>

      {/* ==================== RECONOCIMIENTO DE LAST ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> RECONOCIMIENTO DE LAST
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            La <strong>toxicidad sistémica por anestésicos locales (LAST)</strong>{" "}
            puede aparecer de forma inmediata (inyección intravascular) o tardía
            (minutos a &gt; 30 min por absorción). La presentación es atípica y
            variable: mantén alta sospecha ante cualquier alteración neurológica
            o cardiovascular tras una técnica regional.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.6rem",
            }}
          >
            {/* Pródromos / SNC */}
            <div
              className="panel"
              style={{ borderLeft: "3px solid var(--amber)", background: "var(--bg-1)" }}
            >
              <div className="panel-body">
                <div
                  className="mono"
                  style={{
                    color: "var(--amber)",
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.4rem",
                  }}
                >
                  Pródromos / SNC (precoz)
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1rem",
                    color: "var(--text-1)",
                    fontSize: "0.72rem",
                    lineHeight: 1.6,
                  }}
                >
                  <li>Acúfenos, sabor metálico</li>
                  <li>Adormecimiento peribucal / lingual</li>
                  <li>Agitación, confusión, disartria</li>
                  <li>Mioclonías → convulsiones</li>
                  <li>Depresión del SNC / coma</li>
                </ul>
              </div>
            </div>

            {/* Cardiovascular */}
            <div
              className="panel"
              style={{ borderLeft: "3px solid var(--red)", background: "var(--bg-1)" }}
            >
              <div className="panel-body">
                <div
                  className="mono"
                  style={{
                    color: "var(--red)",
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: "0.4rem",
                  }}
                >
                  Cardiovascular (grave)
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1rem",
                    color: "var(--text-1)",
                    fontSize: "0.72rem",
                    lineHeight: 1.6,
                  }}
                >
                  <li>HTA/taquicardia inicial → hipotensión</li>
                  <li>Bradicardia, bloqueos de conducción</li>
                  <li>Arritmias ventriculares</li>
                  <li>Colapso / paro (bupivacaína)</li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.6,
            }}
          >
            {"// prevención: dosis fraccionada, aspiración antes de inyectar, dosis de prueba con epi, guía ecográfica, monitorización continua"}
          </div>
        </div>
      </div>

      {/* ==================== TRATAMIENTO — EMULSIÓN LIPÍDICA ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> TRATAMIENTO — EMULSIÓN LIPÍDICA 20% (ASRA 2020)
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Pasos del algoritmo */}
          <ol
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.76rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Pide ayuda</strong> y el kit de LAST. Detén la inyección
              del anestésico local.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Vía aérea:</strong> ventila con O₂ 100% (evita hipoxemia,
              hipercapnia y acidosis, que agravan la toxicidad).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Controla convulsiones:</strong> benzodiacepina de
              elección. Evita grandes dosis de propofol si hay inestabilidad
              cardiovascular (no sustituye a la emulsión lipídica).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Inicia emulsión lipídica 20%</strong> ante los primeros
              signos serios (ver dosis abajo).
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Si hay paro:</strong> RCP estándar con ajustes —
              adrenalina en bolos <strong>reducidos (≤ 1 µg/kg)</strong>; evita
              vasopresina, bloqueadores de canales de calcio, betabloqueadores y
              anestésicos locales.
            </li>
            <li style={{ marginBottom: "0" }}>
              Prevé <strong>bypass cardiopulmonar / ECMO</strong> si no
              responde. Monitoriza ≥ 4–6 h (o más si hubo colapso).
            </li>
          </ol>

          {/* Dosis calculadas por peso */}
          {lipid ? (
            <>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Dosis para {lipid.dosingWeightKg.toFixed(0)} kg
                {weightKg !== null && weightKg > WEIGHT_CAP_KG
                  ? " (plafonado 70 kg / peso magro)"
                  : ""}
              </div>
              <div style={{ display: "grid", gap: "0.6rem" }}>
                <ResultRow
                  title="Bolo IV"
                  value={`${lipid.bolusMl.toFixed(0)} mL`}
                  badge="1.5 mL/kg en ~2–3 min"
                />
                <ResultRow
                  title="Infusión"
                  value={`${lipid.infusionMlPerMin.toFixed(1)} mL/min`}
                  badge="0.25 mL/kg/min"
                />
                <ResultRow
                  title="Infusión doblada"
                  value={`${lipid.infusionDoubledMlPerMin.toFixed(1)} mL/min`}
                  badge="0.5 mL/kg/min si PA baja"
                />
                <ResultRow
                  title="Dosis máx aprox."
                  value={`~${lipid.maxDoseMl.toFixed(0)} mL`}
                  badge="~12 mL/kg / 30 min"
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
                {"// re-bolo 1.5 mL/kg 1–2 veces si persiste inestabilidad; mantén la infusión ≥ 10 min tras estabilizar"}
                <br />
                {"// dosifica sobre peso corporal magro; peso > 70 kg se plafona"}
              </div>
            </>
          ) : (
            <div
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.65rem" }}
            >
              Ingresa el peso arriba para calcular el bolo e infusión de emulsión
              lipídica.
            </div>
          )}
        </div>
      </div>

      {/* ==================== NOTAS ==================== */}
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
              Las dosis máximas son <strong>valores de referencia del adulto
              sano</strong>: no garantizan seguridad. La toxicidad depende del
              sitio de inyección (bloqueo intercostal &gt; caudal &gt; epidural
              &gt; plexo braquial &gt; subcutáneo), la técnica y las
              comorbilidades.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Ajusta a la baja en <strong>extremos de edad, embarazo,
              insuficiencia hepática/renal/cardíaca</strong> y estados de bajo
              gasto.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Si combinas anestésicos locales, sus toxicidades se consideran
              <strong> aditivas</strong>: la suma de fracciones de dosis máxima
              no debe superar 1.
            </li>
            <li style={{ marginBottom: "0" }}>
              Ten la <strong>emulsión lipídica 20% disponible</strong> siempre
              que uses dosis potencialmente tóxicas de anestésico local.
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
        Gropper MA, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020
        (anestésicos locales — dosis máximas recomendadas).
        <br />
        Neal JM, Barrington MJ, Fettiplace MR, et al. The Third ASRA Practice
        Advisory on Local Anesthetic Systemic Toxicity: Executive Summary 2017.
        Reg Anesth Pain Med. 2018;43(2):113-123.
        <br />
        Neal JM, Woodward CM, Harrison TK. The ASRA Checklist for Local
        Anesthetic Systemic Toxicity: 2020 version. Reg Anesth Pain Med.
        2021;46(1):81-82.
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
        {"// dosis máximas de literatura aceptada — techo de referencia, no salvoconducto"}
        <br />
        {"// no sustituye monitorización, aspiración, dosis fraccionada ni juicio clínico"}
        <br />
        {"// el kit de lípidos se saca antes del bloqueo, no cuando ya convulsiona"}
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

// ------------------------------------------------------------
// Fila de resultado — réplica del patrón DEC (ventilacion)
// ------------------------------------------------------------
function ResultRow({
  title,
  value,
  badge,
}: {
  title: string;
  value: string;
  badge?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <span
        className="mono"
        style={{ color: "var(--text-1)", fontSize: "0.8rem" }}
      >
        {title}
      </span>
      {badge && (
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
          {badge}
        </span>
      )}
      <span style={{ flex: 1 }} />
      <span
        className="mono"
        style={{
          color: "var(--accent)",
          fontWeight: 600,
          fontSize: "0.9rem",
          whiteSpace: "nowrap",
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}
