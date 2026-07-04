"use client";

// ============================================================
// STOP-BANG — cribado de apnea obstructiva del sueño (AOS)
//
// 8 ítems sí/no, 1 punto cada uno (rango 0-8):
//   S — Snoring     : ronquido fuerte
//   T — Tiredness   : cansancio/somnolencia diurna
//   O — Observed    : apneas presenciadas
//   P — Pressure    : hipertensión arterial (tratada o no)
//   B — BMI         : IMC > 35 kg/m²
//   A — Age         : edad > 50 años
//   N — Neck        : circunferencia cervical > 40 cm
//   G — Gender      : sexo masculino
//
// Estratificación de riesgo de AOS:
//   0-2  → bajo
//   3-4  → intermedio
//   5-8  → alto
//   ≥3   → punto de corte SENSIBLE para AOS (cribado)
//
// FUENTE (Vancouver breve):
//   Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire:
//   a tool to screen patients for obstructive sleep apnea.
//   Anesthesiology. 2008;108(5):812-821.  (derivación/validación)
//
//   Chung F, Abdullah HR, Liao P. STOP-Bang Questionnaire: a
//   practical approach to screen for obstructive sleep apnea.
//   Chest. 2016;149(3):631-638.  (estratificación 0-2/3-4/5-8)
//
//   Nagappa M, Patra J, Wong J, et al. Association of STOP-Bang
//   with postoperative complications. Anesth Analg.
//   2017;125(4):1301-1308.  (implicaciones perioperatorias)
//
// Umbrales y cortes de literatura aceptada. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Definición de los 8 ítems STOP-BANG
// ------------------------------------------------------------
type ItemKey =
  | "snoring"
  | "tiredness"
  | "observed"
  | "pressure"
  | "bmi"
  | "age"
  | "neck"
  | "gender";

interface ItemDef {
  key: ItemKey;
  letter: string; // letra del acrónimo
  label: string;
  hint: string;
}

const ITEMS: ItemDef[] = [
  {
    key: "snoring",
    letter: "S",
    label: "Ronquido fuerte (Snoring)",
    hint: "más alto que hablar / audible tras puertas cerradas",
  },
  {
    key: "tiredness",
    letter: "T",
    label: "Cansancio diurno (Tiredness)",
    hint: "somnolencia o fatiga frecuente durante el día",
  },
  {
    key: "observed",
    letter: "O",
    label: "Apneas presenciadas (Observed)",
    hint: "alguien ha observado pausas respiratorias al dormir",
  },
  {
    key: "pressure",
    letter: "P",
    label: "Hipertensión arterial (Pressure)",
    hint: "HTA tratada o en tratamiento",
  },
  {
    key: "bmi",
    letter: "B",
    label: "IMC > 35 kg/m² (BMI)",
    hint: "índice de masa corporal mayor de 35",
  },
  {
    key: "age",
    letter: "A",
    label: "Edad > 50 años (Age)",
    hint: "mayor de 50 años",
  },
  {
    key: "neck",
    letter: "N",
    label: "Cuello > 40 cm (Neck)",
    hint: "circunferencia cervical mayor de 40 cm",
  },
  {
    key: "gender",
    letter: "G",
    label: "Sexo masculino (Gender)",
    hint: "sexo masculino",
  },
];

// ------------------------------------------------------------
// Interpretación por puntuación — Chung F, Chest 2016
//   0-2 bajo · 3-4 intermedio · 5-8 alto
//   (≥3 es el corte sensible de cribado de la derivación 2008)
// ------------------------------------------------------------
type RiskLevel = "low" | "intermediate" | "high";

interface Interpretation {
  level: RiskLevel;
  band: string;
  range: string;
  color: string;
  summary: string;
  periop: string; // implicaciones perioperatorias
}

