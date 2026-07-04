"use client";

// ============================================================
// Ventilación & Vía aérea — calculadora clínica DEC
// Parámetros ventilatorios protectores + selección de vía aérea
// para ADULTOS y NIÑOS, ambos sexos.
//
// EXACTITUD CLÍNICA (app de alta precisión): cada fórmula, umbral
// y rango proviene de literatura aceptada. NO inventar cifras.
// Fuentes citadas al pie de cada sección (formato Vancouver breve).
//
//   IBW (adulto): Devine BJ. Drug Intell Clin Pharm 1974;8:650-5.
//     Hombre  50.0 + 2.3·(pulgadas > 60)
//     Mujer   45.5 + 2.3·(pulgadas > 60)
//   Vt protector 6 mL/kg IBW (rango 6-8): ARDSNet.
//     Acute Respiratory Distress Syndrome Network. N Engl J Med 2000;342:1301-8.
//   TET adulto (DI mm) y profundidad (~3×DI): Miller's Anesthesia, 9.ª ed.
//     Gropper MA, et al. Miller's Anesthesia. Elsevier; 2020.
//   TET pediátrico (edad/4 + 4 sin balón; edad/4 + 3.5 con balón),
//     profundidad oral (edad/2 + 12) y nasal (edad/2 + 15):
//     APLS / Cole PV; Khine HH, et al. Anesthesiology 1997;86:627-31;
//     Duracher C, et al. Paediatr Anaesth 2008.
//   LMA por peso: Brimacombe J / inserto LMA (Teleflex).
//   Hoja de laringoscopio por edad/peso: Miller's Anesthesia; APLS.
// ============================================================

import { useMemo } from "react";
import Link from "next/link";
import { usePatient } from "@/lib/patient/PatientContext";

// ------------------------------------------------------------
// Tipos
// ------------------------------------------------------------

type Sex = "male" | "female";
const SEX_LABEL: Record<Sex, string> = {
  male: "Masculino",
  female: "Femenino",
};

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
// Umbral adulto vs pediátrico
// Convención de guías (APLS/PALS): adulto ≥ 12 años.
// ------------------------------------------------------------
const ADULT_AGE = 12;

// ------------------------------------------------------------
// IBW adulto — Devine (1974)
//   Hombre 50.0 + 2.3·(pulgadas sobre 60)
//   Mujer  45.5 + 2.3·(pulgadas sobre 60)
// Sólo válido para talla > 152.4 cm (60 pulgadas). Por debajo,
// Devine no aplica y devolvemos null (se usa peso real / juicio).
// ------------------------------------------------------------
function ibwDevine(sex: Sex, heightCm: number): number | null {
  const inches = heightCm / 2.54;
  const over60 = inches - 60;
  if (over60 <= 0) return null; // talla < 152.4 cm: fórmula no aplicable
  const base = sex === "male" ? 50.0 : 45.5;
  return base + 2.3 * over60;
}

// ------------------------------------------------------------
// Estimación pediátrica de peso (si el usuario no lo ingresa)
// APLS (Reino Unido, actualizado): (edad + 4) × 2 para 1-5 a;
// edad × 3 + 7 para 6-12 a. Se ofrece sólo como referencia.
// Advanced Paediatric Life Support, 6.ª ed. (APLS/ALSG). Wiley; 2016.
// ------------------------------------------------------------
function aplsWeight(ageYears: number): number | null {
  if (ageYears < 1) return null; // lactantes < 1 a: usar peso real medido
  if (ageYears <= 5) return (ageYears + 4) * 2;
  if (ageYears <= 12) return ageYears * 3 + 7;
  return null;
}

// ------------------------------------------------------------
// TET pediátrico — fórmula de Cole modificada (edad ≥ 2 a)
//   sin balón: edad/4 + 4
//   con balón: edad/4 + 3.5 (Khine/Duracher; también se cita +3)
// Neonatos/lactantes se tabulan aparte (ver referencia).
// ------------------------------------------------------------
interface PedTube {
  uncuffed: number; // DI mm
  cuffed: number; // DI mm
}
function pedTubeSize(ageYears: number): PedTube | null {
  if (ageYears < 2) return null; // < 2 a: usar tabla por edad/peso
  return {
    uncuffed: ageYears / 4 + 4,
    cuffed: ageYears / 4 + 3.5,
  };
}

