"use client";

// ============================================================
// Equianalgesia de opioides — calculadora clínica DEC
// Conversión de dosis entre opioides y vías (oral / parenteral).
//
// MODELO DE CÁLCULO
//  Todo se ancla a "morfina parenteral (IV/SC/IM) equivalente".
//  Cada opioide tiene un factor que expresa cuántos mg de morfina
//  PARENTERAL equivalen a 1 unidad del fármaco por esa vía.
//    dosis_origen → morfina parenteral eq. → dosis_destino
//
// EXACTITUD CLÍNICA (app de alta precisión): los ratios provienen
// de tablas equianalgésicas de literatura aceptada. Son APROXIMADOS
// y con rangos amplios en la práctica; se ofrecen como punto de
// partida, NO como dosis prescriptiva. La metadona NO es lineal.
//
// FUENTES (Vancouver breve):
//  - McPherson ML. Demystifying Opioid Conversion Calculations:
//    A Guide for Effective Dosing. 2.ª ed. ASHP; 2018.
//  - Portenoy RK, Mehta Z, Ahmed E. Cancer pain management with
//    opioids: Optimizing analgesia. UpToDate; 2024 (tabla de
//    dosis equianalgésicas).
//  - Faculty of Pain Medicine (FPM, RCoA). Opioids Aware —
//    Dose equivalents and changing opioids. Londres; 2024.
//  - Twycross R, Wilcock A. Palliative Care Formulary (PCF).
//    (relación metadona dependiente de la dosis previa).
//  - Nota morfina PO:parenteral 3:1 (dosis repetidas) — estándar
//    de cuidados paliativos; en dosis única aguda se cita ~2–3:1.
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
// Vías disponibles
// ------------------------------------------------------------
type Route = "oral" | "parenteral";
const ROUTE_LABEL: Record<Route, string> = {
  oral: "Oral (PO)",
  parenteral: "Parenteral (IV/SC/IM)",
};

// ------------------------------------------------------------
// Definición de opioides
//
// morphineParenteralEq[route] = mg de MORFINA PARENTERAL equivalentes
//   a 1 UNIDAD (mg salvo indicado) del fármaco administrado por esa vía.
//
// Anclas de la tabla (morfina parenteral 10 mg como referencia clásica):
//   - morfina parenteral 10 mg  ≡ 10 mg morfina parenteral (factor 1.0)
//   - morfina oral 30 mg        ≡ 10 mg morfina parenteral (PO:parenteral 3:1)
//       ⇒ 1 mg morfina oral = 10/30 = 0.333 mg morfina parenteral
//   - fentanilo parenteral 0.1 mg (100 mcg) ≡ 10 mg morfina parenteral
//       ⇒ 1 mcg fentanilo = 0.1 mg morfina parenteral
//   - hidromorfona parenteral 1.5 mg ≡ 10 mg morfina parenteral (factor 6.67)
//   - hidromorfona oral 7.5 mg ≡ 30 mg morfina oral ≡ 10 mg parenteral
//       ⇒ 1 mg HM oral = 10/7.5 = 1.333 mg morfina parenteral
//   - oxicodona oral 20 mg ≡ 30 mg morfina oral ≡ 10 mg parenteral
//       ⇒ 1 mg oxicodona oral = 10/20 = 0.5 mg morfina parenteral
//   - oximorfona oral 10 mg ≡ 30 mg morfina oral
//       ⇒ 1 mg oximorfona oral = 10/10 = 1.0 mg morfina parenteral
//   - oximorfona parenteral 1 mg ≡ 10 mg morfina parenteral (factor 10)
//   - hidrocodona oral 30 mg ≈ 30 mg morfina oral (≈ 1:1) ⇒ 0.333
//   - codeína oral 200 mg ≡ 30 mg morfina oral ⇒ 10/200 = 0.05
//   - tramadol oral: ratio muy variable; aprox 1/10 de la morfina oral
//       ⇒ tramadol oral 300 mg ≈ 30 mg morfina oral ⇒ 10/300 = 0.0333
//   - tapentadol oral: aprox tapentadol:morfina oral ~ 2.5–3.3 : 1
//       ⇒ tapentadol 100 mg ≈ 30 mg morfina oral ⇒ 10/100 = 0.10
//
// El "unit" indica la unidad de dosis natural del fármaco (mg o mcg).
// ------------------------------------------------------------

