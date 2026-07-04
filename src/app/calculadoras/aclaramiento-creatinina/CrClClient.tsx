"use client";

// ============================================================
// Aclaramiento de creatinina — Cockcroft-Gault
//
//   CrCl (mL/min) = (140 − edad) × peso(kg) × (0.85 si mujer)
//                   ─────────────────────────────────────────
//                              72 × Cr(mg/dL)
//
// El peso a usar es materia de debate: en obesidad la fórmula
// con peso REAL sobreestima el CrCl; se recomienda peso ideal
// (IBW) o, si peso real > 1.2 × IBW, peso ajustado (AdjBW).
//   IBW (Devine 1974):
//     hombre = 50 + 2.3 × (pulgadas > 60")   [50 kg a 152.4 cm]
//     mujer  = 45.5 + 2.3 × (pulgadas > 60") [45.5 kg a 152.4 cm]
//   AdjBW = IBW + 0.4 × (peso real − IBW)   (obesos)
//   Si el peso real < IBW, se usa el peso real (más bajo).
//
// Estadios de función renal (categorías GFR, KDIGO 2012):
//   G1 ≥90 · G2 60-89 · G3a 45-59 · G3b 30-44 · G4 15-29 · G5 <15
//   (KDIGO clasifica por TFG estimada [CKD-EPI]; aquí se aplica la
//    misma banda al CrCl de Cockcroft-Gault, que es la métrica que
//    la mayoría de fichas técnicas/UpToDate usan para ajuste renal.)
//
// FUENTES (Vancouver breve):
//  - Cockcroft DW, Gault MH. Prediction of creatinine clearance
//    from serum creatinine. Nephron. 1976;16(1):31-41.  (fórmula)
//  - KDIGO CKD Work Group. KDIGO 2012 Clinical Practice Guideline
//    for the Evaluation and Management of Chronic Kidney Disease.
//    Kidney Int Suppl. 2013;3(1):1-150.  (categorías GFR)
//  - Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm.
//    1974;8:650-655.  (peso ideal)
//  - Ficha técnica sugammadex (Bridion) — EMA/FDA: no recomendado
//    en insuficiencia renal grave (CrCl < 30 mL/min).
//  - UpToDate: dosificación renal de gabapentina, opioides y HBPM.
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

// Número del paciente activo → texto para el <input> (null = campo vacío).
function numToText(n: number | null): string {
  return n === null ? "" : String(n);
}

// ------------------------------------------------------------
// Sexo y modo de peso
// ------------------------------------------------------------
type Sex = "male" | "female";
type WeightMode = "actual" | "ideal";

const SEX_LABEL: Record<Sex, string> = {
  male: "Hombre",
  female: "Mujer",
};

const WEIGHT_MODE_LABEL: Record<WeightMode, string> = {
  actual: "Peso real",
  ideal: "Peso ideal/ajustado",
};

// ------------------------------------------------------------
// Peso ideal (Devine) y ajustado — requiere talla (cm)
// ------------------------------------------------------------
function idealBodyWeight(sex: Sex, heightCm: number): number {
  const inches = heightCm / 2.54;
  const over60 = Math.max(0, inches - 60);
  const base = sex === "male" ? 50 : 45.5;
  return base + 2.3 * over60;
}

// Peso a introducir en Cockcroft-Gault cuando el usuario elige
// el modo "ideal/ajustado":
//   - actual < IBW  → actual (usar el menor)
//   - actual > 1.2×IBW (obesidad) → ajustado
//   - resto → IBW
function dosingWeight(
  sex: Sex,
  actualKg: number,
  heightCm: number
): { value: number; ibw: number; kind: "actual" | "ideal" | "adjusted" } {
  const ibw = idealBodyWeight(sex, heightCm);
  if (actualKg < ibw) return { value: actualKg, ibw, kind: "actual" };
  if (actualKg > 1.2 * ibw) {
    const adj = ibw + 0.4 * (actualKg - ibw);
    return { value: adj, ibw, kind: "adjusted" };
  }
  return { value: ibw, ibw, kind: "ideal" };
}

