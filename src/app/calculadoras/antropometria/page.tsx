"use client";

// ============================================================
// Antropometría — port de la calculadora iOS a la web
// FUENTE: Calculator/ContentView.swift + Calculator/CalculatorEngine.swift
// Cada fórmula, coeficiente, umbral e interpretación se copia
// EXACTAMENTE del Swift. No inventar. No redondear distinto.
// ============================================================

import { useMemo, useState } from "react";
import { usePatient } from "@/lib/patient/PatientContext";

// ------------------------------------------------------------
// Tipos / enums — port de CalculatorEngine.swift:8-27
// ------------------------------------------------------------

// port de CalculatorEngine.swift:8-12
type Sex = "male" | "female";
const SEX_LABEL: Record<Sex, string> = {
  male: "Masculino",
  female: "Femenino",
};

// port de CalculatorEngine.swift:14-21
type Race = "white" | "mexican" | "hispanic" | "black" | "other";
const RACE_LABEL: Record<Race, string> = {
  white: "White/Caucasian",
  mexican: "Mexican American",
  hispanic: "Hispanic/Latin American",
  black: "Non-Hispanic Black/African",
  other: "Other",
};
const RACE_ORDER: Race[] = ["white", "mexican", "hispanic", "black", "other"];

// port de CalculatorEngine.swift:23-27
type TBVMethod = "age" | "sex";
const TBV_METHOD_LABEL: Record<TBVMethod, string> = {
  age: "Ajuste por edad",
  sex: "Ajuste por sexo",
};

// ------------------------------------------------------------
// Motor de cálculo — port de CalculatorEngine.swift:51-145
// ------------------------------------------------------------

interface CalcInputs {
  heightCm: number | null;
  weightKg: number | null;
  ageYears: number | null;
  sex: Sex;
  hctPercent: number | null;
  race: Race;
  targetBMI: number;
  tbvMethod: TBVMethod;
  cohortHctPercent: number;
}

interface CalcOutputs {
  bmi: number;
  bmiClass: string;
  ibw: number;
  lbm: number;
  tbvMl: number;
  abw: number;
  pspMl: number | null;
}

// port de CalculatorEngine.swift:85-88
function BMI(weightKg: number, heightCm: number): number {
  const hm = heightCm / 100.0;
  return weightKg / (hm * hm);
}

// port de CalculatorEngine.swift:90-93
function IBW(heightCm: number, targetBMI: number): number {
  const hm = heightCm / 100.0;
  return 2.2 * targetBMI + 3.5 * targetBMI * (hm - 1.5);
}

// port de CalculatorEngine.swift:95-118
function LBM(
  sex: Sex,
  ageYears: number,
  heightCm: number,
  weightKg: number,
  race: Race
): number {
  // port de CalculatorEngine.swift:96-98
  const menAdj: Record<Race, number> = {
    mexican: -0.441,
    hispanic: 0.32,
    black: 1.821,
    other: -0.784,
    white: 0,
  };
  // port de CalculatorEngine.swift:99-101
  const womenAdj: Record<Race, number> = {
    mexican: -0.448,
    hispanic: -0.047,
    black: -1.128,
    other: -0.384,
    white: 0,
  };

  switch (sex) {
    // port de CalculatorEngine.swift:104-109
    case "male":
      return (
        -14.729 -
        0.071 * ageYears +
        0.21 * heightCm +
        0.468 * weightKg +
        (menAdj[race] ?? 0)
      );
    // port de CalculatorEngine.swift:111-116
    case "female":
      return (
        -14.292 -
        0.046 * ageYears +
        0.201 * heightCm +
        0.347 * weightKg +
        (womenAdj[race] ?? 0)
      );
  }
}

// port de CalculatorEngine.swift:120-127
function TBV(
  ibwKg: number,
  sex: Sex,
  ageYears: number,
  method: TBVMethod
): number {
  switch (method) {
    case "age":
      return ibwKg * (ageYears < 65 ? 70 : 60);
    case "sex":
      return ibwKg * (sex === "male" ? 75 : 65);
  }
}

// port de CalculatorEngine.swift:129-131
function PSP(
  tbvMl: number,
  hctPercent: number,
  cohortHctPercent: number
): number {
  // Clamp a >=0: si el Hct del paciente ya está por debajo del objetivo/cohorte,
  // no hay margen de pérdida permisible (evita mostrar valores negativos absurdos).
  return Math.max(0, tbvMl * ((hctPercent - cohortHctPercent) / hctPercent));
}

// port de CalculatorEngine.swift:133-135
function ABW(ibwKg: number, weightKg: number): number {
  return weightKg <= ibwKg ? weightKg : ibwKg + 0.4 * (weightKg - ibwKg);
}

// port de CalculatorEngine.swift:137-144
function classifyBMI(bmi: number): string {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 25) return "Normopeso";
  if (bmi < 30) return "Sobrepeso";
  if (bmi < 35) return "Obesidad clase 1";
  if (bmi < 40) return "Obesidad clase 2";
  return "Obesidad clase 3";
}

