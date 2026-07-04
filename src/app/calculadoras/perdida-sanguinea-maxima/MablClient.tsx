"use client";

// ============================================================
// Pérdida sanguínea máxima permitida (MABL)
//
//   VSE  = peso (kg) × volumen sanguíneo estimado (mL/kg, por población)
//   MABL = VSE × (Hct_inicial − Hct_mínimo) / Hct_inicial
//
// (fórmula clásica de Gross; usa el Hct inicial como denominador.
//  Existe una variante que usa el Hct promedio en el denominador,
//  que da una MABL algo mayor; se muestra como estimación secundaria.)
//
// Volumen sanguíneo estimado (VSE) por población (mL/kg):
//   neonato prematuro 95 · neonato término 85 · lactante 80 ·
//   niño 75 · adulto varón 70 · adulto mujer 65
//
// FUENTES (Vancouver breve):
//   - Gross JB. Estimating allowable blood loss: corrected for
//     dilution. Anesthesiology. 1983;58(3):277-280.  (fórmula MABL)
//   - Nadler SB, Hidalgo JU, Bloch T. Prediction of blood volume in
//     normal human adults. Surgery. 1962;51(2):224-232. (VSE adulto)
//   - Barcelona SL, Thompson AA, Coté CJ. Intraoperative pediatric
//     blood transfusion therapy. Paediatr Anaesth. 2005;15(9):716-726.
//     (VSE pediátrico por edad)
//
// Constantes y umbrales de literatura aceptada. NO inventados.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePatient } from "@/lib/patient/PatientContext";

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
// Poblaciones y su VSE (mL/kg)
// ------------------------------------------------------------
type PopKey =
  | "preterm"
  | "term"
  | "infant"
  | "child"
  | "male"
  | "female";

interface PopDef {
  key: PopKey;
  label: string;
  ebv: number; // mL/kg
  hint: string;
}

const POPULATIONS: PopDef[] = [
  { key: "preterm", label: "Neonato prematuro", ebv: 95, hint: "≈ 95 mL/kg" },
  { key: "term", label: "Neonato a término", ebv: 85, hint: "≈ 85 mL/kg" },
  { key: "infant", label: "Lactante", ebv: 80, hint: "≈ 80 mL/kg" },
  { key: "child", label: "Niño", ebv: 75, hint: "≈ 75 mL/kg" },
  { key: "male", label: "Adulto varón", ebv: 70, hint: "≈ 70 mL/kg" },
  { key: "female", label: "Adulta mujer", ebv: 65, hint: "≈ 65 mL/kg" },
];

const POP_BY_KEY: Record<PopKey, PopDef> = POPULATIONS.reduce(
  (acc, p) => {
    acc[p.key] = p;
    return acc;
  },
  {} as Record<PopKey, PopDef>
);

// ------------------------------------------------------------
// Interpretación de necesidad transfusional
//
// Con la pérdida real (fracción respecto a la MABL) se estima la
// probabilidad de requerir transfusión de concentrado de hematíes:
//   < MABL          → dilución tolerable, transfusión rara vez necesaria
//   ~ MABL          → se alcanza el Hct mínimo aceptable; preparar CH
//   > MABL          → por debajo del Hct mínimo; probable transfusión
//
// ⚠ Las bandas <0.5 / 0.5-1 / ≥1 × MABL son AYUDAS VISUALES arbitrarias
// para colorear el resultado, NO cortes clínicos validados. El corte 0.5
// no proviene de Gross ni de guía alguna; solo separa "holgura amplia" de
// "acercándose". La única transición con base fisiológica es ratio = 1
// (se alcanza el Hct mínimo fijado).
//
// El "gatillo" transfusional es individualizado (Hb ~7 g/dL en el
// paciente estable, más alto con cardiopatía/hipoxia): la MABL guía
// hasta dónde puede caer el Hct antes de tocar el umbral fijado.
// ------------------------------------------------------------
type TxLevel = "safe" | "watch" | "transfuse";