type OpioidId =
  | "morphine"
  | "hydromorphone"
  | "oxycodone"
  | "oxymorphone"
  | "hydrocodone"
  | "fentanyl"
  | "codeine"
  | "tramadol"
  | "tapentadol"
  | "methadone";

interface OpioidDef {
  id: OpioidId;
  name: string;
  unit: "mg" | "mcg";
  // Factor por vía: mg morfina parenteral por 1 unidad del fármaco.
  // null = esa vía no se ofrece para este fármaco.
  morphineParenteralEq: Partial<Record<Route, number>>;
  // Si es true, la conversión NO es lineal y se bloquea el resultado
  // numérico (se muestra advertencia y guía cualitativa).
  nonlinear?: boolean;
  note?: string;
}

// Factores derivados de las anclas comentadas arriba.
const OPIOIDS: OpioidDef[] = [
  {
    id: "morphine",
    name: "Morfina",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 30, parenteral: 1.0 },
  },
  {
    id: "hydromorphone",
    name: "Hidromorfona",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 7.5, parenteral: 10 / 1.5 },
  },
  {
    id: "oxycodone",
    name: "Oxicodona",
    unit: "mg",
    // sólo oral en la mayoría de mercados de referencia
    morphineParenteralEq: { oral: 10 / 20 },
  },
  {
    id: "oxymorphone",
    name: "Oximorfona",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 10, parenteral: 10 / 1 },
  },
  {
    id: "hydrocodone",
    name: "Hidrocodona",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 30 },
  },
  {
    id: "fentanyl",
    name: "Fentanilo",
    unit: "mcg",
    // 100 mcg parenteral ≡ 10 mg morfina parenteral ⇒ 0.1 mg/mcg
    morphineParenteralEq: { parenteral: 0.1 },
    note:
      "Parenteral en bolo. Los PARCHES transdérmicos de fentanilo NO se calculan aquí: usan tablas de conversión propias y estado estacionario.",
  },
  {
    id: "codeine",
    name: "Codeína",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 200 },
  },
  {
    id: "tramadol",
    name: "Tramadol",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 300 },
    note:
      "Ratio muy variable (metabolismo CYP2D6, efecto dual). Estimación conservadora ~10:1 tramadol:morfina oral.",
  },
  {
    id: "tapentadol",
    name: "Tapentadol",
    unit: "mg",
    morphineParenteralEq: { oral: 10 / 100 },
    note: "Conversión aproximada; evidencia limitada. Verificar clínicamente.",
  },
  {
    id: "methadone",
    name: "Metadona",
    unit: "mg",
    // NO lineal — se bloquea el cálculo numérico a propósito.
    morphineParenteralEq: {},
    nonlinear: true,
    note:
      "Relación con morfina DEPENDIENTE de la dosis previa (no lineal) y con vida media larga/variable. Requiere protocolo específico y experiencia.",
  },
];

const OPIOID_BY_ID: Record<OpioidId, OpioidDef> = OPIOIDS.reduce(
  (acc, o) => {
    acc[o.id] = o;
    return acc;
  },
  {} as Record<OpioidId, OpioidDef>
);

// ------------------------------------------------------------
// Tolerancia cruzada incompleta
// Al rotar de opioide, la tolerancia no se transfiere por completo;
// se REDUCE la dosis calculada 25–50 % por seguridad (mayor reducción
// a dosis altas o pacientes frágiles). Referencia: UpToDate; FPM;
// McPherson. Convención: reducir el equianalgésico teórico.
// ------------------------------------------------------------
type ReductionPct = 0 | 25 | 33 | 50;
const REDUCTION_OPTIONS: { value: ReductionPct; label: string; note: string }[] =
  [
    { value: 25, label: "25 %", note: "reducción mínima habitual" },
    { value: 33, label: "33 %", note: "intermedia" },
    { value: 50, label: "50 %", note: "conservadora / dosis altas / frágil" },
    { value: 0, label: "0 %", note: "sin reducción — sólo comparación teórica" },
  ];

// ------------------------------------------------------------
// Resultado del cálculo
// ------------------------------------------------------------
interface CalcResult {
  morphineParenteralEq: number; // mg morfina parenteral eq. de la dosis origen
  theoreticalDose: number; // dosis destino equianalgésica teórica (sin reducir)
  reducedLow: number; // dosis destino tras aplicar reducción (rango bajo)
  reducedHigh: number; // dosis destino tras reducción menor (rango alto)
  destUnit: "mg" | "mcg";
}