function interpret(score: number): Interpretation {
  if (score <= 2) {
    return {
      level: "low",
      band: "Riesgo bajo de AOS",
      range: "0-2",
      color: "var(--accent)",
      summary:
        "Baja probabilidad de apnea obstructiva del sueño moderada-grave. Cribado negativo por STOP-BANG.",
      periop:
        "Manejo perioperatorio estándar. Mantener vigilancia clínica habitual; el cribado negativo no excluye por completo AOS si la sospecha clínica es alta.",
    };
  }
  if (score <= 4) {
    return {
      level: "intermediate",
      band: "Riesgo intermedio de AOS",
      range: "3-4",
      color: "var(--amber)",
      summary:
        "Probabilidad intermedia de AOS. Cribado positivo (≥3 es el corte sensible). Considerar factores adicionales para reestratificar.",
      periop:
        "Titular opioides y sedantes con cautela (riesgo de depresión respiratoria); preferir analgesia multimodal ahorradora de opioides y regional cuando sea posible. Monitorización de SpO₂ postoperatoria y vigilancia de la vía aérea; considerar estudio del sueño diferido según contexto.",
    };
  }
  return {
    level: "high",
    band: "Riesgo alto de AOS",
    range: "5-8",
    color: "var(--red)",
    summary:
      "Alta probabilidad de AOS moderada-grave. Mayor riesgo de complicaciones perioperatorias respiratorias y cardiovasculares.",
    periop:
      "Optimizar preoperatoriamente; si el paciente usa CPAP, continuarla peri- y postoperatoriamente (traer su equipo). Minimizar opioides (analgesia multimodal/regional), evitar sedación profunda no monitorizada, extubar despierto y en semisentado. Monitorización continua de SpO₂ (capnografía si sedación), plan de vía aérea difícil y cama con vigilancia adecuada; valorar estudio del sueño y manejo por especialista.",
  };
}