// ------------------------------------------------------------
// Profundidad TET pediátrica (edad ≥ 2 a)
//   oral:  edad/2 + 12 (cm a comisura labial)
//   nasal: edad/2 + 15 (cm a narina)
// Alternativa: 3 × DI del tubo (oral).
// ------------------------------------------------------------
interface PedDepth {
  oral: number;
  nasal: number;
}
function pedTubeDepth(ageYears: number): PedDepth | null {
  if (ageYears < 2) return null;
  return {
    oral: ageYears / 2 + 12,
    nasal: ageYears / 2 + 15,
  };
}

// ------------------------------------------------------------
// LMA por peso — inserto del fabricante (Teleflex / Brimacombe)
// ------------------------------------------------------------
interface LmaRec {
  size: string;
  weight: string;
  cuffMaxMl: string;
}
const LMA_TABLE: LmaRec[] = [
  { size: "1", weight: "< 5 kg", cuffMaxMl: "4 mL" },
  { size: "1.5", weight: "5–10 kg", cuffMaxMl: "7 mL" },
  { size: "2", weight: "10–20 kg", cuffMaxMl: "10 mL" },
  { size: "2.5", weight: "20–30 kg", cuffMaxMl: "14 mL" },
  { size: "3", weight: "30–50 kg", cuffMaxMl: "20 mL" },
  { size: "4", weight: "50–70 kg", cuffMaxMl: "30 mL" },
  { size: "5", weight: "70–100 kg", cuffMaxMl: "40 mL" },
  { size: "6", weight: "> 100 kg", cuffMaxMl: "50 mL" },
];
function lmaForWeight(weightKg: number): LmaRec {
  if (weightKg < 5) return LMA_TABLE[0];
  if (weightKg < 10) return LMA_TABLE[1];
  if (weightKg < 20) return LMA_TABLE[2];
  if (weightKg < 30) return LMA_TABLE[3];
  if (weightKg < 50) return LMA_TABLE[4];
  if (weightKg < 70) return LMA_TABLE[5];
  if (weightKg <= 100) return LMA_TABLE[6];
  return LMA_TABLE[7];
}

// ------------------------------------------------------------
// Hoja de laringoscopio por edad — Miller's / APLS
// ------------------------------------------------------------
function bladeForAge(ageYears: number): string {
  if (ageYears < 0.08)
    return "Recta Miller 0 (prematuro / neonato)"; // ~< 1 mes
  if (ageYears < 1) return "Recta Miller 0–1";
  if (ageYears < 2) return "Recta Miller 1 (o Mac 1)";
  if (ageYears < 6) return "Miller 1–2 / Mac 2";
  if (ageYears < ADULT_AGE) return "Mac 2 (recta o curva)";
  return "Mac 3 (adulto estándar; Mac 4 si cuello largo)";
}

// ------------------------------------------------------------
// TET adulto por sexo — Miller's Anesthesia
//   Hombre 8.0–8.5 DI mm · profundidad ~23 cm a comisura
//   Mujer  7.0–7.5 DI mm · profundidad ~21 cm a comisura
// ------------------------------------------------------------
interface AdultTube {
  sizeRange: string;
  representativeDI: number; // para regla 3×DI
  depthLabel: string;
}
function adultTube(sex: Sex): AdultTube {
  return sex === "male"
    ? { sizeRange: "8.0–8.5", representativeDI: 8.0, depthLabel: "~23 cm" }
    : { sizeRange: "7.0–7.5", representativeDI: 7.0, depthLabel: "~21 cm" };
}

// ------------------------------------------------------------
// Salida agregada
// ------------------------------------------------------------
interface VentOutputs {
  isPed: boolean;
  ageYears: number;
  weightUsedKg: number; // peso usado para dosis por kg (IBW adulto / peso ped)
  weightSource: string; // etiqueta explicativa
  // ventilación
  vt6: number | null;
  vt8: number | null;
  rrLow: number;
  rrHigh: number;
  veLow: number | null; // ventilación minuto a Vt 6, FR baja
  veHigh: number | null; // ventilación minuto a Vt 8, FR alta
  ibw: number | null; // sólo adulto
  // vía aérea
  tubeAdult: AdultTube | null;
  tubePed: PedTube | null;
  depthPed: PedDepth | null;
  depthAdult: string | null; // texto profundidad adulto
  lma: LmaRec | null;
  blade: string;
}