interface TxInterpretation {
  level: TxLevel;
  headline: string;
  detail: string;
  color: string;
}

function interpretLoss(
  actualLoss: number,
  mabl: number
): TxInterpretation {
  const ratio = mabl > 0 ? actualLoss / mabl : 0;

  if (ratio < 0.5) {
    return {
      level: "safe",
      headline: "Pérdida muy por debajo de la MABL",
      detail:
        "La pérdida estimada es menos de la mitad de la MABL. Mantener reposición de cristaloides/coloides según hemodinamia; a este nivel la transfusión rara vez es necesaria (el corte 0.5 es una banda visual orientativa, no un umbral validado).",
      color: "var(--accent)",
    };
  }
  if (ratio < 1) {
    return {
      level: "watch",
      headline: "Acercándose a la MABL — vigilar",
      detail:
        "La pérdida se aproxima al límite calculado. Solicitar/verificar disponibilidad de concentrado de hematíes, controlar Hb/Hct de forma seriada y valorar el gatillo transfusional individual del paciente.",
      color: "var(--amber)",
    };
  }
  return {
    level: "transfuse",
    headline: "Pérdida ≥ MABL — probable transfusión",
    detail:
      "La pérdida iguala o supera la MABL: se estima que el Hct ha caído al mínimo aceptable fijado. Transfusión de concentrado de hematíes probablemente indicada según el gatillo clínico; considerar hemostasia, control de coagulopatía y monitorización estrecha.",
    color: "var(--red)",
  };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function MablClient() {
  // Paciente activo (barra superior): el peso es bidireccional — este campo
  // lee/escribe active.weightKg, así que editarlo aquí actualiza el paciente
  // y todas las demás calculadoras. Para el CÁLCULO del VSE se usa el peso
  // REAL (total): las fórmulas de volumen sanguíneo son mL/kg de peso
  // corporal total, NO peso ideal/magro (por eso derived.real, no useActiveWeight).
  const { active, setActive, derived } = usePatient();

  // Población por defecto ligada al sexo del paciente (solo adultos); el
  // usuario puede pasar a poblaciones pediátricas y eso no toca el paciente.
  const [popKey, setPopKey] = useState<PopKey>(active.sex === "female" ? "female" : "male");
  const [hctInitText, setHctInitText] = useState("");
  const [hctMinText, setHctMinText] = useState("");
  const [lossText, setLossText] = useState(""); // opcional: pérdida real medida

  // Peso desde el contexto (real). Campo controlado por el paciente activo.
  const weightText = active.weightKg != null ? String(active.weightKg) : "";
  const setWeightText = (text: string) =>
    setActive({ weightKg: parseNumber(text) });

  const weight = derived.real;
  const hctInit = useMemo(() => parseNumber(hctInitText), [hctInitText]);
  const hctMin = useMemo(() => parseNumber(hctMinText), [hctMinText]);
  const actualLoss = useMemo(() => parseNumber(lossText), [lossText]);

  const pop = POP_BY_KEY[popKey];

  // Validación de rangos
  const weightValid = weight !== null && weight > 0 && weight <= 300;
  const hctInitValid = hctInit !== null && hctInit > 0 && hctInit <= 65;
  const hctMinValid =
    hctMin !== null && hctMin > 0 && hctMin <= 65;
  const hctOrderValid =
    hctInitValid && hctMinValid && hctMin! < hctInit!;

  // VSE (mL)
  const ebv = useMemo(
    () => (weightValid ? weight! * pop.ebv : null),
    [weight, weightValid, pop.ebv]
  );

  // MABL clásica: VSE × (Hct_i − Hct_min) / Hct_i
  const mabl = useMemo(() => {
    if (ebv === null || !hctOrderValid) return null;
    return (ebv * (hctInit! - hctMin!)) / hctInit!;
  }, [ebv, hctInit, hctMin, hctOrderValid]);

  // MABL variante con Hct promedio en el denominador (estimación 2ª)
  const mablAvg = useMemo(() => {
    if (ebv === null || !hctOrderValid) return null;
    const hctAvg = (hctInit! + hctMin!) / 2;
    if (hctAvg <= 0) return null;
    return (ebv * (hctInit! - hctMin!)) / hctAvg;
  }, [ebv, hctInit, hctMin, hctOrderValid]);

  const lossValid = actualLoss !== null && actualLoss >= 0;

  const interpretation = useMemo(
    () =>
      mabl !== null && lossValid ? interpretLoss(actualLoss!, mabl) : null,
    [mabl, actualLoss, lossValid]
  );

  // Selección de población: si es adulto (varón/mujer) se sincroniza el sexo
  // del paciente activo (bidireccional); las poblaciones pediátricas no tocan
  // el paciente (edad/sexo no se infieren de "lactante"/"niño").
  const selectPop = (key: PopKey) => {
    setPopKey(key);
    if (key === "male" || key === "female") setActive({ sex: key });
  };

  const clearAll = () => {
    // No borra el peso: pertenece al paciente activo compartido.
    setHctInitText("");
    setHctMinText("");
    setLossText("");
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
          <b>$</b> ./mabl.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Pérdida sanguínea máxima permitida
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
          MABL — maximum allowable blood loss · VSE por peso y población
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el campo quirúrgico no lee tu cálculo; mide lo que aspira"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          {/* Población (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Población (VSE)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {POPULATIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => selectPop(p.key)}
                  className="mono"
                  title={p.hint}
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.62rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      p.key === popKey ? "var(--accent)" : "var(--bg-1)",
                    color: p.key === popKey ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.35rem",
              }}
            >
              {`// VSE = ${pop.ebv} mL/kg (${pop.label.toLowerCase()})`}
            </div>
          </div>

          {/* Inputs numéricos */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
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
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.5rem",
                  marginTop: "0.3rem",
                  lineHeight: 1.5,
                }}
              >
                {"// usa el paciente activo (barra superior) · peso real"}
              </div>
            </div>

            {/* Hct inicial */}
            <div>
              <label className="mono" style={labelStyle}>
                Hct inicial (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="42"
                value={hctInitText}
                onChange={(e) => setHctInitText(e.target.value)}
                min={0}
                max={65}
                step="any"
              />
            </div>

            {/* Hct mínimo */}
            <div>
              <label className="mono" style={labelStyle}>
                Hct mínimo (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="30"
                value={hctMinText}
                onChange={(e) => setHctMinText(e.target.value)}
                min={0}
                max={65}
                step="any"
              />
            </div>
          </div>

          {/* Pérdida real medida (opcional) */}
          <div>
            <label className="mono" style={labelStyle}>
              Pérdida estimada actual (mL) — opcional
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="p. ej. 500"
              value={lossText}
              onChange={(e) => setLossText(e.target.value)}
              min={0}
              step="any"
            />
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.35rem",
                lineHeight: 1.6,
              }}
            >
              {"// si la ingresas, se compara con la MABL para estimar necesidad transfusional"}
            </div>
          </div>

          {/* Aviso de orden Hct */}
          {hctInitValid && hctMinValid && !hctOrderValid ? (
            <div
              className="mono"
              style={{
                color: "var(--red)",
                fontSize: "0.6rem",
                lineHeight: 1.6,
              }}
            >
              {"// el Hct mínimo debe ser menor que el Hct inicial"}
            </div>
          ) : null}
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {ebv !== null && mabl !== null ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* VSE + MABL */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              {/* VSE */}
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
                  VSE
                </div>
                <div className="calc-result" style={{ color: "var(--cyan)" }}>
                  {Math.round(ebv)}
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "1rem" }}
                  >
                    {" "}
                    mL
                  </span>
                </div>
              </div>

              {/* MABL */}
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
                  MABL
                </div>
                <div className="calc-result" style={{ color: "var(--accent)" }}>
                  {Math.round(mabl)}
                  <span
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "1rem" }}
                  >
                    {" "}
                    mL
                  </span>
                </div>
              </div>
            </div>

            {/* Desglose de la fórmula */}
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.58rem",
                lineHeight: 1.7,
                textAlign: "center",
              }}
            >
              {`VSE = ${weight} kg × ${pop.ebv} mL/kg = ${Math.round(ebv)} mL`}
              <br />
              {`MABL = ${Math.round(ebv)} × (${hctInit} − ${hctMin}) / ${hctInit} = ${Math.round(mabl)} mL`}
              {mablAvg !== null ? (
                <>
                  <br />
                  <span style={{ opacity: 0.75 }}>
                    {`// variante con Hct promedio en denominador ≈ ${Math.round(mablAvg)} mL`}
                  </span>
                </>
              ) : null}
            </div>

            {/* Interpretación transfusional (si hay pérdida) */}
            {interpretation ? (
              <div
                className="panel"
                style={{
                  borderLeft: `3px solid ${interpretation.color}`,
                  background: "var(--bg-1)",
                }}
              >
                <div className="panel-body" style={{ display: "grid", gap: "0.35rem" }}>
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
                      {`${Math.round(actualLoss!)} / ${Math.round(mabl)} mL (${Math.round((actualLoss! / mabl) * 100)}%)`}
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
            ) : null}
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
          Ingresa peso ({">"}0 kg), Hct inicial y Hct mínimo (con Hct mín {"<"} Hct inicial).
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

      {/* ==================== REFERENCIA: VSE por población ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> VOLUMEN SANGUÍNEO ESTIMADO (VSE)
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
                  {["Población", "VSE (mL/kg)"].map((h) => (
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
                {POPULATIONS.map((p) => (
                  <tr
                    key={p.key}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background:
                        p.key === popKey ? "var(--accent-glow)" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                      }}
                    >
                      {p.label}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--cyan)",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.ebv}
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
          {"// valores medios por peso corporal; en obesidad el VSE/kg es MENOR (≈ 55–60 mL/kg)"}
          <br />
          {"// para el varón adulto algunas fuentes citan 75 mL/kg; aquí se usa 70 (conservador)"}
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
              La MABL estima el volumen de sangre que puede perderse antes de
              alcanzar el <strong>Hct mínimo aceptable</strong> fijado para ese
              paciente; asume reposición isovolémica con líquidos sin hematíes.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              El <strong>gatillo transfusional es individual</strong>: una Hb
              ≈ 7 g/dL suele tolerarse en el paciente estable, pero se eleva ante
              cardiopatía isquémica, hipoxemia o sangrado activo. La MABL orienta,
              no dicta la transfusión.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La fórmula clásica (Hct inicial en el denominador) tiende a{" "}
              <strong>subestimar</strong> la pérdida tolerable frente a la variante
              con Hct promedio; ambas son aproximaciones, no medidas exactas.
            </li>
            <li style={{ marginBottom: "0" }}>
              Reevaluar con <strong>Hb/Hct seriados</strong> y con la pérdida real
              medida (gasas, aspiración, campos): el cálculo teórico no sustituye la
              cuantificación intraoperatoria ni la valoración hemodinámica.
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
        Gross JB. Estimating allowable blood loss: corrected for dilution.
        Anesthesiology. 1983;58(3):277-280.
        <br />
        Nadler SB, Hidalgo JU, Bloch T. Prediction of blood volume in normal human
        adults. Surgery. 1962;51(2):224-232.
        <br />
        Barcelona SL, Thompson AA, Coté CJ. Intraoperative pediatric blood
        transfusion therapy. Paediatr Anaesth. 2005;15(9):716-726.
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
        {"// MABL — estimación teórica de literatura aceptada, no un umbral rígido"}
        <br />
        {"// no sustituye el juicio clínico, la Hb/Hct seriada ni el gatillo transfusional individual"}
        <br />
        {"// la sangre que ya está en el suelo no cuenta en tu fórmula"}
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