function computeConversion(
  source: OpioidDef,
  sourceRoute: Route,
  dose: number,
  dest: OpioidDef,
  destRoute: Route,
  reduction: ReductionPct
): CalcResult | null {
  const srcFactor = source.morphineParenteralEq[sourceRoute];
  const dstFactor = dest.morphineParenteralEq[destRoute];
  if (srcFactor === undefined || dstFactor === undefined) return null;
  if (dstFactor <= 0) return null;

  // 1) dosis origen → morfina parenteral equivalente
  const morphineEq = dose * srcFactor;

  // 2) morfina parenteral eq. → dosis destino (unidades del destino)
  const theoretical = morphineEq / dstFactor;

  // 3) reducción por tolerancia cruzada incompleta.
  // reducedLow: aplica la reducción elegida (dosis más conservadora).
  // reducedHigh: rango superior = mínimo del rango 25 % cuando se pidió
  //   una reducción mayor; si la reducción es 25 % o 0 %, ambos coinciden.
  const reducedLow = theoretical * (1 - reduction / 100);
  const highReductionPct = reduction >= 25 ? 25 : reduction;
  const reducedHigh = theoretical * (1 - highReductionPct / 100);

  return {
    morphineParenteralEq: morphineEq,
    theoreticalDose: theoretical,
    reducedLow,
    reducedHigh,
    destUnit: dest.unit,
  };
}