function compute(
  ageYears: number | null,
  sex: Sex,
  heightCm: number | null,
  weightKg: number | null,
  // IBW del paciente activo (contexto). Vt protector adulto usa PESO IDEAL:
  // se prefiere este derivado del contexto (derived.ideal) si existe.
  idealFromContext: number | null = null
): VentOutputs | null {
  if (ageYears === null || !(ageYears >= 0)) return null;

  const isPed = ageYears < ADULT_AGE;

  // ---------- selección del peso para dosis por kg ----------
  let weightUsedKg: number | null = null;
  let weightSource = "";
  let ibw: number | null = null;

  if (isPed) {
    // Pediátrico: Vt se dosifica sobre peso REAL (o estimado APLS).
    if (weightKg !== null && weightKg > 0) {
      weightUsedKg = weightKg;
      weightSource = "peso real";
    } else {
      const est = aplsWeight(ageYears);
      if (est !== null) {
        weightUsedKg = est;
        weightSource = "peso estimado (APLS)";
      }
    }
  } else {
    // Adulto: Vt protector se dosifica sobre IBW (peso ideal).
    // Se prefiere el IBW del paciente activo (contexto); si no, Devine local.
    if (idealFromContext !== null && idealFromContext > 0) {
      ibw = idealFromContext;
    } else if (heightCm !== null && heightCm > 0) {
      ibw = ibwDevine(sex, heightCm);
    }
    if (ibw !== null) {
      weightUsedKg = ibw;
      weightSource = "IBW (Devine)";
    } else if (weightKg !== null && weightKg > 0) {
      weightUsedKg = weightKg;
      weightSource = "peso real (IBW no disponible)";
    }
  }

  // ---------- ventilación ----------
  // Vt protector 6-8 mL/kg IBW (adulto) / 6-8 mL/kg peso (pediátrico).
  const vt6 = weightUsedKg !== null ? weightUsedKg * 6 : null;
  const vt8 = weightUsedKg !== null ? weightUsedKg * 8 : null;

  // Frecuencia respiratoria fisiológica por edad (rangos amplios,
  // punto de partida; se titula por EtCO2/gasometría).
  let rrLow: number;
  let rrHigh: number;
  if (ageYears < 1) {
    rrLow = 25;
    rrHigh = 40;
  } else if (ageYears < 3) {
    rrLow = 20;
    rrHigh = 30;
  } else if (ageYears < 6) {
    rrLow = 18;
    rrHigh = 25;
  } else if (ageYears < ADULT_AGE) {
    rrLow = 16;
    rrHigh = 22;
  } else {
    rrLow = 12;
    rrHigh = 16;
  }

  // Ventilación minuto = Vt × FR (mL/min → L/min).
  const veLow =
    vt6 !== null ? (vt6 * rrLow) / 1000 : null; // conservador
  const veHigh =
    vt8 !== null ? (vt8 * rrHigh) / 1000 : null; // techo

  // ---------- vía aérea ----------
  let tubeAdult: AdultTube | null = null;
  let tubePed: PedTube | null = null;
  let depthPed: PedDepth | null = null;
  let depthAdult: string | null = null;

  if (isPed) {
    tubePed = pedTubeSize(ageYears);
    depthPed = pedTubeDepth(ageYears);
  } else {
    tubeAdult = adultTube(sex);
    // profundidad adulto: valor por sexo o regla 3×DI
    const threeXDI = (tubeAdult.representativeDI * 3).toFixed(0);
    depthAdult = `${tubeAdult.depthLabel} (o 3×DI ≈ ${threeXDI} cm)`;
  }

  // LMA por peso (necesita un peso; usa real, luego IBW/estimado)
  const lmaWeight =
    (weightKg !== null && weightKg > 0 ? weightKg : null) ??
    weightUsedKg ??
    null;
  const lma = lmaWeight !== null ? lmaForWeight(lmaWeight) : null;

  const blade = bladeForAge(ageYears);

  return {
    isPed,
    ageYears,
    weightUsedKg: weightUsedKg ?? 0,
    weightSource,
    vt6,
    vt8,
    rrLow,
    rrHigh,
    veLow,
    veHigh,
    ibw,
    tubeAdult,
    tubePed,
    depthPed,
    depthAdult,
    lma,
    blade,
  };
}

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------
export default function VentilacionPage() {
  // Campos del paciente (edad/talla/peso/sexo) = paciente activo (barra global).
  // Bidireccional: editar aquí actualiza el contexto → todas las calculadoras.
  const { active, setActive, derived } = usePatient();

  // value del input = valor del contexto (string vacío si null).
  const ageText = active.ageYears != null ? String(active.ageYears) : "";
  const heightText = active.heightCm != null ? String(active.heightCm) : "";
  const weightText = active.weightKg != null ? String(active.weightKg) : "";
  const sex = active.sex;

  const outputs = useMemo(
    () =>
      compute(
        active.ageYears,
        sex,
        active.heightCm,
        active.weightKg,
        // Vt protector adulto → PESO IDEAL del paciente activo (derived.ideal).
        derived.ideal
      ),
    [active.ageYears, active.heightCm, active.weightKg, sex, derived.ideal]
  );

  const clearAll = () => {
    setActive({ ageYears: null, heightCm: null, weightKg: null });
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
          <b>$</b> ./ventilacion.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Ventilación &amp; Vía aérea
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
          Vt protector · ventilación minuto · TET · profundidad · LMA · hoja ·
          adulto y pediátrico
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el ventilador no negocia; tú titulas hasta que la gasometría deje de gritar"}
          </span>
        </p>
      </div>

      {/* ==================== DATOS DEL PACIENTE ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> DATOS DEL PACIENTE
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <p
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            usa el paciente activo (barra superior) — editar aquí lo actualiza en
            todas las calculadoras. Vt protector adulto usa el PESO IDEAL (IBW)
            del paciente.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
            }}
          >
            {/* Edad */}
            <div>
              <label className="mono" style={labelStyle}>
                Edad (años)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="45"
                value={ageText}
                onChange={(e) =>
                  setActive({ ageYears: parseDouble(e.target.value) })
                }
                min={0}
                step="any"
              />
            </div>

            {/* Sexo (segmented) */}
            <div>
              <label className="mono" style={labelStyle}>
                Sexo{" "}
                <span style={{ opacity: 0.5, textTransform: "none" }}>
                  — TET/IBW adulto
                </span>
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
                {(Object.keys(SEX_LABEL) as Sex[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActive({ sex: s })}
                    className="mono"
                    style={{
                      padding: "0.5rem 0.25rem",
                      fontSize: "0.65rem",
                      cursor: "pointer",
                      border: "none",
                      background: s === sex ? "var(--accent)" : "var(--bg-1)",
                      color: s === sex ? "#000" : "var(--text-2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {SEX_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Talla */}
            <div>
              <label className="mono" style={labelStyle}>
                Talla (cm){" "}
                <span style={{ opacity: 0.5, textTransform: "none" }}>
                  — IBW adulto
                </span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="170"
                value={heightText}
                onChange={(e) =>
                  setActive({ heightCm: parseDouble(e.target.value) })
                }
                min={0}
                step="any"
              />
            </div>

            {/* Peso real */}
            <div>
              <label className="mono" style={labelStyle}>
                Peso real (kg){" "}
                <span style={{ opacity: 0.5, textTransform: "none" }}>
                  — LMA / Vt pediátrico
                </span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="72.5"
                value={weightText}
                onChange={(e) =>
                  setActive({ weightKg: parseDouble(e.target.value) })
                }
                min={0}
                step="any"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADOS ==================== */}
      {outputs ? (
        <>
          {/* Banner adulto vs pediátrico */}
          <div
            className="mono fade-up"
            style={{
              marginBottom: "1rem",
              padding: "0.55rem 0.75rem",
              border: `1px solid ${
                outputs.isPed ? "var(--cyan)" : "var(--accent-border)"
              }`,
              background: outputs.isPed
                ? "rgba(6,182,212,0.08)"
                : "var(--accent-glow)",
              color: outputs.isPed ? "var(--cyan)" : "var(--accent)",
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span>
              {outputs.isPed ? "MODO PEDIÁTRICO" : "MODO ADULTO"}
              <span
                style={{
                  color: "var(--text-3)",
                  fontWeight: 400,
                  marginLeft: "0.5rem",
                }}
              >
                {outputs.ageYears} a{" "}
                {outputs.isPed ? "(< 12 a)" : "(≥ 12 a)"}
              </span>
            </span>
            {outputs.weightUsedKg > 0 && (
              <span style={{ color: "var(--text-2)", fontWeight: 400 }}>
                dosis/kg → {outputs.weightUsedKg.toFixed(1)} kg (
                {outputs.weightSource})
              </span>
            )}
          </div>

          {/* ---------- VENTILACIÓN ---------- */}
          <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> PARÁMETROS VENTILATORIOS
            </div>
            <div
              className="panel-body"
              style={{ display: "grid", gap: "0.6rem" }}
            >
              {outputs.ibw !== null && (
                <ResultRow
                  title="IBW (Devine)"
                  value={`${outputs.ibw.toFixed(1)} kg`}
                  badge="peso ideal"
                />
              )}

              {outputs.vt6 !== null && outputs.vt8 !== null ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      className="mono"
                      style={{ color: "var(--text-1)", fontSize: "0.8rem" }}
                    >
                      Vt protector
                    </span>
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.55rem",
                        padding: "0.1rem 0.4rem",
                        background: "var(--accent-glow)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      objetivo 6 mL/kg
                    </span>
                    <span style={{ flex: 1 }} />
                    <span
                      className="mono"
                      style={{
                        color: "var(--accent)",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {outputs.vt6.toFixed(0)} mL
                    </span>
                    <span
                      className="mono"
                      style={{
                        color: "var(--text-2)",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      – {outputs.vt8.toFixed(0)} mL
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.55rem",
                      marginTop: "-0.35rem",
                    }}
                  >
                    6–8 mL/kg {outputs.isPed ? "peso" : "IBW"} · destaca 6 mL/kg
                    (protección pulmonar)
                  </div>

                  <ResultRow
                    title="Frecuencia resp."
                    value={`${outputs.rrLow}–${outputs.rrHigh} /min`}
                    badge="según edad"
                  />

                  {outputs.veLow !== null && outputs.veHigh !== null && (
                    <>
                      <ResultRow
                        title="Ventilación minuto"
                        value={`${outputs.veLow.toFixed(
                          1
                        )}–${outputs.veHigh.toFixed(1)} L/min`}
                      />
                      <div
                        className="mono"
                        style={{
                          color: "var(--text-3)",
                          fontSize: "0.55rem",
                          marginTop: "-0.35rem",
                        }}
                      >
                        Vt × FR · titular por EtCO₂ / gasometría, no por la
                        fórmula
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.65rem" }}
                >
                  {outputs.isPed
                    ? "Ingresa peso (o edad ≥ 1 a) para Vt/VM pediátrico."
                    : "Ingresa talla > 152 cm para IBW/Devine, o peso real."}
                </div>
              )}
            </div>
          </div>

          {/* ---------- VÍA AÉREA ---------- */}
          <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> VÍA AÉREA
            </div>
            <div
              className="panel-body"
              style={{ display: "grid", gap: "0.6rem" }}
            >
              {/* TET */}
              {outputs.tubeAdult && (
                <>
                  <ResultRow
                    title="TET (DI)"
                    value={`${outputs.tubeAdult.sizeRange} mm`}
                    badge={sex === "male" ? "hombre" : "mujer"}
                  />
                  {outputs.depthAdult && (
                    <ResultRow
                      title="Profundidad a labio"
                      value={outputs.depthAdult}
                    />
                  )}
                </>
              )}

              {outputs.tubePed && (
                <>
                  <ResultRow
                    title="TET sin balón"
                    value={`${outputs.tubePed.uncuffed.toFixed(1)} mm`}
                    badge="edad/4 + 4"
                  />
                  <ResultRow
                    title="TET con balón"
                    value={`${outputs.tubePed.cuffed.toFixed(1)} mm`}
                    badge="edad/4 + 3.5"
                  />
                </>
              )}
              {outputs.isPed && !outputs.tubePed && (
                <div
                  className="mono"
                  style={{ color: "var(--amber)", fontSize: "0.62rem" }}
                >
                  &lt; 2 años: usar tabla por edad/peso (neonato 2.5–3.0; 6 m
                  3.5; 1 a 4.0 sin balón). Fórmula de Cole no aplica.
                </div>
              )}

              {/* Profundidad pediátrica */}
              {outputs.depthPed && (
                <>
                  <ResultRow
                    title="Profundidad oral"
                    value={`${outputs.depthPed.oral.toFixed(1)} cm`}
                    badge="edad/2 + 12"
                  />
                  <ResultRow
                    title="Profundidad nasal"
                    value={`${outputs.depthPed.nasal.toFixed(1)} cm`}
                    badge="edad/2 + 15"
                  />
                </>
              )}

              {/* Separador */}
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.4rem",
                  marginTop: "0.1rem",
                }}
              />

              {/* LMA */}
              {outputs.lma ? (
                <>
                  <ResultRow
                    title="Mascarilla laríngea"
                    value={`# ${outputs.lma.size}`}
                    badge={outputs.lma.weight}
                  />
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.55rem",
                      marginTop: "-0.35rem",
                    }}
                  >
                    inflado máx. balón: {outputs.lma.cuffMaxMl} (inserto
                    fabricante)
                  </div>
                </>
              ) : (
                <div
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.62rem" }}
                >
                  LMA: ingresa peso para seleccionar tamaño.
                </div>
              )}

              {/* Hoja de laringoscopio */}
              <ResultRow title="Hoja laringoscopio" value={outputs.blade} />
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
          }}
        >
          Ingresa la edad para calcular (talla y peso afinan el resto).
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin edad no sé si intubar a un neonato o a un rugbier"}
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

      {/* ==================== REFERENCIA ==================== */}
      <div className="panel" style={{ marginBottom: "1.5rem" }}>
        <div className="panel-header">
          <span className="dot" /> REFERENCIA RÁPIDA
        </div>
        <div className="panel-body">
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-0)",
              margin: "0.25rem 0 0.75rem",
            }}
          >
            TET pediátrico por edad (neonato–&lt; 2 a)
          </h2>
          <RefTable
            headers={["Edad", "DI sin balón (mm)", "Profundidad oral (cm)"]}
            rows={[
              ["Prematuro < 1 kg", "2.5", "6–7"],
              ["Neonato término", "3.0–3.5", "9–10"],
              ["6 meses", "3.5", "10–11"],
              ["1 año", "4.0", "11–12"],
            ]}
          />

          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-0)",
              margin: "1.5rem 0 0.75rem",
            }}
          >
            Mascarilla laríngea (LMA) por peso
          </h2>
          <RefTable
            headers={["Tamaño", "Peso", "Balón máx."]}
            rows={LMA_TABLE.map((l) => [l.size, l.weight, l.cuffMaxMl])}
          />

          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "var(--text-0)",
              margin: "1.5rem 0 0.75rem",
            }}
          >
            Reglas usadas
          </h2>
          <ul
            className="mono"
            style={{
              margin: "0 0 0.5rem",
              paddingLeft: "1.1rem",
              color: "var(--text-1)",
              fontSize: "0.68rem",
              lineHeight: 1.9,
            }}
          >
            <li>
              IBW adulto (Devine): hombre 50.0 + 2.3·(pulgadas &gt; 60); mujer
              45.5 + 2.3·(pulgadas &gt; 60).
            </li>
            <li>Vt protector 6–8 mL/kg IBW; objetivo 6 mL/kg (ARDSNet).</li>
            <li>
              TET adulto: hombre 8.0–8.5 DI (~23 cm), mujer 7.0–7.5 DI (~21 cm),
              o 3×DI a labio.
            </li>
            <li>
              TET pediátrico (≥ 2 a): sin balón edad/4 + 4; con balón edad/4 +
              3.5.
            </li>
            <li>Profundidad pediátrica: oral edad/2 + 12; nasal edad/2 + 15.</li>
          </ul>

          {/* Callout de seguridad */}
          <div
            className="panel"
            style={{
              borderLeft: "3px solid var(--amber)",
              margin: "1rem 0 0.25rem",
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
                Confirma siempre la posición del TET por auscultación,
                capnografía (EtCO₂ sostenido) y, cuando proceda, radiografía.
                Con tubos con balón mide y limita la presión de balón (≤ 20–25
                cmH₂O). Los rangos son punto de partida: titula por respuesta
                clínica y gasometría.
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
        Fuentes: Devine BJ. Drug Intell Clin Pharm 1974;8:650-5. · ARDS Network.
        N Engl J Med 2000;342:1301-8. · Gropper MA, et al. Miller&apos;s
        Anesthesia. 9.ª ed. Elsevier; 2020. · Khine HH, et al. Anesthesiology
        1997;86:627-31. · Duracher C, et al. Paediatr Anaesth 2008. · Advanced
        Paediatric Life Support (APLS/ALSG). 6.ª ed. Wiley; 2016. · Inserto LMA
        (Teleflex) / Brimacombe J. Laryngeal Mask Anesthesia. 2.ª ed.
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
        {"// parámetros de literatura aceptada — no sustituyen monitorización ni juicio clínico"}
        <br />
        {"// el paciente respira por su fisiología, no por tu fórmula"}
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
// Fila de resultado — réplica de antropometria/ResultRow
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
// Tabla de referencia — réplica del render "table" del blog
// ------------------------------------------------------------
function RefTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 0.25rem",
        border: "1px solid var(--border)",
      }}
    >
      <table
        style={{ width: "100%", borderCollapse: "collapse", minWidth: 380 }}
      >
        <thead>
          <tr style={{ background: "var(--bg-2)" }}>
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
                    fontSize: "0.72rem",
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