// Corte sensible de cribado (derivación Chung 2008)
const SCREEN_CUTOFF = 3;

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function StopBangClient() {
  const [items, setItems] = useState<Record<ItemKey, boolean>>({
    snoring: false,
    tiredness: false,
    observed: false,
    pressure: false,
    bmi: false,
    age: false,
    neck: false,
    gender: false,
  });

  const toggle = (key: ItemKey) =>
    setItems((prev) => ({ ...prev, [key]: !prev[key] }));

  const score = useMemo(
    () => ITEMS.reduce((acc, it) => acc + (items[it.key] ? 1 : 0), 0),
    [items]
  );

  const interpretation = useMemo(() => interpret(score), [score]);
  const positiveScreen = score >= SCREEN_CUTOFF;

  const clearAll = () =>
    setItems({
      snoring: false,
      tiredness: false,
      observed: false,
      pressure: false,
      bmi: false,
      age: false,
      neck: false,
      gender: false,
    });

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./stop-bang.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>STOP-BANG</h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          cribado de apnea obstructiva del sueño (AOS) — 8 ítems
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el paciente que ronca en preop también desatura en postop"}
          </span>
        </p>
      </div>

      {/* ==================== ÍTEMS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ÍTEMS (1 punto c/u)
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
          {ITEMS.map((it) => {
            const active = items[it.key];
            return (
              <button
                key={it.key}
                type="button"
                onClick={() => toggle(it.key)}
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

                {/* Letra del acrónimo */}
                <span
                  className="mono"
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    width: "1.3rem",
                    textAlign: "center",
                    color: active ? "var(--accent)" : "var(--text-3)",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {it.letter}
                </span>

                <span style={{ display: "grid", gap: "0.15rem", flex: 1 }}>
                  <span
                    style={{
                      color: active ? "var(--text-0)" : "var(--text-1)",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {it.label}
                  </span>
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.58rem" }}
                  >
                    {"// " + it.hint}
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
          {/* Score grande */}
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
              Puntuación STOP-BANG
            </div>
            <div className="calc-result" style={{ color: interpretation.color }}>
              {score}
              <span
                className="mono"
                style={{ color: "var(--text-3)", fontSize: "1rem" }}
              >
                {" "}
                / 8
              </span>
            </div>
            <div
              className="mono"
              style={{
                color: positiveScreen ? "var(--amber)" : "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.3rem",
              }}
            >
              {positiveScreen
                ? "// cribado positivo (≥3 = corte sensible para AOS)"
                : "// cribado negativo (por debajo del corte de ≥3)"}
            </div>
          </div>

          {/* Interpretación */}
          <div
            className="panel"
            style={{
              borderLeft: `3px solid ${interpretation.color}`,
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
                  {interpretation.range} pts
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
                {interpretation.summary}
              </p>
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.45rem",
                  marginTop: "0.15rem",
                }}
              >
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: "0.3rem",
                  }}
                >
                  Implicaciones perioperatorias
                </div>
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.76rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {interpretation.periop}
                </p>
              </div>
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
          reiniciar ítems
        </button>
      </div>

      {/* ==================== REFERENCIA: bandas de riesgo ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> BANDAS DE RIESGO (Chung F, Chest 2016)
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
                  {["Puntos", "Riesgo de AOS", "Conducta perioperatoria"].map(
                    (h) => (
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
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    range: "0-2",
                    color: "var(--accent)",
                    interp: "Bajo",
                    action: "Manejo estándar; vigilancia clínica habitual",
                  },
                  {
                    range: "3-4",
                    color: "var(--amber)",
                    interp: "Intermedio",
                    action:
                      "Cautela con opioides/sedantes; monitorizar SpO₂ postop",
                  },
                  {
                    range: "5-8",
                    color: "var(--red)",
                    interp: "Alto",
                    action:
                      "CPAP periop, ahorro de opioides, monitorización continua",
                  },
                ].map((row) => {
                  const isCurrent = row.range === interpretation.range;
                  return (
                    <tr
                      key={row.range}
                      style={{
                        borderTop: "1px solid var(--border)",
                        background: isCurrent
                          ? "var(--accent-glow)"
                          : "transparent",
                      }}
                    >
                      <td
                        className="mono"
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.76rem",
                          color: row.color,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.range}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.76rem",
                          color: "var(--text-0)",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.interp}
                      </td>
                      <td
                        style={{
                          padding: "0.5rem 0.7rem",
                          fontSize: "0.74rem",
                          color: "var(--text-1)",
                        }}
                      >
                        {row.action}
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
          {"// ≥3 = corte sensible de cribado (Chung F, Anesthesiology 2008)"}
          <br />
          {"// a mayor puntuación, mayor probabilidad de AOS moderada-grave"}
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
              STOP-BANG es una herramienta de <strong>cribado</strong>, no
              diagnóstica: un resultado positivo (≥3) obliga a valorar
              polisomnografía o poligrafía respiratoria; el diagnóstico definitivo
              es el estudio del sueño.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              El corte ≥3 es <strong>muy sensible</strong> pero poco específico
              (muchos falsos positivos). Puntuaciones más altos (≥5) o
              combinaciones de STOP ≥2 con sexo masculino, IMC {">"}35 o cuello
              {">"}40 cm aumentan la especificidad para AOS moderada-grave.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              STOP-BANG alto se asocia a <strong>más complicaciones
              perioperatorias</strong> (respiratorias, desaturación, eventos
              cardiovasculares). Extremar la titulación de opioides/sedantes y la
              monitorización postoperatoria.
            </li>
            <li style={{ marginBottom: "0" }}>
              Si el paciente ya usa <strong>CPAP</strong>, debe continuarla en el
              perioperatorio (traer su equipo); no suspenderla por la cirugía salvo
              contraindicación específica.
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
        Chung F, Yegneswaran B, Liao P, et al. STOP questionnaire: a tool to
        screen patients for obstructive sleep apnea. Anesthesiology.
        2008;108(5):812-821.
        <br />
        Chung F, Abdullah HR, Liao P. STOP-Bang Questionnaire: a practical
        approach to screen for obstructive sleep apnea. Chest.
        2016;149(3):631-638.
        <br />
        Nagappa M, Patra J, Wong J, et al. Association of STOP-Bang Questionnaire
        with postoperative complications: a systematic review and meta-analysis.
        Anesth Analg. 2017;125(4):1301-1308.
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
        {"// STOP-BANG — cribado de literatura aceptada, no diagnóstico de AOS"}
        <br />
        {"// no sustituye el estudio del sueño ni el juicio clínico"}
        <br />
        {"// el ronquido no avisa antes de la desaturación en recuperación"}
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