// ------------------------------------------------------------
// Estadio KDIGO por categoría de TFG/CrCl (mL/min[/1.73 m²])
// ------------------------------------------------------------
interface Stage {
  code: string;
  range: string;
  label: string;
  color: string;
}

function stageFor(crcl: number): Stage {
  if (crcl >= 90)
    return {
      code: "G1",
      range: "≥ 90",
      label: "Normal o alta",
      color: "var(--accent)",
    };
  if (crcl >= 60)
    return {
      code: "G2",
      range: "60-89",
      label: "Descenso leve",
      color: "var(--accent)",
    };
  if (crcl >= 45)
    return {
      code: "G3a",
      range: "45-59",
      label: "Descenso leve-moderado",
      color: "var(--amber)",
    };
  if (crcl >= 30)
    return {
      code: "G3b",
      range: "30-44",
      label: "Descenso moderado-grave",
      color: "var(--amber)",
    };
  if (crcl >= 15)
    return {
      code: "G4",
      range: "15-29",
      label: "Descenso grave",
      color: "var(--red)",
    };
  return {
    code: "G5",
    range: "< 15",
    label: "Fallo renal",
    color: "var(--red)",
  };
}

const ALL_STAGES: Stage[] = [
  { code: "G1", range: "≥ 90", label: "Normal o alta", color: "var(--accent)" },
  { code: "G2", range: "60-89", label: "Descenso leve", color: "var(--accent)" },
  {
    code: "G3a",
    range: "45-59",
    label: "Descenso leve-moderado",
    color: "var(--amber)",
  },
  {
    code: "G3b",
    range: "30-44",
    label: "Descenso moderado-grave",
    color: "var(--amber)",
  },
  { code: "G4", range: "15-29", label: "Descenso grave", color: "var(--red)" },
  { code: "G5", range: "< 15", label: "Fallo renal", color: "var(--red)" },
];

// ------------------------------------------------------------
// Implicaciones de ajuste de dosis renal (perioperatorias)
// Se muestran según el CrCl calculado. Umbrales de fichas
// técnicas / UpToDate; texto conservador y accionable.
// ------------------------------------------------------------
interface RenalNote {
  drug: string;
  color: string;
  text: string;
}

