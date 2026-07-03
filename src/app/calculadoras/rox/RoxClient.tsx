"use client";

// ============================================================
// Índice ROX — predicción de fracaso de CNAF / HFNC
// ROX = (SpO2 / FiO2) / FR
//
// FUENTES (Vancouver breve):
//  - Roca O, Messika J, Caralt B, et al. Predicting success of
//    high-flow nasal cannula in pneumonia patients with hypoxemic
//    respiratory failure: the utility of the ROX index.
//    J Crit Care. 2016;35:200-205.  (derivación)
//  - Roca O, Caralt B, Messika J, et al. An index combining
//    respiratory rate and oxygenation to predict outcome of
//    nasal high-flow therapy. Am J Respir Crit Care Med.
//    2019;199(11):1368-1376.  (validación multicéntrica)
//
// Umbrales tal como los reporta la literatura. NO inventados.
// ============================================================

import { useMemo, useState } from "react";

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
// Normalización de FiO2
// Acepta fracción (0.21–1.0) o porcentaje (21–100).
// Si el valor entra > 1, se interpreta como % y se divide entre 100.
// ------------------------------------------------------------
function normalizeFiO2(raw: number): number {
  return raw > 1 ? raw / 100 : raw;
}

// ------------------------------------------------------------
// Interpretación por umbrales — Roca et al. 2019
//
// Validación (AJRCCM 2019): un ROX >= 4.88 medido a las 2, 6 o 12 h
// se asoció de forma consistente con MENOR riesgo de fracaso de CNAF
// (menor probabilidad de intubación).
//
// Un ROX < 3.85 identificó a los pacientes con MAYOR riesgo de fracaso
// (considerar intubación / no retrasar la vía aérea).
//
// Zona intermedia (3.85–4.88): re-evaluar. El paper propone cortes
// específicos por hora dentro de esta franja para "alerta" de fracaso:
//   2 h  -> ROX < 2.85
//   6 h  -> ROX < 3.47
//   12 h -> ROX < 3.85
// (por debajo de esos cortes horarios: riesgo elevado de fracaso).
// ------------------------------------------------------------

type Timepoint = "2" | "6" | "12";

const TIMEPOINT_LABEL: Record<Timepoint, string> = {
  "2": "2 horas",
  "6": "6 horas",
  "12": "12 horas",
};
const TIMEPOINT_ORDER: Timepoint[] = ["2", "6", "12"];

// corte de "alerta de fracaso" específico por hora (franja intermedia)
const HOURLY_ALERT_CUTOFF: Record<Timepoint, number> = {
  "2": 2.85,
  "6": 3.47,
  "12": 3.85,
};

type RiskLevel = "low" | "intermediate" | "high";

interface Interpretation {
  level: RiskLevel;
  headline: string;
  detail: string;
  color: string;
}

