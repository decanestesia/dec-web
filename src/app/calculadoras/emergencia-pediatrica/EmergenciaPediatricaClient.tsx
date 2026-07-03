"use client";

// ============================================================
// Tarjeta de emergencia pediátrica — dosis de reanimación por peso
//
// ⚠ DOSIS DE EMERGENCIA / PARO. NO son dosis de mantenimiento ni
// de sedación electiva. Verificar con el algoritmo vigente y el
// juicio clínico antes de administrar.
//
// EXACTITUD CLÍNICA (app de alta precisión): cada dosis, tope y
// energía proviene de literatura aceptada. NO se inventan cifras.
// Se muestran RANGOS cuando la guía los da, con sus topes (máximos).
//
// FUENTES (Vancouver breve):
//  - Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric
//    Basic and Advanced Life Support: 2020 American Heart
//    Association Guidelines for CPR and ECC. Circulation.
//    2020;142(16_suppl_2):S469-S523.  (PALS 2020)
//  - Advanced Paediatric Life Support: The Practical Approach
//    (APLS/ALSG). 6.ª ed. Wiley-Blackwell; 2016.  (peso estimado, TET)
//  - Khine HH, Corddry DH, Kettrick RG, et al. Comparison of
//    cuffed and uncuffed endotracheal tubes in young children
//    during general anesthesia. Anesthesiology. 1997;86:627-631.
//  - Cole PV. Modified formula for tracheal tube size (edad/4 + 4).
//  - Gropper MA, et al. Miller's Anesthesia. 9.ª ed. Elsevier; 2020.
//    (dosis de inducción de secuencia rápida por kg)
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ------------------------------------------------------------
// Parsing — acepta coma o punto como separador decimal
// ------------------------------------------------------------
function parseDouble(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// ------------------------------------------------------------
// Modo de entrada: peso directo o edad → peso estimado
// ------------------------------------------------------------
type InputMode = "weight" | "age";

// ------------------------------------------------------------
// Estimación pediátrica de peso a partir de la edad — APLS
//   1–5 a:  (edad + 4) × 2
//   6–12 a: (edad × 3) + 7   [fórmula APLS actualizada]
// Alternativa clásica frecuentemente citada: 2 × edad + 8 (Argall).
// Devolvemos ambas para transparencia; se USA la APLS por defecto.
// Lactantes < 1 a y adolescentes > 12 a: la estimación no aplica →
// exigir peso real (báscula o cinta de Broselow).
// ------------------------------------------------------------
interface WeightEstimate {
  apls: number | null; // fórmula APLS por rango
  aplsFormula: string;
  argall: number | null; // 2·edad + 8 (clásica, 1–10 a)
}
function estimateWeight(ageYears: number): WeightEstimate {
  let apls: number | null = null;
  let aplsFormula = "";
  if (ageYears >= 1 && ageYears <= 5) {
    apls = (ageYears + 4) * 2;
    aplsFormula = "(edad + 4) × 2";
  } else if (ageYears > 5 && ageYears <= 12) {
    apls = ageYears * 3 + 7;
    aplsFormula = "(edad × 3) + 7";
  }
  // Argall / clásica 2·edad + 8, tradicionalmente 1–10 años
  const argall =
    ageYears >= 1 && ageYears <= 10 ? 2 * ageYears + 8 : null;
  return { apls, aplsFormula, argall };
}

// ------------------------------------------------------------
// TET pediátrico — fórmula de Cole modificada (edad ≥ 1 a útil,
// clásica para ≥ 2 a). sin balón: edad/4 + 4; con balón: edad/4 + 3.5.
// Se calcula sólo si hay EDAD; el peso solo no da el diámetro.
// ------------------------------------------------------------
interface TubeSize {
  uncuffed: number;
  cuffed: number;
}
function tetSize(ageYears: number): TubeSize | null {
  if (ageYears < 1) return null; // neonato/lactante < 1 a → tabla por edad
  return {
    uncuffed: ageYears / 4 + 4,
    cuffed: ageYears / 4 + 3.5,
  };
}

// ------------------------------------------------------------
// Redondeo clínico útil (2 cifras significativas suaves)
// ------------------------------------------------------------
function r1(n: number): string {
  // 1 decimal, sin ceros colgantes innecesarios
  return (Math.round(n * 10) / 10).toString();
}
function r2(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

// ------------------------------------------------------------
// Estructura de una fila de fármaco/energía calculada
// ------------------------------------------------------------
interface DoseRow {
  name: string;
  dose: string; // resultado calculado para ESTE peso (rango/valor)
  rule: string; // regla por kg (badge)
  detail?: string; // preparación / volumen / notas de administración
  color: string; // color de acento del valor
  capped?: boolean; // si se aplicó un tope (máximo)
}

// ------------------------------------------------------------
// Cálculo de todas las dosis de EMERGENCIA para un peso dado.
// Se usa peso "de dosificación" (real o estimado). PALS aplica el
// tope de dosis del adulto cuando el cálculo por kg lo supera.
// ------------------------------------------------------------
function computeEmergency(weightKg: number): DoseRow[] {
  const w = weightKg;

  // ---- Adrenalina (epinefrina) en PARO: 0.01 mg/kg = 10 mcg/kg IV/IO
  //      de la dilución 1:10 000 (0.1 mg/mL) → 0.1 mL/kg. Máx 1 mg.
  const adrMg = Math.min(0.01 * w, 1); // mg
  const adrMcg = adrMg * 1000;
  const adrMl = Math.min(0.1 * w, 10); // mL de 1:10 000
  const adrCapped = 0.01 * w > 1;

  // ---- Atropina (bradicardia/RSI): 0.02 mg/kg = 20 mcg/kg IV/IO.
  //      Dosis MÍNIMA 0.1 mg (100 mcg). Máx única 0.5 mg (niño) — PALS.
  const atrRaw = 0.02 * w; // mg
  const atrMg = Math.min(Math.max(atrRaw, 0.1), 0.5);
  const atrMinApplied = atrRaw < 0.1;
  const atrMaxApplied = atrRaw > 0.5;

  // ---- Amiodarona (FV/TVsp): 5 mg/kg IV/IO en bolo, hasta 3 dosis.
  //      Máx único 300 mg (equivalencia adulto).
  const amioMg = Math.min(5 * w, 300);
  const amioCapped = 5 * w > 300;

  // ---- Lidocaína (alternativa a amiodarona en FV/TVsp): 1 mg/kg IV/IO.
  //      Máx único 100 mg.
  const lidoMg = Math.min(1 * w, 100);
  const lidoCapped = 1 * w > 100;

  // ---- Adenosina (TSV): 1.ª dosis 0.1 mg/kg (máx 6 mg) IV/IO rápida;
  //      2.ª dosis 0.2 mg/kg (máx 12 mg).
  const adeno1 = Math.min(0.1 * w, 6);
  const adeno2 = Math.min(0.2 * w, 12);

  // ---- Desfibrilación (FV/TVsp): 2 J/kg inicial; 4 J/kg siguiente;
  //      luego ≥ 4 J/kg (máx 10 J/kg o dosis adulto). PALS 2020.
  const defib1 = 2 * w; // J
  const defib2 = 4 * w;
  const defibMax = Math.min(10 * w, 200); // techo pragmático (dosis adulto)

  // ---- Cardioversión sincronizada: 0.5–1 J/kg inicial; si falla, 2 J/kg.
  const cvLow = 0.5 * w;
  const cvHigh = 1 * w;
  const cv2 = 2 * w;

  // ---- Bolo de fluidos (shock): 10–20 mL/kg de cristaloide isotónico,
  //      en bolos, reevaluando (10 mL/kg si cardiogénico/DKA/neonato).
  const fluidLow = 10 * w;
  const fluidHigh = 20 * w;

  // ---- Glucosa (hipoglucemia): 0.25 g/kg IV/IO (rango 0.25–0.5 g/kg).
  //      Con D10: 2.5–5 mL/kg; con D25: 1–2 mL/kg. (D25 no en neonatos.)
  const gluGLow = 0.25 * w; // g
  const gluGHigh = 0.5 * w;
  const d10MlLow = 2.5 * w; // mL de dextrosa 10%
  const d10MlHigh = 5 * w;

  return [
    {
      name: "Adrenalina (paro)",
      dose: `${r2(adrMg)} mg  ·  ${r2(adrMl)} mL`,
      rule: "10 mcg/kg IV/IO",
      detail: `${r1(adrMcg)} mcg · dilución 1:10 000 (0.1 mg/mL) → 0.1 mL/kg · repetir c/3–5 min · máx 1 mg`,
      color: "var(--red)",
      capped: adrCapped,
    },
    {
      name: "Atropina",
      dose: `${r2(atrMg)} mg`,
      rule: "20 mcg/kg IV/IO",
      detail: `mín 0.1 mg${atrMinApplied ? " (aplicado)" : ""} · máx única 0.5 mg${
        atrMaxApplied ? " (aplicado)" : ""
      } · bradicardia por tono vagal / RSI`,
      color: "var(--amber)",
      capped: atrMinApplied || atrMaxApplied,
    },
    {
      name: "Amiodarona (FV/TVsp)",
      dose: `${r1(amioMg)} mg`,
      rule: "5 mg/kg IV/IO",
      detail: `bolo en paro (FV/TVsp refractaria) · hasta 3 dosis · máx 300 mg/dosis`,
      color: "var(--red)",
      capped: amioCapped,
    },
    {
      name: "Lidocaína (alt.)",
      dose: `${r1(lidoMg)} mg`,
      rule: "1 mg/kg IV/IO",
      detail: `alternativa a amiodarona en FV/TVsp · máx 100 mg/dosis`,
      color: "var(--amber)",
      capped: lidoCapped,
    },
    {
      name: "Adenosina — 1.ª dosis",
      dose: `${r2(adeno1)} mg`,
      rule: "0.1 mg/kg IV/IO",
      detail: `TSV · bolo RÁPIDO + arrastre salino · máx 6 mg`,
      color: "var(--cyan)",
      capped: 0.1 * w > 6,
    },
    {
      name: "Adenosina — 2.ª dosis",
      dose: `${r2(adeno2)} mg`,
      rule: "0.2 mg/kg IV/IO",
      detail: `si no revierte · bolo rápido · máx 12 mg`,
      color: "var(--cyan)",
      capped: 0.2 * w > 12,
    },
    {
      name: "Desfibrilación (no sinc.)",
      dose: `${r1(defib1)} J → ${r1(defib2)} J`,
      rule: "2 → 4 J/kg",
      detail: `FV/TVsp · 1.ª descarga 2 J/kg, 2.ª 4 J/kg, luego ≥ 4 J/kg (máx ~${r1(
        defibMax
      )} J / dosis adulto)`,
      color: "var(--red)",
    },
    {
      name: "Cardioversión (sinc.)",
      dose: `${r2(cvLow)}–${r1(cvHigh)} J → ${r1(cv2)} J`,
      rule: "0.5–1 → 2 J/kg",
      detail: `TSV/TV con pulso e inestable · sincronizada · si falla, subir a 2 J/kg`,
      color: "var(--amber)",
    },
    {
      name: "Bolo de fluidos",
      dose: `${r1(fluidLow)}–${r1(fluidHigh)} mL`,
      rule: "10–20 mL/kg",
      detail: `cristaloide isotónico en bolo · reevaluar tras cada bolo · usar 10 mL/kg si cardiogénico / CAD / neonato`,
      color: "var(--cyan)",
    },
    {
      name: "Glucosa (hipoglucemia)",
      dose: `${r2(gluGLow)}–${r1(gluGHigh)} g`,
      rule: "0.25–0.5 g/kg",
      detail: `D10: ${r1(d10MlLow)}–${r1(d10MlHigh)} mL (2.5–5 mL/kg) · comprobar glucemia · evitar D25/D50 en neonato`,
      color: "var(--accent)",
    },
  ];
}

// ------------------------------------------------------------
// Dosis de inducción / RSI por kg — punto de partida.
// Miller's Anesthesia (9.ª ed.) + PALS. Se muestran como RANGO.
// NO son dosis de mantenimiento ni de sedación prolongada.
// ------------------------------------------------------------
interface InductionRow {
  name: string;
  perKg: string; // regla por kg (texto)
  dose: string; // rango calculado para el peso
  detail: string;
}
function computeInduction(w: number): InductionRow[] {
  const range = (lo: number, hi: number, unit: string, dec = 1) =>
    `${r1(lo * w)}–${(Math.round(hi * w * 10 ** dec) / 10 ** dec).toString()} ${unit}`;
  return [
    {
      name: "Ketamina",
      perKg: "1–2 mg/kg IV",
      dose: range(1, 2, "mg"),
      detail: "estable hemodinámicamente; 4–5 mg/kg IM si sin acceso",
    },
    {
      name: "Etomidato",
      perKg: "0.2–0.3 mg/kg IV",
      dose: range(0.2, 0.3, "mg", 2),
      detail: "estabilidad hemodinámica; cautela en sepsis (supresión adrenal)",
    },
    {
      name: "Propofol",
      perKg: "2–3 mg/kg IV",
      dose: range(2, 3, "mg"),
      detail: "induce hipotensión; evitar en shock / inestable",
    },
    {
      name: "Fentanilo",
      perKg: "1–3 mcg/kg IV",
      dose: range(1, 3, "mcg"),
      detail: "coadyuvante analgésico; titular por rigidez torácica si rápido",
    },
    {
      name: "Rocuronio",
      perKg: "0.6–1.2 mg/kg IV",
      dose: range(0.6, 1.2, "mg"),
      detail: "bloqueo neuromuscular RSI; 1.2 mg/kg para inicio rápido",
    },
    {
      name: "Succinilcolina",
      perKg: "1–2 mg/kg IV",
      dose: range(1, 2, "mg"),
      detail: "inicio ultrarrápido; contraindicaciones (hiperK, HM, quemados)",
    },
    {
      name: "Midazolam",
      perKg: "0.05–0.1 mg/kg IV",
      dose: range(0.05, 0.1, "mg", 2),
      detail: "sedación/coadyuvante; deprime hemodinamia en dosis altas",
    },
  ];
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function EmergenciaPediatricaClient() {
  const [mode, setMode] = useState<InputMode>("weight");
  const [weightText, setWeightText] = useState("");
  const [ageText, setAgeText] = useState("");

  const weightInput = useMemo(() => parseDouble(weightText), [weightText]);
  const ageInput = useMemo(() => parseDouble(ageText), [ageText]);

  // Peso de dosificación y su procedencia
  const dosing = useMemo(() => {
    if (mode === "weight") {
      if (weightInput !== null && weightInput > 0) {
        return {
          weight: weightInput,
          source: "peso real",
          estimate: null as WeightEstimate | null,
        };
      }
      return null;
    }
    // modo edad → estimar
    if (ageInput !== null && ageInput >= 0) {
      const est = estimateWeight(ageInput);
      if (est.apls !== null) {
        return {
          weight: est.apls,
          source: `estimado APLS ${est.aplsFormula}`,
          estimate: est,
        };
      }
    }
    return null;
  }, [mode, weightInput, ageInput]);

  // Edad para TET: en modo edad la tenemos; en modo peso no.
  const ageForTube = mode === "age" ? ageInput : null;
  const tube = useMemo(
    () => (ageForTube !== null ? tetSize(ageForTube) : null),
    [ageForTube]
  );

  const rows = useMemo(
    () => (dosing ? computeEmergency(dosing.weight) : null),
    [dosing]
  );
  const induction = useMemo(
    () => (dosing ? computeInduction(dosing.weight) : null),
    [dosing]
  );

  const clearAll = () => {
    setWeightText("");
    setAgeText("");
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
          <b>$</b> ./emergencia-pediatrica.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Emergencia pediátrica
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
          dosis de reanimación por peso · adrenalina · atropina · amiodarona ·
          adenosina · energías · fluidos · glucosa · TET · inducción
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// en un paro nadie tiene tiempo de multiplicar; deja que el app lo haga y verifica"}
          </span>
        </p>
      </div>

      {/* ==================== BANNER DE EMERGENCIA ==================== */}
      <div
        className="mono"
        style={{
          marginBottom: "1rem",
          padding: "0.55rem 0.75rem",
          border: "1px solid var(--red)",
          background: "rgba(211,95,95,0.08)",
          color: "var(--red)",
          fontSize: "0.68rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.9rem" }}>⚠</span>
        <span>
          DOSIS DE EMERGENCIA / PARO — no son dosis de mantenimiento ni de
          sedación electiva. Confirmar con el algoritmo vigente.
        </span>
      </div>

      {/* ==================== ENTRADA ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PACIENTE
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          {/* Selector de modo */}
          <div>
            <label className="mono" style={labelStyle}>
              Fuente del peso
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
              {(
                [
                  ["weight", "Peso (kg)"],
                  ["age", "Edad → peso"],
                ] as [InputMode, string][]
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: m === mode ? "var(--accent)" : "var(--bg-1)",
                    color: m === mode ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Input según modo */}
          {mode === "weight" ? (
            <div>
              <label className="mono" style={labelStyle}>
                Peso real (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="18"
                value={weightText}
                onChange={(e) => setWeightText(e.target.value)}
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
                {"// si tienes báscula o cinta de Broselow, úsala: el peso real manda"}
              </div>
            </div>
          ) : (
            <div>
              <label className="mono" style={labelStyle}>
                Edad (años)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="4"
                value={ageText}
                onChange={(e) => setAgeText(e.target.value)}
                min={0}
                step="any"
              />
              {/* Detalle de estimación */}
              {ageInput !== null && ageInput >= 0 ? (
                (() => {
                  const est = estimateWeight(ageInput);
                  if (est.apls === null) {
                    return (
                      <div
                        className="mono"
                        style={{
                          color: "var(--amber)",
                          fontSize: "0.6rem",
                          marginTop: "0.35rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {ageInput < 1
                          ? "< 1 año: la estimación APLS no aplica. Usa peso real (báscula / Broselow)."
                          : "> 12 años: usa peso real; la estimación pediátrica pierde exactitud."}
                      </div>
                    );
                  }
                  return (
                    <div
                      className="mono"
                      style={{
                        color: "var(--text-3)",
                        fontSize: "0.58rem",
                        marginTop: "0.35rem",
                        lineHeight: 1.7,
                      }}
                    >
                      {`// APLS ${est.aplsFormula} = ${r1(est.apls)} kg`}
                      {est.argall !== null ? (
                        <>
                          <br />
                          {`// alternativa clásica (2·edad + 8) = ${r1(
                            est.argall
                          )} kg — se usa la APLS`}
                        </>
                      ) : null}
                    </div>
                  );
                })()
              ) : (
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.55rem",
                    marginTop: "0.35rem",
                    lineHeight: 1.6,
                  }}
                >
                  {"// el peso estimado es un puente hasta que llegue la báscula, no un dogma"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ==================== RESULTADOS ==================== */}
      {dosing && rows && induction ? (
        <>
          {/* Peso usado */}
          <div
            className="mono fade-up"
            style={{
              marginBottom: "1rem",
              padding: "0.55rem 0.75rem",
              border: "1px solid var(--accent-border)",
              background: "var(--accent-glow)",
              color: "var(--accent)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            <span>PESO DE DOSIFICACIÓN → {r1(dosing.weight)} kg</span>
            <span style={{ color: "var(--text-2)", fontWeight: 400 }}>
              {dosing.source}
            </span>
          </div>

          {/* ---------- DOSIS DE PARO / EMERGENCIA ---------- */}
          <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> DOSIS DE PARO / EMERGENCIA
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {rows.map((row, i) => (
                <div
                  key={row.name}
                  style={{
                    padding: "0.6rem 0.75rem",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        color: "var(--text-0)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {row.name}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.53rem",
                        padding: "0.1rem 0.4rem",
                        background: "var(--bg-3)",
                        color: "var(--text-2)",
                        border: "1px solid var(--border-hi)",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.rule}
                    </span>
                    {row.capped && (
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.53rem",
                          padding: "0.1rem 0.4rem",
                          background: "rgba(212,161,58,0.12)",
                          color: "var(--amber)",
                          border: "1px solid var(--amber)",
                          borderRadius: "9999px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        tope aplicado
                      </span>
                    )}
                    <span style={{ flex: 1 }} />
                    <span
                      className="mono"
                      style={{
                        color: row.color,
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                    >
                      {row.dose}
                    </span>
                  </div>
                  {row.detail && (
                    <div
                      className="mono"
                      style={{
                        color: "var(--text-3)",
                        fontSize: "0.56rem",
                        marginTop: "0.25rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {row.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- VÍA AÉREA / TET ---------- */}
          <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> VÍA AÉREA
            </div>
            <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
              {tube ? (
                <>
                  <ResultRow
                    title="TET sin balón (DI)"
                    value={`${r1(tube.uncuffed)} mm`}
                    badge="edad/4 + 4"
                  />
                  <ResultRow
                    title="TET con balón (DI)"
                    value={`${r1(tube.cuffed)} mm`}
                    badge="edad/4 + 3.5"
                  />
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.56rem",
                      marginTop: "-0.25rem",
                      lineHeight: 1.6,
                    }}
                  >
                    profundidad oral ≈ 3 × DI cm · confirmar con capnografía
                    (EtCO₂ sostenido) y auscultación
                  </div>
                </>
              ) : (
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.62rem",
                    lineHeight: 1.6,
                  }}
                >
                  {mode === "weight"
                    ? "El diámetro del TET se calcula por EDAD. Cambia a modo «Edad → peso» para obtenerlo, o usa la tabla de referencia abajo."
                    : ageInput !== null && ageInput < 1
                    ? "< 1 año: usar tabla por edad (neonato 3.0–3.5; 6 m 3.5; 1 a 4.0 sin balón). La fórmula de Cole no aplica."
                    : "Ingresa la edad para calcular el TET."}
                </div>
              )}
            </div>
          </div>

          {/* ---------- DOSIS DE INDUCCIÓN / RSI ---------- */}
          <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> INDUCCIÓN / SECUENCIA RÁPIDA (RSI)
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              {induction.map((row, i) => (
                <div
                  key={row.name}
                  style={{
                    padding: "0.6rem 0.75rem",
                    borderTop: i === 0 ? "none" : "1px solid var(--border)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        color: "var(--text-0)",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                      }}
                    >
                      {row.name}
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.53rem",
                        padding: "0.1rem 0.4rem",
                        background: "var(--bg-3)",
                        color: "var(--text-2)",
                        border: "1px solid var(--border-hi)",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.perKg}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span
                      className="mono"
                      style={{
                        color: "var(--cyan)",
                        fontWeight: 700,
                        fontSize: "0.92rem",
                        whiteSpace: "nowrap",
                        textAlign: "right",
                      }}
                    >
                      {row.dose}
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.56rem",
                      marginTop: "0.25rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {row.detail}
                  </div>
                </div>
              ))}
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
              {"// dosis de inducción = punto de partida; titular según hemodinamia y objetivo"}
            </div>
          </div>
        </>
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
          {mode === "weight"
            ? "Ingresa el peso (kg) para calcular las dosis de emergencia."
            : "Ingresa la edad (1–12 años) para estimar el peso y calcular."}
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin peso no hay dosis; y sin dosis, sólo hay masaje y buenas intenciones"}
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

      {/* ==================== REFERENCIA: reglas por kg ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> REGLAS POR KG (PALS 2020 / APLS)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <RefTable
            headers={["Intervención", "Dosis / energía por kg", "Tope (máx)"]}
            rows={[
              ["Adrenalina (paro)", "0.01 mg/kg = 10 mcg/kg (0.1 mL/kg 1:10 000)", "1 mg"],
              ["Atropina", "0.02 mg/kg = 20 mcg/kg (mín 0.1 mg)", "0.5 mg/dosis"],
              ["Amiodarona (FV/TVsp)", "5 mg/kg bolo", "300 mg/dosis"],
              ["Lidocaína (alt.)", "1 mg/kg", "100 mg/dosis"],
              ["Adenosina 1.ª", "0.1 mg/kg", "6 mg"],
              ["Adenosina 2.ª", "0.2 mg/kg", "12 mg"],
              ["Desfibrilación", "2 J/kg → 4 J/kg → ≥ 4 J/kg", "10 J/kg / dosis adulto"],
              ["Cardioversión sinc.", "0.5–1 J/kg → 2 J/kg", "dosis adulto"],
              ["Bolo de fluidos", "10–20 mL/kg cristaloide", "reevaluar c/bolo"],
              ["Glucosa", "0.25–0.5 g/kg (D10 2.5–5 mL/kg)", "—"],
              ["TET sin balón (DI)", "edad/4 + 4 (mm)", "—"],
              ["TET con balón (DI)", "edad/4 + 3.5 (mm)", "—"],
            ]}
          />
        </div>
      </div>

      {/* ==================== REFERENCIA: TET neonato/lactante ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> TET POR EDAD (neonato – &lt; 2 a)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <RefTable
            headers={["Edad", "DI sin balón (mm)", "Profundidad oral (cm)"]}
            rows={[
              ["Prematuro < 1 kg", "2.5", "6–7"],
              ["Neonato término", "3.0–3.5", "9–10"],
              ["6 meses", "3.5", "10–11"],
              ["1 año", "4.0", "11–12"],
            ]}
          />
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
          {"// por debajo de 1–2 años la fórmula de Cole subestima; usa la tabla"}
        </div>
      </div>

      {/* ==================== NOTAS DE SEGURIDAD ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> NOTAS
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.76rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Adrenalina en paro NO es la de anafilaxia:</strong> en paro
              es 0.01 mg/kg IV/IO de la dilución 1:10 000. En anafilaxia se usa
              1:1 000 (1 mg/mL) por vía IM (0.01 mg/kg, máx 0.3–0.5 mg). No
              confundir concentraciones.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Cuando el cálculo por kg supera la dosis del adulto, PALS aplica el{" "}
              <strong>tope de adulto</strong>. Aquí se marca «tope aplicado».
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La atropina tiene <strong>dosis mínima 0.1 mg</strong>: por debajo
              puede producir bradicardia paradójica. En lactantes muy pequeños,
              esa mínima puede superar los 20 mcg/kg teóricos.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              La <strong>adenosina</strong> se administra en bolo IV rápido
              seguido de arrastre salino, por una vía lo más central/proximal
              posible; su vida media es de segundos.
            </li>
            <li style={{ marginBottom: "0" }}>
              El <strong>peso estimado</strong> (APLS) es un puente hasta obtener
              el peso real o la cinta de longitud-peso (Broselow). Reemplázalo en
              cuanto sea posible.
            </li>
          </ul>

          {/* Callout */}
          <div
            className="panel"
            style={{
              borderLeft: "3px solid var(--red)",
              margin: "1rem 0 0.25rem",
            }}
          >
            <div
              className="panel-body"
              style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
            >
              <span style={{ color: "var(--red)", fontSize: "0.9rem" }}>⚠</span>
              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: "0.72rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Estas cifras son dosis de <strong>emergencia</strong>. Verifica
                cada preparación (concentración del vial, dilución final,
                volumen) antes de administrar, y sigue el algoritmo de PALS/APLS
                vigente en tu centro. La calculadora asiste; no reemplaza el
                doble chequeo ni al equipo de reanimación.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fuentes */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          lineHeight: 1.8,
          marginBottom: "1rem",
        }}
      >
        Fuentes: Topjian AA, Raymond TT, Atkins D, et al. Part 4: Pediatric Basic
        and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC.
        Circulation. 2020;142(16_suppl_2):S469-S523. · Advanced Paediatric Life
        Support (APLS/ALSG). 6.ª ed. Wiley-Blackwell; 2016. · Khine HH, et al.
        Anesthesiology. 1997;86:627-631. · Cole PV (fórmula de TET modificada). ·
        Gropper MA, et al. Miller&apos;s Anesthesia. 9.ª ed. Elsevier; 2020.
      </p>

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
        {"// dosis de literatura aceptada — no sustituyen el algoritmo ni al equipo de reanimación"}
        <br />
        {"// verifica concentración, dilución y volumen antes de empujar el émbolo"}
        <br />
        {"// si algo sale mal, la culpa no es del app"}
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
// Fila de resultado — réplica del patrón DEC
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

// ------------------------------------------------------------
// Tabla de referencia — réplica del patrón DEC
// ------------------------------------------------------------
function RefTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}
      >
        <thead>
          <tr style={{ background: "var(--bg-3)" }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="mono"
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.58rem",
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
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="mono"
                  style={{
                    padding: "0.45rem 0.7rem",
                    fontSize: "0.7rem",
                    color: ci === 0 ? "var(--text-0)" : "var(--text-1)",
                    fontWeight: ci === 0 ? 600 : 400,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