function renalNotes(crcl: number): RenalNote[] {
  const notes: RenalNote[] = [];

  // Sugammadex — no recomendado en IR grave (CrCl < 30)
  if (crcl < 30) {
    notes.push({
      drug: "Sugammadex",
      color: "var(--red)",
      text: "CrCl < 30 mL/min: NO recomendado (no se elimina de forma fiable; complejo sugammadex-rocuronio no dializable de forma eficaz por hemodiálisis estándar). Preferir reversión/estrategia alternativa.",
    });
  } else {
    notes.push({
      drug: "Sugammadex",
      color: "var(--accent)",
      text: "CrCl ≥ 30 mL/min: dosis estándar por peso y grado de bloqueo. Evitar si CrCl < 30.",
    });
  }

  // Morfina — metabolitos activos (M6G/M3G) de acumulación renal
  if (crcl < 30) {
    notes.push({
      drug: "Morfina",
      color: "var(--red)",
      text: "IR avanzada: acumulación de metabolitos activos (M6G → sedación/depresión respiratoria; M3G → neuroexcitación). Evitar o reducir marcadamente dosis e intervalos; preferir opioides sin metabolitos activos renales (fentanilo, hidromorfona con cautela).",
    });
  } else if (crcl < 60) {
    notes.push({
      drug: "Morfina",
      color: "var(--amber)",
      text: "IR moderada: los metabolitos (M6G/M3G) se acumulan; reducir dosis y/o alargar intervalo, titular con vigilancia estrecha de sedación.",
    });
  }

  // HBPM (enoxaparina) — acúmulo anti-Xa en IR grave
  if (crcl < 30) {
    notes.push({
      drug: "HBPM (enoxaparina)",
      color: "var(--red)",
      text: "CrCl < 30 mL/min: riesgo de acumulación (anti-Xa). Dosis terapéutica de enoxaparina se ajusta a 1 mg/kg cada 24 h; considerar anti-Xa o alternativa (HNF). Profilaxis también reducida.",
    });
  } else if (crcl < 60) {
    notes.push({
      drug: "HBPM (enoxaparina)",
      color: "var(--amber)",
      text: "IR moderada: vigilar acumulación en tratamientos prolongados; valorar anti-Xa en pacientes de riesgo. Relevante para el timing de neuroeje.",
    });
  }

  // Gabapentina / pregabalina — eliminación renal exclusiva
  if (crcl < 60) {
    notes.push({
      drug: "Gabapentina / pregabalina",
      color: crcl < 30 ? "var(--red)" : "var(--amber)",
      text:
        crcl < 15
          ? "Eliminación renal pura: dosis muy reducida (gabapentina ~100–300 mg/día; suplemento post-hemodiálisis). Alto riesgo de sedación."
          : crcl < 30
          ? "Reducir dosis (gabapentina ~200–700 mg/día aprox. según CrCl 15–29). Vigilar sedación aditiva con opioides perioperatorios."
          : "IR moderada (CrCl 30–59): reducir dosis diaria de gabapentina/pregabalina (~50 % o según CrCl). Riesgo de sedación.",
    });
  }

  return notes;
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function CrClClient() {
  // Edad/peso/talla/sexo vienen del PACIENTE ACTIVO (barra superior) y se
  // escriben de vuelta: editar aquí actualiza el paciente y todas las
  // calculadoras (bidireccional, sin estado local duplicado para esos campos).
  const { active, setActive } = usePatient();

  const [crText, setCrText] = useState("");
  const [weightMode, setWeightMode] = useState<WeightMode>("actual");

  // Los inputs muestran el valor del contexto; onChange escribe al paciente.
  const ageText = numToText(active.ageYears);
  const weightText = numToText(active.weightKg);
  const heightText = numToText(active.heightCm);
  const sex: Sex = active.sex;

  const age = active.ageYears;
  const weight = active.weightKg;
  const cr = useMemo(() => parseNumber(crText), [crText]);
  const height = active.heightCm;

  // Validación de rangos fisiológicos razonables
  const ageValid = age !== null && age >= 18 && age <= 120;
  const weightValid = weight !== null && weight > 0 && weight <= 400;
  const crValid = cr !== null && cr > 0 && cr <= 30;
  const heightValid = height !== null && height >= 120 && height <= 230;

  // Peso a usar en la fórmula según el modo
  const chosenWeight = useMemo(() => {
    if (!weightValid || weight === null) return null;
    if (weightMode === "actual") {
      return { value: weight, ibw: null as number | null, kind: "actual" as const };
    }
    // modo ideal/ajustado necesita talla válida
    if (!heightValid || height === null) return null;
    return dosingWeight(sex, weight, height);
  }, [weightMode, weight, weightValid, height, heightValid, sex]);

  const crcl = useMemo(() => {
    if (!ageValid || !crValid || chosenWeight === null || age === null || cr === null)
      return null;
    // CrCl = (140 − edad) × peso × (0.85 si mujer) / (72 × Cr)
    const sexFactor = sex === "female" ? 0.85 : 1;
    const value = ((140 - age) * chosenWeight.value * sexFactor) / (72 * cr);
    return value > 0 ? value : 0;
  }, [ageValid, crValid, chosenWeight, age, cr, sex]);

  const stage = useMemo(() => (crcl !== null ? stageFor(crcl) : null), [crcl]);
  const notes = useMemo(() => (crcl !== null ? renalNotes(crcl) : []), [crcl]);

  // Limpia solo la creatinina (local); los datos antropométricos son del
  // paciente compartido y no se borran desde aquí para no afectar otras calcs.
  const clearAll = () => {
    setCrText("");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const needsHeight = weightMode === "ideal";

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./crcl.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Aclaramiento de creatinina
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
          Cockcroft-Gault · estadio KDIGO · ajuste de dosis renal
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el riñón no lee la ficha técnica; tú sí"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          {/* Edad/peso/talla/sexo = paciente activo compartido (bidireccional) */}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}
          >
            {"// edad · peso · talla · sexo usan el paciente activo (barra superior); editarlos aquí lo actualiza en todas las calculadoras"}
          </div>

          {/* Sexo (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Sexo
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
              {(["male", "female"] as Sex[]).map((s) => (
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
                  {s === "female" ? " (×0.85)" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Edad / Peso / Creatinina */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="mono" style={labelStyle}>
                Edad (años)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="68"
                value={ageText}
                onChange={(e) => setActive({ ageYears: parseNumber(e.target.value) })}
                min={0}
                step="any"
              />
            </div>
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
                onChange={(e) => setActive({ weightKg: parseNumber(e.target.value) })}
                min={0}
                step="any"
              />
            </div>
            <div>
              <label className="mono" style={labelStyle}>
                Cr sérica (mg/dL)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="1.1"
                value={crText}
                onChange={(e) => setCrText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
          </div>

          {/* Modo de peso (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Peso a usar en la fórmula
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
              {(["actual", "ideal"] as WeightMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setWeightMode(m)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: m === weightMode ? "var(--accent)" : "var(--bg-1)",
                    color: m === weightMode ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {WEIGHT_MODE_LABEL[m]}
                </button>
              ))}
            </div>
          </div>

          {/* Talla (solo en modo ideal/ajustado) */}
          {needsHeight ? (
            <div>
              <label className="mono" style={labelStyle}>
                Talla (cm) — para peso ideal/ajustado
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="170"
                value={heightText}
                onChange={(e) => setActive({ heightCm: parseNumber(e.target.value) })}
                min={0}
                step="any"
              />
            </div>
          ) : null}

          {/* Nota de peso */}
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}
          >
            {"// en obesidad el peso real sobreestima el CrCl; usar peso ideal (Devine)"}
            <br />
            {"// o ajustado si el real supera 1.2× el ideal (obesos)"}
            {chosenWeight !== null && chosenWeight.ibw !== null ? (
              <>
                <br />
                {`// IBW = ${chosenWeight.ibw.toFixed(
                  1
                )} kg · peso aplicado = ${chosenWeight.value.toFixed(1)} kg (${
                  chosenWeight.kind === "adjusted"
                    ? "ajustado"
                    : chosenWeight.kind === "ideal"
                    ? "ideal"
                    : "real, < ideal"
                })`}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* ==================== RESULTADO ==================== */}
      {crcl !== null && stage ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* CrCl grande */}
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
                Aclaramiento de creatinina
              </div>
              <div className="calc-result" style={{ color: stage.color }}>
                {crcl.toFixed(1)}
                <span
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "1rem" }}
                >
                  {" "}
                  mL/min
                </span>
              </div>
            </div>

            {/* Estadio */}
            <div
              className="panel"
              style={{
                borderLeft: `3px solid ${stage.color}`,
                background: "var(--bg-1)",
              }}
            >
              <div className="panel-body" style={{ display: "grid", gap: "0.3rem" }}>
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
                      color: stage.color,
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    Estadio {stage.code} — {stage.label}
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
                    KDIGO · {stage.range} mL/min
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
                  Categoría de función renal según las bandas de TFG de KDIGO
                  2012, aplicadas al CrCl de Cockcroft-Gault.
                </p>
              </div>
            </div>

            {/* Implicaciones de ajuste renal */}
            {notes.length > 0 ? (
              <div style={{ display: "grid", gap: "0.5rem" }}>
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Ajuste de dosis renal (ejemplos perioperatorios)
                </div>
                {notes.map((n) => (
                  <div
                    key={n.drug}
                    className="panel"
                    style={{
                      borderLeft: `3px solid ${n.color}`,
                      background: "var(--bg-1)",
                    }}
                  >
                    <div
                      className="panel-body"
                      style={{ display: "grid", gap: "0.2rem" }}
                    >
                      <span
                        className="mono"
                        style={{
                          color: n.color,
                          fontWeight: 700,
                          fontSize: "0.72rem",
                        }}
                      >
                        {n.drug}
                      </span>
                      <p
                        style={{
                          color: "var(--text-1)",
                          fontSize: "0.74rem",
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {n.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.62rem",
                  lineHeight: 1.6,
                }}
              >
                {"// función renal conservada: sin ajustes renales mayores en los ejemplos listados"}
                <br />
                {"// aun así, verifica siempre la ficha técnica del fármaco concreto"}
              </div>
            )}
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
          Ingresa edad (18–120 a), peso ({">"}0 kg), Cr sérica ({">"}0 mg/dL)
          {needsHeight ? " y talla (120–230 cm)" : ""} para calcular.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// datos fuera de rango fisiológico no computan"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button type="button" onClick={clearAll} className="btn btn-outline btn-sm">
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIA: estadios KDIGO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ESTADIOS DE FUNCIÓN RENAL (KDIGO 2012)
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Estadio", "TFG/CrCl (mL/min)", "Descripción"].map((h) => (
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
                {ALL_STAGES.map((s) => (
                  <tr
                    key={s.code}
                    style={{
                      borderTop: "1px solid var(--border)",
                      background:
                        stage && stage.code === s.code
                          ? "var(--accent-glow)"
                          : "transparent",
                    }}
                  >
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: s.color,
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.code}
                    </td>
                    <td
                      className="mono"
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.range}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.74rem",
                        color: "var(--text-1)",
                      }}
                    >
                      {s.label}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              Cockcroft-Gault estima el CrCl en{" "}
              <strong>mL/min sin normalizar a superficie corporal</strong>; la
              mayoría de fichas técnicas dosifican por este valor, no por la TFG
              indexada (mL/min/1.73 m²) de CKD-EPI.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              En <strong>obesidad</strong> el peso real sobreestima el
              aclaramiento: usar peso ideal (Devine) o ajustado si el real supera
              1.2× el ideal. En caquexia/amputados, individualizar.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              Poco fiable con{" "}
              <strong>creatinina inestable</strong> (fallo renal agudo), masa
              muscular extrema, edad muy avanzada o embarazo. No sustituye la
              tendencia de la Cr ni el débito urinario.
            </li>
            <li style={{ marginBottom: "0" }}>
              Los ejemplos de ajuste (sugammadex, morfina, HBPM, gabapentina) son
              orientativos: <strong>verifica la ficha técnica</strong> y el
              contexto clínico de cada fármaco.
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
        Cockcroft DW, Gault MH. Prediction of creatinine clearance from serum
        creatinine. Nephron. 1976;16(1):31-41.
        <br />
        KDIGO CKD Work Group. KDIGO 2012 Clinical Practice Guideline for the
        Evaluation and Management of Chronic Kidney Disease. Kidney Int Suppl.
        2013;3(1):1-150.
        <br />
        Devine BJ. Gentamicin therapy. Drug Intell Clin Pharm. 1974;8:650-655.
        <br />
        Ficha técnica de sugammadex (Bridion), EMA/FDA. UpToDate: dosificación
        renal de gabapentina, opioides y HBPM.
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
        {"// Cockcroft-Gault — estimación, no medición directa del filtrado glomerular"}
        <br />
        {"// no sustituye el juicio clínico, la tendencia de la Cr ni la ficha técnica"}
        <br />
        {"// el riñón acumula el fármaco aunque tú hayas olvidado ajustar la dosis"}
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