function interpret(rox: number, tp: Timepoint): Interpretation {
  // Umbral general de bajo riesgo (validado a 2, 6 y 12 h)
  if (rox >= 4.88) {
    return {
      level: "low",
      headline: "Bajo riesgo de fracaso de CNAF",
      detail:
        "ROX ≥ 4.88: menor probabilidad de necesitar intubación. Continuar CNAF con reevaluación seriada.",
      color: "var(--accent)",
    };
  }

  // Alto riesgo: corte de fracaso ESPECÍFICO por hora (Roca 2019).
  // 2 h < 2.85 · 6 h < 3.47 · 12 h < 3.85. (No es un 3.85 universal.)
  const cutoff = HOURLY_ALERT_CUTOFF[tp];
  if (rox < cutoff) {
    return {
      level: "high",
      headline: "Alto riesgo de fracaso de CNAF",
      detail: `ROX ${rox.toFixed(2)} por debajo del corte de fracaso a las ${TIMEPOINT_LABEL[tp]} (${cutoff.toFixed(2)}): mayor probabilidad de fracaso. Considerar intubación / no retrasar la vía aérea; vigilancia estrecha.`,
      color: "var(--red)",
    };
  }

  // Zona intermedia: entre el corte horario y 4.88 → reevaluar tendencia.
  return {
    level: "intermediate",
    headline: "Zona intermedia — reevaluar",
    detail: `ROX ${rox.toFixed(2)} entre el corte de las ${TIMEPOINT_LABEL[tp]} (${cutoff.toFixed(2)}) y 4.88: aún no alcanza el umbral de bajo riesgo. Repetir el índice en 1–2 h para ver la tendencia.`,
    color: "var(--amber)",
  };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function RoxClient() {
  const [spo2Text, setSpo2Text] = useState("");
  const [fio2Text, setFio2Text] = useState("");
  const [frText, setFrText] = useState("");
  const [timepoint, setTimepoint] = useState<Timepoint>("12");

  const spo2 = useMemo(() => parseNumber(spo2Text), [spo2Text]);
  const fio2Raw = useMemo(() => parseNumber(fio2Text), [fio2Text]);
  const fr = useMemo(() => parseNumber(frText), [frText]);

  // FiO2 normalizada (fracción 0.21–1.0)
  const fio2 = useMemo(
    () => (fio2Raw !== null && fio2Raw > 0 ? normalizeFiO2(fio2Raw) : null),
    [fio2Raw]
  );

  // Validación de rangos fisiológicos
  const spo2Valid = spo2 !== null && spo2 > 0 && spo2 <= 100;
  const fio2Valid = fio2 !== null && fio2 >= 0.21 && fio2 <= 1.0;
  const frValid = fr !== null && fr > 0;

  const rox = useMemo(() => {
    if (!spo2Valid || !fio2Valid || !frValid || fio2 === null) return null;
    // ROX = (SpO2 / FiO2) / FR
    return spo2! / fio2 / fr!;
  }, [spo2, fio2, fr, spo2Valid, fio2Valid, frValid]);

  const spo2FractionOfFio2 = useMemo(() => {
    if (spo2 === null || fio2 === null || fio2 <= 0) return null;
    return spo2 / fio2;
  }, [spo2, fio2]);

  const interpretation = useMemo(
    () => (rox !== null ? interpret(rox, timepoint) : null),
    [rox, timepoint]
  );

  const clearAll = () => {
    setSpo2Text("");
    setFio2Text("");
    setFrText("");
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
          <b>$</b> ./rox.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Índice ROX</h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          predicción de fracaso de cánula nasal de alto flujo (CNAF / HFNC)
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// un número no intuba a nadie; la clínica sí"}
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
            }}
          >
            {/* SpO2 */}
            <div>
              <label className="mono" style={labelStyle}>
                SpO₂ (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="92"
                value={spo2Text}
                onChange={(e) => setSpo2Text(e.target.value)}
                min={0}
                max={100}
                step="any"
              />
            </div>

            {/* FiO2 */}
            <div>
              <label className="mono" style={labelStyle}>
                FiO₂
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="0.50"
                value={fio2Text}
                onChange={(e) => setFio2Text(e.target.value)}
                min={0}
                step="any"
              />
            </div>

            {/* FR */}
            <div>
              <label className="mono" style={labelStyle}>
                FR (rpm)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="28"
                value={frText}
                onChange={(e) => setFrText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
          </div>

          {/* Nota FiO2 */}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}
          >
            {"// FiO₂ admite fracción (0.21–1.0) o porcentaje (21–100); >1 se interpreta como %"}
            {fio2Raw !== null && fio2Raw > 0 && fio2 !== null ? (
              <>
                <br />
                {`// FiO₂ interpretada = ${fio2.toFixed(2)}`}
              </>
            ) : null}
          </div>

          {/* Hora de terapia (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Hora de terapia CNAF
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {TIMEPOINT_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimepoint(t)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: t === timepoint ? "var(--accent)" : "var(--bg-1)",
                    color: t === timepoint ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {TIMEPOINT_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {rox !== null && interpretation ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* Valor ROX grande */}
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
                Índice ROX
              </div>
              <div className="calc-result" style={{ color: interpretation.color }}>
                {rox.toFixed(2)}
              </div>
              <div
                className="mono"
                style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem" }}
              >
                {spo2FractionOfFio2 !== null
                  ? `(SpO₂/FiO₂ = ${spo2FractionOfFio2.toFixed(0)}) / FR ${fr} = ${rox.toFixed(2)}`
                  : null}
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
              <div
                className="panel-body"
                style={{ display: "grid", gap: "0.3rem" }}
              >
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
                    {interpretation.headline}
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
                    @ {TIMEPOINT_LABEL[timepoint]}
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
                  {interpretation.detail}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Hint si faltan / son inválidos los inputs */
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
          Ingresa SpO₂ (1–100 %), FiO₂ (0.21–1.0) y FR ({">"}0 rpm) para calcular.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// datos fuera de rango fisiológico no computan"}
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

      {/* ==================== REFERENCIA: umbrales ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> UMBRALES (Roca et al. 2019)
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
                  {["ROX", "Interpretación", "Conducta"].map((h) => (
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
                  {
                    rox: "≥ 4.88",
                    color: "var(--accent)",
                    interp: "Bajo riesgo de fracaso",
                    action: "Continuar CNAF; reevaluar seriadamente",
                  },
                  {
                    rox: "3.85 – 4.88",
                    color: "var(--amber)",
                    interp: "Zona intermedia",
                    action: "Repetir índice en 1–2 h; vigilar tendencia",
                  },
                  {
                    rox: "< 3.85",
                    color: "var(--red)",
                    interp: "Alto riesgo de fracaso",
                    action: "Considerar intubación; no retrasar vía aérea",
                  },
                ].map((row) => (
                  <tr
                    key={row.rox}
                    style={{ borderTop: "1px solid var(--border)" }}
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
                      {row.rox}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================== REFERENCIA: cortes horarios ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CORTES DE ALERTA POR HORA (franja intermedia)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 360,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Hora de CNAF", "ROX de alerta de fracaso"].map((h) => (
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
                {TIMEPOINT_ORDER.map((t) => (
                  <tr key={t} style={{ borderTop: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                      }}
                    >
                      {TIMEPOINT_LABEL[t]}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--amber)",
                        fontWeight: 700,
                      }}
                    >
                      {"< "}
                      {HOURLY_ALERT_CUTOFF[t].toFixed(2)}
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
          {"// dentro de la franja 3.85–4.88, estar por debajo del corte horario"}
          <br />
          {"// aumenta la probabilidad de fracaso de CNAF en la validación 2019"}
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
              El ROX combina oxigenación (SpO₂/FiO₂) y frecuencia respiratoria en
              un solo número; valores más altos = mejor pronóstico bajo CNAF.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Interpretar de forma <strong>seriada</strong> (2, 6 y 12 h) y por su{" "}
              <strong>tendencia</strong>: un ROX que no mejora o desciende es tan
              informativo como un valor absoluto bajo.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Derivado y validado en <strong>neumonía con insuficiencia
              respiratoria hipoxémica</strong>. Su rendimiento en otras etiologías
              (EPOC hipercápnico, edema pulmonar, COVID-19) es variable; usar con
              cautela fuera de la población original.
            </li>
            <li style={{ marginBottom: "0" }}>
              No sustituye la valoración global: trabajo respiratorio, estado
              mental, hemodinamia, gasometría y curso temporal mandan sobre el
              número.
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
        Roca O, Messika J, Caralt B, et al. Predicting success of high-flow nasal
        cannula in pneumonia patients with hypoxemic respiratory failure: the
        utility of the ROX index. J Crit Care. 2016;35:200-205.
        <br />
        Roca O, Caralt B, Messika J, et al. An index combining respiratory rate
        and oxygenation to predict outcome of nasal high-flow therapy. Am J Respir
        Crit Care Med. 2019;199(11):1368-1376.
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
        {"// índice ROX — umbrales de literatura aceptada, no reglas absolutas"}
        <br />
        {"// no sustituye el juicio clínico, la monitorización ni la gasometría"}
        <br />
        {"// el ventilador no espera a que termines de calcular"}
      </p>
    </div>
  );
}