// port de CalculatorEngine.swift:53-83
function compute(input: CalcInputs): CalcOutputs | null {
  // guard: talla > 0, peso > 0, edad > 0, BMI objetivo > 0
  if (
    input.heightCm === null ||
    !(input.heightCm > 0) ||
    input.weightKg === null ||
    !(input.weightKg > 0) ||
    input.ageYears === null ||
    !(input.ageYears > 0) ||
    !(input.targetBMI > 0)
  ) {
    return null;
  }

  const h = input.heightCm;
  const w = input.weightKg;
  const a = input.ageYears;

  const bmi = BMI(w, h);
  const ibw = IBW(h, input.targetBMI);
  const lbm = LBM(input.sex, a, h, w, input.race);
  const tbv = TBV(ibw, input.sex, a, input.tbvMethod);
  const abw = ABW(ibw, w);

  let psp: number | null;
  if (input.hctPercent !== null && input.hctPercent > 0) {
    psp = PSP(tbv, input.hctPercent, input.cohortHctPercent);
  } else {
    psp = null;
  }

  return {
    bmi,
    bmiClass: classifyBMI(bmi),
    ibw,
    lbm,
    tbvMl: tbv,
    abw,
    pspMl: psp,
  };
}

// ------------------------------------------------------------
// Parsing — port de ContentView.swift:35-39
// acepta coma o punto como separador decimal
// ------------------------------------------------------------
function parseDouble(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// Cohorte Hcto: rango 10...40 — port de ContentView.swift:114
const COHORT_RANGE: number[] = Array.from({ length: 40 - 10 + 1 }, (_, i) => 10 + i);

// ------------------------------------------------------------
// Página
// ------------------------------------------------------------
export default function AntropometriaPage() {
  // Peso/talla/edad/sexo viven en el PACIENTE ACTIVO (barra superior).
  // Antropometría es el punto de ENTRADA: lee y escribe bidireccional +
  // reactivo, para que poblar aquí actualice la barra y toda calculadora.
  const { active, setActive } = usePatient();

  // Solo lo específico de esta calculadora es estado local.
  // port de ContentView.swift:18-28 (defaults: BMI objetivo "22", cohorte 30)
  const [hctText, setHctText] = useState("");
  const [targetBmiText, setTargetBmiText] = useState("22");
  const [cohortHct, setCohortHct] = useState(30);
  const [race, setRace] = useState<Race>("white");
  const [tbvMethod, setTbvMethod] = useState<TBVMethod>("age");

  // port de ContentView.swift:41-53
  const inputs: CalcInputs = useMemo(
    () => ({
      heightCm: active.heightCm,
      weightKg: active.weightKg,
      ageYears: active.ageYears,
      sex: active.sex,
      hctPercent: parseDouble(hctText),
      race,
      targetBMI: parseDouble(targetBmiText) ?? 22,
      tbvMethod,
      cohortHctPercent: cohortHct,
    }),
    [active.heightCm, active.weightKg, active.ageYears, active.sex, hctText, targetBmiText, race, tbvMethod, cohortHct]
  );

  // port de ContentView.swift:55
  const outputs = useMemo(() => compute(inputs), [inputs]);

  // port de ContentView.swift:85-89
  // Limpia el paciente activo (talla/peso/edad) + campos locales.
  const clearAll = () => {
    setActive({ heightCm: null, weightKg: null, ageYears: null });
    setHctText("");
    setTargetBmiText("22");
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
          <b>$</b> ./antropometria.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Antropometría</h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.25rem",
            lineHeight: 1.7,
          }}
        >
          IBW · LBM · ABW · VSC · PSP · clasificación IMC
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el paciente pesa lo que pesa; el fármaco se dosifica por lo que debería"}
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
            style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.7 }}
          >
            {"// usa el paciente activo (barra superior) — editar aquí actualiza la barra y todas las calculadoras"}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
            }}
          >
            {/* Talla */}
            <div>
              <label className="mono" style={labelStyle}>
                Talla (cm)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="170"
                value={active.heightCm ?? ""}
                onChange={(e) => setActive({ heightCm: parseDouble(e.target.value) })}
                min={0}
                step="any"
              />
            </div>

            {/* Peso real */}
            <div>
              <label className="mono" style={labelStyle}>
                Peso real (kg)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="72.5"
                value={active.weightKg ?? ""}
                onChange={(e) => setActive({ weightKg: parseDouble(e.target.value) })}
                min={0}
                step="any"
              />
            </div>

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
                value={active.ageYears ?? ""}
                onChange={(e) => setActive({ ageYears: parseDouble(e.target.value) })}
                min={0}
                step="any"
              />
            </div>

            {/* Hcto (opcional) */}
            <div>
              <label className="mono" style={labelStyle}>
                Hcto (%){" "}
                <span style={{ opacity: 0.5, textTransform: "none" }}>
                  — opcional (PSP)
                </span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="Opcional"
                value={hctText}
                onChange={(e) => setHctText(e.target.value)}
                min={0}
                step="any"
              />
            </div>

            {/* BMI objetivo */}
            <div>
              <label className="mono" style={labelStyle}>
                BMI objetivo
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="22"
                value={targetBmiText}
                onChange={(e) => setTargetBmiText(e.target.value)}
                min={0}
                step="any"
              />
            </div>

            {/* Sexo (segmented) — port de ContentView.swift:100-103 */}
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
                      background: s === active.sex ? "var(--accent)" : "var(--bg-1)",
                      color: s === active.sex ? "#000" : "var(--text-2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {SEX_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== CONFIGURACIÓN ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CONFIGURACIÓN
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          {/* Raza/Etnia — port de ContentView.swift:107-109 */}
          <div>
            <label className="mono" style={labelStyle}>
              Raza/Etnia{" "}
              <span style={{ opacity: 0.5, textTransform: "none" }}>
                — ajuste LBM
              </span>
            </label>
            <select
              className="calc-select mono"
              value={race}
              onChange={(e) => setRace(e.target.value as Race)}
            >
              {RACE_ORDER.map((r) => (
                <option key={r} value={r}>
                  {RACE_LABEL[r]}
                </option>
              ))}
            </select>
          </div>

          {/* Método VSC — port de ContentView.swift:110-112 */}
          <div>
            <label className="mono" style={labelStyle}>
              Método VSC
            </label>
            <select
              className="calc-select mono"
              value={tbvMethod}
              onChange={(e) => setTbvMethod(e.target.value as TBVMethod)}
            >
              {(Object.keys(TBV_METHOD_LABEL) as TBVMethod[]).map((m) => (
                <option key={m} value={m}>
                  {TBV_METHOD_LABEL[m]}
                </option>
              ))}
            </select>
          </div>

          {/* Hcto cohorte (PSP) — port de ContentView.swift:113-115 (rango 10...40) */}
          <div>
            <label className="mono" style={labelStyle}>
              Hcto cohorte (PSP)
            </label>
            <select
              className="calc-select mono"
              value={cohortHct}
              onChange={(e) => setCohortHct(Number(e.target.value))}
            >
              {COHORT_RANGE.map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ==================== RESULTADOS ==================== */}
      {/* port de ContentView.swift:118-145 — solo si hay outputs */}
      {outputs ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADOS
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
            {/* IMC + clasificación — port de ContentView.swift:120 (%.2f) */}
            <ResultRow
              title="IMC"
              value={outputs.bmi.toFixed(2)}
              badge={outputs.bmiClass}
            />
            {/* IBW — port de ContentView.swift:121 (%.1f kg) */}
            <ResultRow title="IBW" value={`${outputs.ibw.toFixed(1)} kg`} />
            {/* LBM — port de ContentView.swift:122 (%.1f kg) */}
            <ResultRow title="LBM" value={`${outputs.lbm.toFixed(1)} kg`} />
            {/* ABW — port de ContentView.swift:123 (%.1f kg, badge "fentanilo") */}
            <ResultRow
              title="ABW"
              value={`${outputs.abw.toFixed(1)} kg`}
              badge="fentanilo"
            />
            {/* VSC — port de ContentView.swift:124 (%.0f mL) */}
            <ResultRow title="VSC" value={`${outputs.tbvMl.toFixed(0)} mL`} />

            {/* PSP — port de ContentView.swift:126-143 */}
            {outputs.pspMl !== null ? (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.6rem",
                  marginTop: "0.2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "0.5rem",
                  }}
                >
                  <span
                    className="mono"
                    style={{ color: "var(--text-1)", fontSize: "0.8rem" }}
                  >
                    PSP
                  </span>
                  {/* %.0f mL, en negrita, color acento */}
                  <span
                    className="mono"
                    style={{
                      color: "var(--accent)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                    }}
                  >
                    {outputs.pspMl.toFixed(0)} mL
                  </span>
                </div>
                {/* subtítulo — port de ContentView.swift:135 */}
                <div
                  className="mono"
                  style={{
                    color: "var(--text-3)",
                    fontSize: "0.55rem",
                    marginTop: "0.2rem",
                  }}
                >
                  VSC × (Hcto − {cohortHct}) / Hcto
                </div>
              </div>
            ) : (
              /* port de ContentView.swift:140-142 */
              <div
                className="mono"
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.6rem",
                  marginTop: "0.2rem",
                  color: "var(--text-3)",
                  fontSize: "0.65rem",
                }}
              >
                PSP: ingresa hematocrito para calcular
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Si faltan inputs, no mostrar resultados basura — hint */
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
          Ingresa talla, peso y edad para calcular.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin datos no hay antropometría, solo suposiciones"}
          </span>
        </div>
      )}

      {/* Limpiar — port de ContentView.swift:147-149 */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          limpiar campos
        </button>
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
        {"// IBW/LBM/ABW/VSC/PSP — fórmulas de literatura aceptada"}
        <br />
        {"// ajusta según respuesta clínica, comorbilidades y monitorización"}
        <br />
        {"// si algo sale mal, la culpa no es del app"}
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Fila de resultado — réplica de compactResult (ContentView.swift:180-197)
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
        }}
      >
        {value}
      </span>
    </div>
  );
}