// ------------------------------------------------------------
// Formato de dosis según la unidad (mg vs mcg)
// ------------------------------------------------------------
function fmtDose(value: number, unit: "mg" | "mcg"): string {
  if (unit === "mcg") {
    // mcg: redondeo a entero salvo valores muy pequeños
    if (value < 10) return `${value.toFixed(1)} mcg`;
    return `${Math.round(value)} mcg`;
  }
  // mg: 1 decimal si < 10, entero si mayor pero mostrando .5
  if (value < 1) return `${value.toFixed(2)} mg`;
  if (value < 10) return `${value.toFixed(1)} mg`;
  return `${value.toFixed(1)} mg`;
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function EquianalgesiaClient() {
  const [sourceId, setSourceId] = useState<OpioidId>("morphine");
  const [sourceRoute, setSourceRoute] = useState<Route>("parenteral");
  const [doseText, setDoseText] = useState("");
  const [destId, setDestId] = useState<OpioidId>("hydromorphone");
  const [destRoute, setDestRoute] = useState<Route>("oral");
  const [reduction, setReduction] = useState<ReductionPct>(25);

  const source = OPIOID_BY_ID[sourceId];
  const dest = OPIOID_BY_ID[destId];
  const dose = useMemo(() => parseNumber(doseText), [doseText]);

  // Vías realmente disponibles para cada fármaco
  const sourceRoutes = useMemo(
    () => (Object.keys(source.morphineParenteralEq) as Route[]),
    [source]
  );
  const destRoutes = useMemo(
    () => (Object.keys(dest.morphineParenteralEq) as Route[]),
    [dest]
  );

  // Corrige la vía si el fármaco seleccionado no la soporta
  const effectiveSourceRoute: Route | null = source.nonlinear
    ? sourceRoute // metadona: se maneja aparte
    : sourceRoutes.includes(sourceRoute)
    ? sourceRoute
    : sourceRoutes[0] ?? null;
  const effectiveDestRoute: Route | null = dest.nonlinear
    ? destRoute
    : destRoutes.includes(destRoute)
    ? destRoute
    : destRoutes[0] ?? null;

  const methadoneInvolved = source.nonlinear || dest.nonlinear;

  const result = useMemo(() => {
    if (methadoneInvolved) return null;
    if (dose === null || !(dose > 0)) return null;
    if (effectiveSourceRoute === null || effectiveDestRoute === null)
      return null;
    return computeConversion(
      source,
      effectiveSourceRoute,
      dose,
      dest,
      effectiveDestRoute,
      reduction
    );
  }, [
    methadoneInvolved,
    dose,
    source,
    dest,
    effectiveSourceRoute,
    effectiveDestRoute,
    reduction,
  ]);

  const clearAll = () => {
    setDoseText("");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const reductionActive = REDUCTION_OPTIONS.find((r) => r.value === reduction)!;

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./equianalgesia.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Equianalgesia de opioides
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
          conversión de dosis entre opioides y vías · ajuste por tolerancia
          cruzada incompleta
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// la tabla equianalgésica es un mapa, no el territorio"}
          </span>
        </p>
      </div>

      {/* ==================== ADVERTENCIA GLOBAL ==================== */}
      <div
        className="panel"
        style={{
          borderLeft: "3px solid var(--red)",
          marginBottom: "1rem",
        }}
      >
        <div
          className="panel-body"
          style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
        >
          <span style={{ color: "var(--red)", fontSize: "0.9rem" }}>⛔</span>
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.72rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Las dosis equianalgésicas son <strong>aproximadas</strong> y con
            variabilidad interindividual amplia. NO usar en pacientes{" "}
            <strong>vírgenes de opioides</strong> (no tolerantes): esta
            herramienta asume tolerancia previa y rota de un opioide a otro.
            Tras rotar, <strong>titular</strong> según respuesta y disponer
            siempre de dosis de rescate y monitorización.
          </p>
        </div>
      </div>

      {/* ==================== ORIGEN ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> OPIOIDE DE ORIGEN
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Fármaco origen */}
            <div>
              <label className="mono" style={labelStyle}>
                Fármaco
              </label>
              <select
                className="calc-select mono"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value as OpioidId)}
              >
                {OPIOIDS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vía origen */}
            <div>
              <label className="mono" style={labelStyle}>
                Vía
              </label>
              <select
                className="calc-select mono"
                value={effectiveSourceRoute ?? ""}
                onChange={(e) => setSourceRoute(e.target.value as Route)}
                disabled={source.nonlinear}
              >
                {(source.nonlinear
                  ? (["oral", "parenteral"] as Route[])
                  : sourceRoutes
                ).map((r) => (
                  <option key={r} value={r}>
                    {ROUTE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dosis */}
          <div>
            <label className="mono" style={labelStyle}>
              Dosis actual ({source.unit})
              <span style={{ opacity: 0.5, textTransform: "none" }}>
                {" "}
                — total en 24 h o por toma, sé consistente
              </span>
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder={source.unit === "mcg" ? "100" : "10"}
              value={doseText}
              onChange={(e) => setDoseText(e.target.value)}
              min={0}
              step="any"
            />
          </div>

          {source.note ? (
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                lineHeight: 1.6,
              }}
            >
              {`// ${source.note}`}
            </div>
          ) : null}
        </div>
      </div>

      {/* ==================== DESTINO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> OPIOIDE DE DESTINO
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Fármaco destino */}
            <div>
              <label className="mono" style={labelStyle}>
                Fármaco
              </label>
              <select
                className="calc-select mono"
                value={destId}
                onChange={(e) => setDestId(e.target.value as OpioidId)}
              >
                {OPIOIDS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vía destino */}
            <div>
              <label className="mono" style={labelStyle}>
                Vía
              </label>
              <select
                className="calc-select mono"
                value={effectiveDestRoute ?? ""}
                onChange={(e) => setDestRoute(e.target.value as Route)}
                disabled={dest.nonlinear}
              >
                {(dest.nonlinear
                  ? (["oral", "parenteral"] as Route[])
                  : destRoutes
                ).map((r) => (
                  <option key={r} value={r}>
                    {ROUTE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {dest.note ? (
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                lineHeight: 1.6,
              }}
            >
              {`// ${dest.note}`}
            </div>
          ) : null}

          {/* Reducción por tolerancia cruzada incompleta */}
          <div>
            <label className="mono" style={labelStyle}>
              Reducción por tolerancia cruzada incompleta
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {REDUCTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setReduction(opt.value)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      opt.value === reduction ? "var(--accent)" : "var(--bg-1)",
                    color: opt.value === reduction ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.35rem",
                lineHeight: 1.6,
              }}
            >
              {`// ${reductionActive.note}`}
              <br />
              {"// estándar de rotación: reducir 25–50 % la dosis equianalgésica calculada"}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {methadoneInvolved ? (
        /* Bloque especial metadona — no lineal, no se da número */
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> METADONA — CONVERSIÓN NO LINEAL
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
            <div
              className="panel"
              style={{
                borderLeft: "3px solid var(--red)",
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
                <span style={{ color: "var(--red)", fontSize: "0.9rem" }}>
                  ⛔
                </span>
                <p
                  style={{
                    color: "var(--text-1)",
                    fontSize: "0.75rem",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  La equivalencia de la <strong>metadona</strong> NO es lineal:
                  la relación con la morfina{" "}
                  <strong>depende de la dosis previa</strong> (a mayor dosis de
                  morfina, más potente resulta la metadona por mg). Además tiene
                  vida media larga y variable, riesgo de acumulación y de
                  prolongación del QT. Esta calculadora{" "}
                  <strong>no devuelve una cifra</strong> para la metadona a
                  propósito.
                </p>
              </div>
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                color: "var(--text-1)",
                fontSize: "0.74rem",
                lineHeight: 1.7,
              }}
            >
              <li style={{ marginBottom: "0.4rem" }}>
                La relación morfina oral : metadona oral aumenta con la dosis
                de morfina: aprox. <strong>4:1</strong> a dosis bajas hasta{" "}
                <strong>10:1 o 20:1</strong> (o más) a dosis altas de morfina
                oral (p. ej. &gt; 300–1000 mg/día).
              </li>
              <li style={{ marginBottom: "0.4rem" }}>
                Usar un <strong>protocolo específico</strong> de rotación a
                metadona (p. ej. stop-and-go o titulación gradual) supervisado
                por clínico con experiencia en dolor/paliativos.
              </li>
              <li style={{ marginBottom: "0" }}>
                Vigilar sedación, depresión respiratoria diferida y ECG (QTc)
                antes y durante el ajuste.
              </li>
            </ul>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                lineHeight: 1.6,
              }}
            >
              {"// la metadona perdona menos errores que la mayoría de los opioides"}
            </div>
          </div>
        </div>
      ) : result ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> DOSIS EQUIANALGÉSICA ESTIMADA
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* Resumen conversión */}
            <div
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.68rem",
                lineHeight: 1.6,
                textAlign: "center",
              }}
            >
              {`${fmtDose(dose ?? 0, source.unit)} ${source.name} ${
                effectiveSourceRoute ? ROUTE_LABEL[effectiveSourceRoute] : ""
              }`}
              <br />
              <span style={{ color: "var(--text-3)" }}>↓</span>
              <br />
              {`${dest.name} ${
                effectiveDestRoute ? ROUTE_LABEL[effectiveDestRoute] : ""
              }`}
            </div>

            {/* Dosis destino (grande) — tras reducción */}
            <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
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
                Dosis inicial sugerida (reducción {reduction} %)
              </div>
              <div className="calc-result" style={{ color: "var(--accent)" }}>
                {fmtDose(result.reducedLow, result.destUnit)}
              </div>
              {reduction >= 25 ? (
                <div
                  className="mono"
                  style={{
                    color: "var(--text-2)",
                    fontSize: "0.62rem",
                    marginTop: "0.35rem",
                  }}
                >
                  rango tras reducción 25–{reduction} %:{" "}
                  {fmtDose(result.reducedLow, result.destUnit)} –{" "}
                  {fmtDose(result.reducedHigh, result.destUnit)}
                </div>
              ) : null}
            </div>

            {/* Desglose */}
            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "0.6rem",
                display: "grid",
                gap: "0.5rem",
              }}
            >
              <ResultRow
                title="Equianalgésico teórico"
                value={fmtDose(result.theoreticalDose, result.destUnit)}
                badge="sin reducir"
              />
              <ResultRow
                title="Morfina parenteral eq."
                value={`${result.morphineParenteralEq.toFixed(1)} mg`}
                badge="ancla del cálculo"
              />
            </div>

            {/* Nota de titulación */}
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
                <span style={{ color: "var(--amber)", fontSize: "0.85rem" }}>
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
                  Cifra de <strong>inicio</strong>, no de mantenimiento.
                  Redondear a presentaciones disponibles, repartir en las tomas
                  correspondientes, pautar <strong>rescate</strong> (≈ 10–15 %
                  de la dosis diaria) y reevaluar analgesia y sedación en las
                  primeras horas.
                </p>
              </div>
            </div>
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
          Ingresa una dosis ({">"}0 {source.unit}) para calcular la conversión.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin dosis no hay equivalencia que reducir"}
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
          limpiar dosis
        </button>
      </div>

      {/* ==================== TABLA EQUIANALGÉSICA ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> TABLA EQUIANALGÉSICA (referencia)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 480,
              }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Opioide", "Dosis parenteral", "Dosis oral"].map((h) => (
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
                {EQUI_TABLE.map((row) => (
                  <tr
                    key={row.name}
                    style={{ borderTop: "1px solid var(--border)" }}
                  >
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                      }}
                    >
                      {row.name}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.74rem",
                        color: "var(--cyan)",
                      }}
                    >
                      {row.parenteral}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.74rem",
                        color: "var(--text-1)",
                      }}
                    >
                      {row.oral}
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
          {"// cada fila es aproximadamente equianalgésica: ~10 mg de morfina parenteral"}
          <br />
          {"// morfina PO:parenteral 3:1 en dosis repetidas · fentanilo 100 mcg IV ≈ 10 mg morfina IV"}
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
              Las tablas equianalgésicas se derivaron de estudios de dosis única
              en poblaciones concretas; en dosis repetidas y crónicas los ratios
              varían. Trata el resultado como un{" "}
              <strong>punto de partida</strong>.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Aplica siempre la <strong>reducción por tolerancia cruzada
              incompleta</strong> (25–50 %) al rotar de opioide; mayor reducción
              a dosis altas, ancianos, insuficiencia renal/hepática o fragilidad.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La <strong>metadona</strong> y los{" "}
              <strong>parches transdérmicos</strong> de fentanilo/buprenorfina
              requieren tablas y protocolos propios; no se resuelven con una
              regla de tres lineal.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Sé consistente con el <strong>marco temporal</strong> de la dosis
              (total diario vs por toma): la conversión conserva las unidades que
              introduzcas.
            </li>
            <li style={{ marginBottom: "0" }}>
              Pauta <strong>rescate</strong>, revisa comorbilidades y fármacos
              (benzodiacepinas, gabapentinoides) y considera disponer de
              naloxona según contexto.
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
        McPherson ML. Demystifying Opioid Conversion Calculations: A Guide for
        Effective Dosing. 2.ª ed. Bethesda: ASHP; 2018.
        <br />
        Portenoy RK, Mehta Z, Ahmed E. Cancer pain management with opioids:
        Optimizing analgesia. UpToDate; 2024 (tabla de dosis equianalgésicas).
        <br />
        Faculty of Pain Medicine (RCoA). Opioids Aware — Dose equivalents and
        changing opioids. Londres; 2024.
        <br />
        Twycross R, Wilcock A, eds. Palliative Care Formulary (PCF). (relación
        metadona dependiente de la dosis previa).
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
        {"// ratios de literatura aceptada — aproximados, nunca prescriptivos"}
        <br />
        {"// no para pacientes vírgenes de opioides; titula y monitoriza siempre"}
        <br />
        {"// el equianalgésico calcula; el paciente decide si le sirve"}
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
// Tabla equianalgésica de referencia (~10 mg morfina parenteral / fila)
// Valores de literatura aceptada (McPherson; UpToDate; FPM).
// ------------------------------------------------------------
interface EquiRow {
  name: string;
  parenteral: string;
  oral: string;
}
const EQUI_TABLE: EquiRow[] = [
  { name: "Morfina", parenteral: "10 mg", oral: "30 mg" },
  { name: "Hidromorfona", parenteral: "1.5 mg", oral: "7.5 mg" },
  { name: "Oximorfona", parenteral: "1 mg", oral: "10 mg" },
  { name: "Oxicodona", parenteral: "—", oral: "20 mg" },
  { name: "Hidrocodona", parenteral: "—", oral: "≈ 30 mg" },
  { name: "Fentanilo", parenteral: "100 mcg", oral: "—" },
  { name: "Codeína", parenteral: "≈ 120 mg", oral: "200 mg" },
  { name: "Tramadol", parenteral: "≈ 100 mg", oral: "≈ 300 mg (variable)" },
  { name: "Tapentadol", parenteral: "—", oral: "≈ 100 mg (aprox.)" },
  { name: "Metadona", parenteral: "no lineal", oral: "no lineal" },
];

// ------------------------------------------------------------
// Fila de resultado — réplica del patrón DEC (ventilacion/ResultRow)
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
