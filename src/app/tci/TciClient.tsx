"use client";

// ============================================================
// TciClient — Calculadora TCI/TIVA (target-controlled infusion)
//
// Simula un TCI de lazo abierto: dado un objetivo de concentración
// (plasma Cp o sitio efecto Ce) y un modelo PK poblacional publicado,
// calcula el bolo inicial y la velocidad de infusión de mantenimiento,
// muestra la trayectoria de Cp/Ce y estima el tiempo a despertar.
//
// SEGURIDAD: los coeficientes PK/ke0 viven en src/lib/tci/models.ts
// (cada uno citado). El motor en src/lib/tci/engine.ts es agnóstico.
// Este archivo es solo presentación + I/O del paciente activo.
//
// El paciente (peso/edad/sexo/talla) se LEE del paciente activo vía
// usePatient(); editar aquí lo actualiza en todas las calculadoras.
// ============================================================

import { useMemo, useState } from "react";
import { usePatient } from "@/lib/patient/PatientContext";
import ClinicalConsentGate from "@/components/ClinicalConsentGate";
import ProGateClient from "@/components/ProGateClient";
import { PRO_FEATURES } from "@/lib/gating";
import {
  TCI_MODELS,
  WEIGHT_DOSE_MODELS,
  tciModelsByDrug,
  predictBis,
  type TciModel,
  type Cov,
} from "@/lib/tci/models";
import {
  simulate,
  finalStateOf,
  microToRates,
  timeToThreshold,
  type TargetMode,
  type SimConfig,
} from "@/lib/tci/engine";

// Densidad de fármaco (mg/mL) de la solución en jeringa/bomba, para
// convertir masa→volumen (mL/h). Valores por defecto de presentaciones
// habituales; el usuario puede cambiarlos.
const DEFAULT_CONC: Record<string, number> = {
  Propofol: 10, // 1% = 10 mg/mL (también existe 2% = 20)
  Remifentanilo: 0.05, // 50 µg/mL diluido (2 mg en 40 mL) → 0.05 mg/mL
  Fentanilo: 0.05, // 50 µg/mL (ampolla estándar) → 0.05 mg/mL
  Sufentanilo: 0.005, // 5 µg/mL (diluido, 250 µg en 50 mL) → 0.005 mg/mL
  Alfentanilo: 0.5, // 500 µg/mL (0.5 mg/mL, ampolla estándar)
  Dexmedetomidina: 0.004, // 4 µg/mL (200 µg en 50 mL) → 0.004 mg/mL
  Ketamina: 10, // 10 mg/mL diluida (varía)
};

function parseNum(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// Masa (unidad natural: mg o µg) → mL, dada la concentración de la jeringa
// en mg/mL. Para fármacos en µg, convertimos µg→mg (÷1000) primero.
function massToMl(massNatural: number, unit: "mg" | "mcg", concMgMl: number): number {
  const mg = unit === "mcg" ? massNatural / 1000 : massNatural;
  return concMgMl > 0 ? mg / concMgMl : 0;
}

const labelStyle: React.CSSProperties = {
  color: "var(--text-3)",
  fontSize: "0.6rem",
  display: "block",
  marginBottom: "0.25rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
};

export default function TciClient({ isPro = false }: { isPro?: boolean }) {
  const { active, setActive } = usePatient();

  // --- Paciente (leído/escrito del contexto) ---
  const weightText = active.weightKg != null ? String(active.weightKg) : "";
  const ageText = active.ageYears != null ? String(active.ageYears) : "";
  const heightText = active.heightCm != null ? String(active.heightCm) : "";
  const sex = active.sex;
  const setWeightText = (t: string) => setActive({ weightKg: parseNum(t) });
  const setAgeText = (t: string) => setActive({ ageYears: parseNum(t) });
  const setHeightText = (t: string) => setActive({ heightCm: parseNum(t) });
  const setSex = (s: "male" | "female") => setActive({ sex: s });

  // --- Selección de modelo ---
  const grouped = useMemo(() => tciModelsByDrug(), []);
  const [modelId, setModelId] = useState<string>(TCI_MODELS[0]!.id);
  const model: TciModel = useMemo(
    () => TCI_MODELS.find((m) => m.id === modelId) ?? TCI_MODELS[0]!,
    [modelId],
  );

  // --- Objetivo y modo ---
  const [targetText, setTargetText] = useState("3.0");
  const [mode, setMode] = useState<TargetMode>("effect");
  const [durationText, setDurationText] = useState("10"); // min a simular

  // Si el modelo no tiene effect-site, forzamos plasma.
  const effectiveMode: TargetMode = model.effectSite ? mode : "plasma";

  // --- Concentración de jeringa (mg/mL) ---
  const [concText, setConcText] = useState<string>(
    String(DEFAULT_CONC[model.drug] ?? 10),
  );
  // Al cambiar de fármaco, resetea la concentración por defecto.
  const [lastDrug, setLastDrug] = useState(model.drug);
  if (model.drug !== lastDrug) {
    setLastDrug(model.drug);
    setConcText(String(DEFAULT_CONC[model.drug] ?? 10));
  }

  const weightKg = parseNum(weightText);
  const ageYears = parseNum(ageText);
  const heightCm = parseNum(heightText);
  const target = parseNum(targetText);
  const durationMin = parseNum(durationText) ?? 10;
  const concMgMl = parseNum(concText) ?? DEFAULT_CONC[model.drug] ?? 10;

  // ¿Tenemos las covariables que el modelo necesita?
  // Todos necesitan peso. Schnider/Minto/Eleveld necesitan edad+talla+sexo.
  // Maitre (alfentanilo) necesita edad+sexo (NO talla).
  const needsFull = ["propofol-schnider", "remifentanil-minto", "propofol-eleveld", "remifentanil-eleveld", "propofol-paedfusor", "propofol-kataria"].includes(model.id);
  const needsAgeSex = needsFull || model.id === "alfentanil-maitre";
  const covOk =
    weightKg != null &&
    weightKg > 0 &&
    (!needsAgeSex || (ageYears != null && ageYears > 0)) &&
    (!needsFull || (heightCm != null && heightCm > 0));

  const result = useMemo(() => {
    if (!covOk || target == null || !(target > 0)) return null;
    const cov: Cov = {
      weightKg: weightKg!,
      ageYears: ageYears ?? 40,
      heightCm: heightCm ?? 170,
      sex,
    };
    const micro = model.micro(cov);
    // Guardas de sanidad numérica (parámetros negativos ⇒ modelo fuera de rango).
    if (
      !(micro.V1 > 0) ||
      !(micro.CL > 0) ||
      micro.V2 < 0 ||
      micro.V3 < 0 ||
      micro.Q2 < 0 ||
      micro.Q3 < 0
    ) {
      return { invalid: true as const, micro };
    }
    const targetPerL = target * model.targetToPerL;
    const cfg: SimConfig = {
      target: targetPerL,
      mode: effectiveMode,
      durationMin,
      dtMin: 1 / 60,
    };
    const sim = simulate(micro, cfg);
    const finalState = finalStateOf(micro, cfg);
    const rates = microToRates(micro);

    // Tiempo a despertar: desde estado final, detener infusión y ver cuándo
    // Ce (o Cp) cae bajo el umbral de despertar del modelo (si definido).
    let wakeMin: number | null = null;
    if (model.wakeThreshold != null) {
      wakeMin = timeToThreshold(
        finalState,
        rates,
        model.wakeThreshold,
        model.effectSite,
        180,
      );
    }

    // Mantenimiento "actual" al final del horizonte (última muestra con inf>0
    // que no sea el pico de bolo). Tomamos la última muestra.
    const lastSample = sim.samples[sim.samples.length - 1]!;
    // Muestra a mitad y a 5 min para la tabla.
    const pick = (t: number) =>
      sim.samples.reduce((a, b) =>
        Math.abs(b.tMin - t) < Math.abs(a.tMin - t) ? b : a,
      );

    // BIS predicho (solo propofol · Eleveld). Para la Ce actual (última muestra)
    // y como serie a lo largo del tiempo (para la curva).
    let bisNow: number | null = null;
    let bisSeries: { tMin: number; bis: number }[] | null = null;
    if (model.bisPd) {
      const ceForBis = (s: { cp: number; ce: number }) =>
        (model.effectSite ? s.ce : s.cp) / model.targetToPerL; // → concUnit
      bisNow = predictBis(model.bisPd, cov, ceForBis(lastSample));
      bisSeries = sim.samples.map((s) => ({
        tMin: s.tMin,
        bis: predictBis(model.bisPd!, cov, ceForBis(s)),
      }));
    }

    return {
      invalid: false as const,
      micro,
      sim,
      rates,
      wakeMin,
      lastSample,
      at1: pick(1),
      at5: pick(5),
      at10: pick(10),
      targetPerL,
      bisNow,
      bisSeries,
    };
  }, [covOk, target, weightKg, ageYears, heightCm, sex, model, effectiveMode, durationMin]);

  // Fármacos NO-TCI (dosis por peso) — sección informativa aparte.
  const [showNonTci, setShowNonTci] = useState(false);

  const unitLabel = model.unit === "mcg" ? "µg" : "mg";
  // Formato de tasa de infusión: masa/min → por kg/h o µg/kg/min según fármaco.
  const rateToPerKgHr = (massPerMin: number): number =>
    weightKg && weightKg > 0 ? (massPerMin * 60) / weightKg : 0;

  return (
    <ProGateClient feature={PRO_FEATURES.TCI} isPro={isPro}>
      <ClinicalConsentGate />
      <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 780 }}>
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./tci.sh --target-controlled-infusion
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>TCI / TIVA</h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.25rem", lineHeight: 1.7 }}
        >
          infusión controlada por objetivo · modelos PK poblacionales · plasma / sitio-efecto
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// bolo + velocidad de mantenimiento para alcanzar/mantener Cp o Ce"}
          </span>
        </p>
      </div>

      {/* CAVEAT */}
      <div className="panel" style={{ borderLeft: "3px solid var(--amber)", marginBottom: "1rem" }}>
        <div className="panel-body" style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
          <span style={{ color: "var(--amber)", fontSize: "0.9rem" }}>⚠</span>
          <p style={{ color: "var(--text-1)", fontSize: "0.72rem", lineHeight: 1.65, margin: 0 }}>
            Simulación <strong>poblacional</strong> de un TCI de lazo abierto. La
            variabilidad interindividual es grande. No sustituye a una bomba TCI
            certificada ni a la monitorización (BIS/entropía, hemodinámica,
            clínica). Los modelos asumen función hepática/cardíaca normal; no
            válidos en shock, hepatopatía severa u obesidad fuera de rango.{" "}
            <strong>El médico titula y es responsable.</strong>
          </p>
        </div>
      </div>

      {/* MODELO */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FÁRMACO Y MODELO
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label className="mono" style={labelStyle}>
              Modelo TCI <span style={{ opacity: 0.5, textTransform: "none" }}>— set PK poblacional publicado</span>
            </label>
            <select className="calc-select mono" value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {grouped.map((g) => (
                <optgroup key={g.drug} label={g.drug}>
                  {g.models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.variant} — {m.note}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem", lineHeight: 1.5 }}>
              {model.citation}
            </div>
          </div>

          {model.covariateWarning ? (
            <div
              className="mono"
              style={{
                color: "var(--amber)",
                fontSize: "0.58rem",
                lineHeight: 1.5,
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--amber)",
                padding: "0.4rem 0.5rem",
              }}
            >
              ⚠ {model.covariateWarning}
            </div>
          ) : null}
        </div>
      </div>

      {/* PACIENTE */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PACIENTE
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5, opacity: 0.85 }}>
            {"// del "}
            <span style={{ color: "var(--cyan)" }}>paciente activo</span>
            {" — editar aquí lo actualiza en todas las calculadoras"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
            <div>
              <label className="mono" style={labelStyle}>Peso (kg)</label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="70" value={weightText} onChange={(e) => setWeightText(e.target.value)} min={0} step="any" />
            </div>
            <div>
              <label className="mono" style={labelStyle}>
                Edad (años){needsFull ? " *" : ""}
              </label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="40" value={ageText} onChange={(e) => setAgeText(e.target.value)} min={0} step="any" />
            </div>
            <div>
              <label className="mono" style={labelStyle}>
                Talla (cm){needsFull ? " *" : ""}
              </label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="170" value={heightText} onChange={(e) => setHeightText(e.target.value)} min={0} step="any" />
            </div>
          </div>
          <div>
            <label className="mono" style={labelStyle}>Sexo{needsFull ? " *" : ""}</label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className="mono"
                  style={{
                    flex: 1, padding: "0.45rem", fontSize: "0.7rem", cursor: "pointer",
                    background: sex === s ? "var(--accent)" : "var(--bg-1)",
                    color: sex === s ? "#000" : "var(--text-2)",
                    border: `1px solid ${sex === s ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {s === "male" ? "Masculino" : "Femenino"}
                </button>
              ))}
            </div>
          </div>
          {needsFull ? (
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.52rem", opacity: 0.7 }}>
              {"* este modelo requiere edad, talla y sexo (covariables)"}
            </div>
          ) : null}
        </div>
      </div>

      {/* OBJETIVO */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> OBJETIVO DE CONCENTRACIÓN
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          {/* Modo plasma / effect */}
          <div>
            <label className="mono" style={labelStyle}>Modo de objetivo</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
              {(["plasma", "effect"] as const).map((m) => {
                const disabled = m === "effect" && !model.effectSite;
                const activeMode = effectiveMode === m;
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={disabled}
                    onClick={() => setMode(m)}
                    className="mono"
                    title={disabled ? "este modelo no tiene ke0 publicado → solo plasma" : ""}
                    style={{
                      padding: "0.5rem 0.25rem", fontSize: "0.62rem", cursor: disabled ? "not-allowed" : "pointer",
                      border: "none",
                      opacity: disabled ? 0.4 : 1,
                      background: activeMode ? "var(--accent)" : "var(--bg-1)",
                      color: activeMode ? "#000" : "var(--text-2)",
                    }}
                  >
                    {m === "plasma" ? "plasma (Cp)" : "sitio efecto (Ce)"}
                  </button>
                );
              })}
            </div>
            {!model.effectSite ? (
              <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.52rem", marginTop: "0.3rem", opacity: 0.8 }}>
                {"// este modelo no incluye ke0 verificado → solo modo plasma"}
              </div>
            ) : null}
            {/* Aviso de ke0 no validado / debatido / pump-dependiente */}
            {model.effectSite && model.ke0Warning && effectiveMode === "effect" ? (
              <div
                className="mono"
                style={{
                  color: "var(--amber)",
                  fontSize: "0.56rem",
                  lineHeight: 1.5,
                  marginTop: "0.4rem",
                  background: "var(--bg-1)",
                  border: "1px solid var(--border)",
                  borderLeft: "2px solid var(--amber)",
                  padding: "0.4rem 0.5rem",
                }}
              >
                ⚠ nota sobre el ke0 (effect-site) — {model.ke0Warning}
              </div>
            ) : null}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div>
              <label className="mono" style={labelStyle}>
                Objetivo {effectiveMode === "effect" ? "Ce" : "Cp"} ({model.concUnit})
              </label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="3.0" value={targetText} onChange={(e) => setTargetText(e.target.value)} min={0} step="any" />
            </div>
            <div>
              <label className="mono" style={labelStyle}>Simular durante (min)</label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="10" value={durationText} onChange={(e) => setDurationText(e.target.value)} min={1} step="any" />
            </div>
          </div>

          <div>
            <label className="mono" style={labelStyle}>Concentración de la jeringa (mg/mL) — para mL/h</label>
            <input type="number" inputMode="decimal" className="calc-input mono" placeholder="10" value={concText} onChange={(e) => setConcText(e.target.value)} min={0} step="any" />
          </div>

          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}>
            {model.refTarget}
          </div>
        </div>
      </div>

      {/* RESULTADOS */}
      {result && !result.invalid ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> PLAN DE INFUSIÓN
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
            {/* Bolo inicial */}
            <ResultRow
              title="Bolo de inducción / carga"
              value={`${result.sim.initialBolus.toFixed(result.sim.initialBolus < 10 ? 2 : 1)} ${unitLabel}`}
              sub={`${(result.sim.initialBolus / (weightKg || 1)).toFixed(2)} ${unitLabel}/kg · ${massToMl(result.sim.initialBolus, model.unit, concMgMl).toFixed(1)} mL a ${concMgMl} mg/mL`}
              accent
            />

            {/* Velocidad de mantenimiento (última muestra) */}
            <ResultRow
              title={`Infusión a los ${Math.round(result.lastSample.tMin)} min`}
              value={`${rateToPerKgHr(result.lastSample.infRate) < 0.01 ? "≈0" : rateToPerKgHr(result.lastSample.infRate).toFixed(2)} ${unitLabel}/kg/h`}
              sub={`${massToMl(result.lastSample.infRate * 60, model.unit, concMgMl).toFixed(1)} mL/h · Cp ${result.lastSample.cp.toFixed(2)} ${model.concUnit}${model.effectSite ? ` · Ce ${result.lastSample.ce.toFixed(2)}` : ""}`}
            />

            {/* Tiempo a despertar */}
            {model.wakeThreshold != null ? (
              <ResultRow
                title="Tiempo estimado a despertar"
                value={
                  result.wakeMin == null
                    ? ">180 min"
                    : result.wakeMin < 1
                      ? "<1 min"
                      : `${result.wakeMin.toFixed(1)} min`
                }
                sub={`al detener infusión, ${model.effectSite ? "Ce" : "Cp"} < ${model.wakeThreshold} ${model.concUnit} (umbral orientativo)`}
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* GRÁFICA Cp / Ce */}
      {result && !result.invalid ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> GRÁFICA · CONCENTRACIÓN vs TIEMPO
          </div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <TciChart
              samples={result.sim.samples}
              target={result.targetPerL}
              concUnit={model.concUnit}
              showCe={model.effectSite}
              bisSeries={result.bisSeries}
            />
          </div>
        </div>
      ) : null}

      {/* BIS PREDICHO (solo propofol · Eleveld) */}
      {result && !result.invalid && model.bisPd && result.bisNow != null ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> BIS PREDICHO (poblacional)
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span className="mono" style={{ color: "var(--text-1)", fontSize: "0.8rem" }}>
                BIS a {Math.round(result.lastSample.tMin)} min (Ce {result.lastSample.ce.toFixed(2)} {model.concUnit})
              </span>
              <span style={{ flex: 1 }} />
              <span
                className="mono"
                style={{
                  color: "var(--magenta, var(--accent))",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                  whiteSpace: "nowrap",
                }}
              >
                {Math.round(result.bisNow)}
              </span>
            </div>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}>
              {"// Eleveld 2018: BIS = 93·(1 − Ce^γ/(Ce50^γ+Ce^γ)); γ asimétrico 1.89/1.47; Ce50 baja con la edad."}
              {" "}Anestesia ~BIS 40-60; sedación ~70-85.
            </div>
            <div
              className="mono"
              style={{
                color: "var(--amber)",
                fontSize: "0.58rem",
                lineHeight: 1.5,
                background: "var(--bg-1)",
                border: "1px solid var(--border)",
                borderLeft: "2px solid var(--amber)",
                padding: "0.4rem 0.5rem",
              }}
            >
              ⚠ BIS predicho poblacional — no sustituye la monitorización real de BIS/entropía.
            </div>
          </div>
        </div>
      ) : null}

      {/* TRAYECTORIA */}
      {result && !result.invalid ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> TRAYECTORIA (Cp / Ce · infusión)
          </div>
          <div className="panel-body" style={{ overflowX: "auto" }}>
            <table className="mono" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.66rem", minWidth: 420 }}>
              <thead>
                <tr style={{ color: "var(--text-3)", textAlign: "right" }}>
                  <th style={thStyle}>t (min)</th>
                  <th style={thStyle}>Cp ({model.concUnit})</th>
                  {model.effectSite ? <th style={thStyle}>Ce ({model.concUnit})</th> : null}
                  <th style={thStyle}>{unitLabel}/kg/h</th>
                  <th style={thStyle}>mL/h</th>
                </tr>
              </thead>
              <tbody>
                {[result.at1, result.at5, result.at10, result.lastSample]
                  .filter((s, i, arr) => arr.findIndex((x) => x.tMin === s.tMin) === i)
                  .sort((a, b) => a.tMin - b.tMin)
                  .map((s) => (
                    <tr key={s.tMin} style={{ borderTop: "1px solid var(--border)", textAlign: "right", color: "var(--text-1)" }}>
                      <td style={tdStyle}>{s.tMin.toFixed(1)}</td>
                      <td style={tdStyle}>{s.cp.toFixed(2)}</td>
                      {model.effectSite ? <td style={{ ...tdStyle, color: "var(--cyan)" }}>{s.ce.toFixed(2)}</td> : null}
                      <td style={tdStyle}>{rateToPerKgHr(s.infRate) < 0.01 ? "≈0" : rateToPerKgHr(s.infRate).toFixed(2)}</td>
                      <td style={tdStyle}>{massToMl(s.infRate * 60, model.unit, concMgMl).toFixed(1)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.52rem", marginTop: "0.5rem", lineHeight: 1.5 }}>
              {"// dosis total simulada: "}
              {result.sim.totalDose.toFixed(result.sim.totalDose < 10 ? 2 : 1)} {unitLabel}
              {effectiveMode === "effect"
                ? " · en effect-site el plasma se sobredosifica al inicio (overpressure) para acelerar la Ce"
                : ""}
            </div>
          </div>
        </div>
      ) : null}

      {/* PARÁMETROS DEL MODELO */}
      {result ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> PARÁMETROS PK DEL PACIENTE
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.35rem" }}>
            <PkRow label="V1 (central)" value={`${result.micro.V1.toFixed(2)} L`} />
            <PkRow label="V2" value={`${result.micro.V2.toFixed(2)} L`} />
            {result.micro.V3 > 0 ? <PkRow label="V3" value={`${result.micro.V3.toFixed(2)} L`} /> : null}
            <PkRow label="CL (eliminación)" value={`${result.micro.CL.toFixed(3)} L/min`} />
            <PkRow label="Q2" value={`${result.micro.Q2.toFixed(3)} L/min`} />
            {result.micro.Q3 > 0 ? <PkRow label="Q3" value={`${result.micro.Q3.toFixed(3)} L/min`} /> : null}
            {result.micro.ke0 > 0 ? <PkRow label="ke0 (equilibrio Ce)" value={`${result.micro.ke0.toFixed(3)} min⁻¹`} /> : null}
            {result.invalid ? (
              <div className="mono" style={{ color: "var(--red)", fontSize: "0.62rem", marginTop: "0.3rem", lineHeight: 1.5 }}>
                ⚠ El modelo produce parámetros no válidos con estas covariables
                (probable IMC/edad fuera de rango — p.ej. LBM de James negativa).
                No se muestra plan de infusión: usa otro modelo.
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mono" style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-3)", fontSize: "0.7rem", border: "1px dashed var(--border)", background: "var(--bg-1)", marginBottom: "1rem" }}>
          {needsFull
            ? "Ingresa peso, edad y talla válidos para simular."
            : "Ingresa un peso válido para simular."}
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>{"// sin covariables no hay farmacocinética"}</span>
        </div>
      )}

      {/* FÁRMACOS NO-TCI */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <button
          type="button"
          className="panel-header"
          onClick={() => setShowNonTci((v) => !v)}
          style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}
        >
          <span className="dot" style={{ background: "var(--text-3)", boxShadow: "none" }} /> FÁRMACOS SIN MODELO TCI — DOSIS POR PESO {showNonTci ? "▾" : "▸"}
        </button>
        {showNonTci ? (
          <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5, marginBottom: "0.2rem" }}>
              {"// no compartimental: se titula por efecto (TOF, ACT, magnesemia…), no por concentración diana"}
            </div>
            {WEIGHT_DOSE_MODELS.map((d) => {
              const w = weightKg && weightKg > 0 ? weightKg : null;
              const isUI = d.id === "heparina"; // heparina en UI/kg
              const massUnit = isUI ? "UI" : d.unit === "mcg" ? "µg" : "mg";
              return (
                <div key={d.id} style={{ borderTop: "1px solid var(--border)", paddingTop: "0.45rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
                    <span className="mono" style={{ color: "var(--text-1)", fontSize: "0.78rem", fontWeight: 600 }}>{d.drug}</span>
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem" }}>{d.note} · no-TCI</span>
                  </div>
                  <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.62rem", marginTop: "0.2rem", lineHeight: 1.6 }}>
                    {d.bolusPerKg ? (
                      <div>
                        bolo {d.bolusPerKg[0]}–{d.bolusPerKg[1]} {d.id === "protamina" ? `mg/100 UI` : `${massUnit}/kg`}
                        {w && d.id !== "protamina" ? (
                          <span style={{ color: "var(--accent)" }}> → {(d.bolusPerKg[0] * w).toFixed(0)}–{(d.bolusPerKg[1] * w).toFixed(0)} {massUnit}</span>
                        ) : null}
                      </div>
                    ) : null}
                    {d.infusionPerKgHr ? (
                      <div>
                        infusión {d.infusionPerKgHr[0]}–{d.infusionPerKgHr[1]} {massUnit}/kg/h
                        {w ? (
                          <span style={{ color: "var(--accent)" }}> → {(d.infusionPerKgHr[0] * w).toFixed(1)}–{(d.infusionPerKgHr[1] * w).toFixed(1)} {massUnit}/h</span>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                  <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.5rem", marginTop: "0.15rem", lineHeight: 1.5, opacity: 0.85 }}>
                    {d.reason} · {d.citation}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {/* NOTAS DE MODELO */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CÓMO FUNCIONA (Y QUÉ NO ES)
        </div>
        <div className="panel-body">
          <ul style={{ margin: "0 0 0 1.1rem", padding: 0, color: "var(--text-1)", fontSize: "0.76rem", lineHeight: 1.7 }}>
            <li style={{ marginBottom: "0.45rem" }}>
              Modelo mamilar de 3 compartimentos + sitio efecto (ke0), integrado
              numéricamente (Euler, Δt = 1 s). Esquema <strong>BET</strong> (Bolo +
              Eliminación + Transferencia) para alcanzar y mantener el objetivo.
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              <strong>Plasma-target</strong>: mantiene Cp = objetivo.{" "}
              <strong>Effect-site</strong> (Shafer-Gregg): sobredosifica el plasma
              (overpressure) para que la Ce alcance el objetivo lo antes posible sin
              sobrepasarlo, y luego mantiene.
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              Effect-site disponible en los modelos con <strong>ke0 publicado</strong>{" "}
              (propofol Schnider/Marsh/Eleveld; opioides Minto, Eleveld remi, Shafer
              fentanilo, Gepts sufentanilo, Maitre alfentanilo; dexmedetomidina y
              ketamina). Donde el ke0 es <strong>debatido, preliminar o
              pump-dependiente</strong> (dex → MOAA/S; ketamina → ANI analgésico;
              sufentanilo → según bomba; remi → ke0 de referencia sin ajuste de edad)
              se implementa igual pero con <strong>aviso visible</strong>. Los sets sin
              ningún ke0 confirmado (Eleveld/Paedfusor/Kataria peds, ketamina Kamp,
              dex Morse) siguen en plasma-target — no inventamos ke0.
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              El &quot;tiempo a despertar&quot; es orientativo: al parar la infusión,
              cuánto tarda la concentración de efecto en caer bajo un umbral típico.
              No predice el despertar real de un paciente concreto.
            </li>
            <li>
              Esta herramienta <strong>no es una bomba TCI certificada</strong>. Las
              cifras son un apoyo al razonamiento; la bomba, el BIS y la clínica mandan.
            </li>
          </ul>
        </div>
      </div>

      {/* REFERENCIAS */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> REFERENCIAS
        </div>
        <div className="panel-body mono" style={{ color: "var(--text-2)", fontSize: "0.58rem", lineHeight: 1.8, display: "grid", gap: "0.3rem" }}>
          <div>1. Schnider TW, et al. The influence of method of administration and covariates on the pharmacokinetics of propofol. Anesthesiology. 1998;88(5):1170-82.</div>
          <div>2. Schnider TW, et al. The influence of age on propofol pharmacodynamics. Anesthesiology. 1999;90(6):1502-16.</div>
          <div>3. Marsh B, et al. Pharmacokinetic model driven infusion of propofol in children. Br J Anaesth. 1991;67(1):41-48.</div>
          <div>4. Minto CF, Schnider TW, et al. Influence of age and gender on the PK/PD of remifentanil. Anesthesiology. 1997;86(1):10-33.</div>
          <div>5. Eleveld DJ, et al. PK-PD model for propofol for broad application. Br J Anaesth. 2018;120(5):942-59.</div>
          <div>6. Eleveld DJ, et al. An allometric model of remifentanil PK-PD. Anesthesiology. 2017;126(6):1005-18.</div>
          <div>7. Hannivoort LN, et al. Optimized PK model of dexmedetomidine (TCI). Anesthesiology. 2015;123(2):357-67.</div>
          <div>8. Kamp J, et al. Ketamine PK: systematic review, meta-analysis, population analysis. Anesthesiology. 2020;133(6):1192-1213.</div>
          <div>9. Shafer SL, Gregg KM. Algorithms to rapidly achieve and maintain stable drug effect with a computer-controlled infusion pump. J Pharmacokinet Biopharm. 1992;20(2):147-69.</div>
          <div>10. Absalom AR, et al. Pharmacokinetic models for propofol — defining and illuminating the devil in the detail. Br J Anaesth. 2009;103(1):26-37.</div>
          <div>11. Shafer SL, et al. Pharmacokinetics of fentanyl administered by computer-controlled infusion pump. Anesthesiology. 1990;73(6):1091-1102.</div>
          <div>12. Scott JC, Stanski DR. Decreased fentanyl and alfentanil dose requirements with age. J Pharmacol Exp Ther. 1987;240(1):159-66. (ke0 fentanilo/alfentanilo)</div>
          <div>13. Gepts E, et al. Linearity of pharmacokinetics and model estimation of sufentanil. Anesthesiology. 1995;83(6):1194-1204.</div>
          <div>14. Maitre PO, et al. Population pharmacokinetics of alfentanil. Anesthesiology. 1987;66(1):3-12.</div>
          <div>15. Colin PJ, et al. Dexmedetomidine pharmacokinetic–pharmacodynamic modelling (ke0 MOAA/S). Br J Anaesth. 2017;119(2):200-10.</div>
          <div>16. Sigtermans M, et al. Predictive performance of the Domino, Hijazi and Clements models during low-dose TCI ketamine. Br J Anaesth. 2007;98(5):615-23. (set Domino)</div>
          <div>17. Navarrete V, et al. Temporal profile of the antinociceptive effect of IV ketamine using the ANI. J Clin Monit Comput. 2025. (ke0 ketamina, preliminar)</div>
          <div>18. Morse JD, Cortínez LI, Anderson BJ. A universal pharmacokinetic model for dexmedetomidine in children and adults. J Clin Med. 2020;9(11):3480.</div>
        </div>
      </div>

      {/* Disclaimer sobrio (contenido clínico → sin humor) */}
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.7, textAlign: "center", lineHeight: 1.7 }}>
        Modelos poblacionales: no reemplazan el juicio clínico ni la monitorización.
        <br />
        El médico titula la dosis y es el responsable de la administración.
      </p>
      </div>
    </ProGateClient>
  );
}

const thStyle: React.CSSProperties = { padding: "0.3rem 0.5rem", fontWeight: 400, fontSize: "0.58rem" };
const tdStyle: React.CSSProperties = { padding: "0.3rem 0.5rem" };

function ResultRow({ title, value, sub, accent }: { title: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
        <span className="mono" style={{ color: "var(--text-1)", fontSize: "0.8rem" }}>{title}</span>
        <span style={{ flex: 1 }} />
        <span className="mono" style={{ color: accent ? "var(--accent)" : "var(--text-0)", fontWeight: 700, fontSize: accent ? "1.05rem" : "0.9rem", whiteSpace: "nowrap" }}>
          {value}
        </span>
      </div>
      {sub ? <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.15rem" }}>{sub}</div> : null}
    </div>
  );
}

function PkRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.5rem" }}>
      <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.7rem" }}>{label}</span>
      <span className="mono" style={{ color: "var(--cyan)", fontSize: "0.72rem", fontWeight: 600 }}>{value}</span>
    </div>
  );
}

// ------------------------------------------------------------
// TciChart — gráfica SVG inline (sin librerías; CSP-safe) de Cp y Ce vs
// tiempo, con la línea del objetivo, ejes con marcas y leyenda. Colores del
// tema (variables CSS). Opcionalmente traza el BIS predicho en un eje derecho
// (solo propofol · Eleveld) con su propia escala 0-100.
// ------------------------------------------------------------
interface ChartSample {
  tMin: number;
  cp: number;
  ce: number;
}
function TciChart({
  samples,
  target,
  concUnit,
  showCe,
  bisSeries,
}: {
  samples: ChartSample[];
  target: number;
  concUnit: string;
  showCe: boolean;
  bisSeries: { tMin: number; bis: number }[] | null | undefined;
}) {
  // Lienzo (viewBox fijo; escala con el contenedor).
  const W = 680;
  const H = 300;
  const padL = 46;
  const padR = bisSeries ? 44 : 16;
  const padT = 14;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  if (samples.length < 2) return null;

  const tMax = samples[samples.length - 1]!.tMin || 1;
  // Máximo de concentración (Cp, Ce y objetivo) para la escala izquierda.
  let cMax = target;
  for (const s of samples) {
    if (s.cp > cMax) cMax = s.cp;
    if (showCe && s.ce > cMax) cMax = s.ce;
  }
  cMax = cMax > 0 ? cMax * 1.08 : 1; // margen superior

  const x = (t: number) => padL + (t / tMax) * plotW;
  const yC = (c: number) => padT + plotH - (c / cMax) * plotH;
  const yBis = (b: number) => padT + plotH - (b / 100) * plotH; // BIS 0-100

  const path = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const cpPts = samples.map((s) => [x(s.tMin), yC(s.cp)] as [number, number]);
  const cePts = showCe ? samples.map((s) => [x(s.tMin), yC(s.ce)] as [number, number]) : [];
  const bisPts = bisSeries ? bisSeries.map((s) => [x(s.tMin), yBis(s.bis)] as [number, number]) : [];

  // Marcas de ejes.
  const xTicks = 5;
  const yTicks = 4;
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) => (tMax * i) / xTicks);
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (cMax * i) / yTicks);

  return (
    <div style={{ minWidth: 420 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Gráfica de concentración plasmática y de sitio efecto frente al tiempo"
        style={{ display: "block", maxWidth: "100%" }}
      >
        {/* Rejilla + marcas Y (concentración) */}
        {yTickVals.map((v, i) => (
          <g key={`y${i}`}>
            <line
              x1={padL}
              y1={yC(v)}
              x2={padL + plotW}
              y2={yC(v)}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.6}
            />
            <text
              x={padL - 6}
              y={yC(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill="var(--text-3)"
              fontFamily="var(--font-mono, monospace)"
            >
              {v.toFixed(cMax < 5 ? 1 : 0)}
            </text>
          </g>
        ))}
        {/* Marcas X (tiempo) */}
        {xTickVals.map((v, i) => (
          <g key={`x${i}`}>
            <line
              x1={x(v)}
              y1={padT + plotH}
              x2={x(v)}
              y2={padT + plotH + 4}
              stroke="var(--text-3)"
              strokeWidth={0.5}
            />
            <text
              x={x(v)}
              y={padT + plotH + 15}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-3)"
              fontFamily="var(--font-mono, monospace)"
            >
              {v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Línea del objetivo */}
        <line
          x1={padL}
          y1={yC(target)}
          x2={padL + plotW}
          y2={yC(target)}
          stroke="var(--amber)"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.9}
        />
        <text
          x={padL + plotW}
          y={yC(target) - 3}
          textAnchor="end"
          fontSize={9}
          fill="var(--amber)"
          fontFamily="var(--font-mono, monospace)"
        >
          objetivo {target.toFixed(cMax < 5 ? 2 : 1)}
        </text>

        {/* Eje BIS derecho (solo propofol) */}
        {bisSeries ? (
          <>
            {[0, 25, 50, 75, 100].map((b) => (
              <text
                key={`bis${b}`}
                x={padL + plotW + 6}
                y={yBis(b) + 3}
                textAnchor="start"
                fontSize={8}
                fill="var(--magenta, var(--accent))"
                fontFamily="var(--font-mono, monospace)"
                opacity={0.8}
              >
                {b}
              </text>
            ))}
            <path d={path(bisPts)} fill="none" stroke="var(--magenta, var(--accent))" strokeWidth={1.25} strokeDasharray="1 2" opacity={0.9} />
          </>
        ) : null}

        {/* Curva Cp */}
        <path d={path(cpPts)} fill="none" stroke="var(--accent)" strokeWidth={1.75} />
        {/* Curva Ce */}
        {showCe ? <path d={path(cePts)} fill="none" stroke="var(--cyan)" strokeWidth={1.75} /> : null}

        {/* Ejes */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--text-3)" strokeWidth={0.75} />
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--text-3)" strokeWidth={0.75} />
      </svg>

      {/* Leyenda */}
      <div
        className="mono"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          marginTop: "0.4rem",
          fontSize: "0.56rem",
          color: "var(--text-3)",
        }}
      >
        <Legend color="var(--accent)" label={`Cp (plasma, ${concUnit})`} />
        {showCe ? <Legend color="var(--cyan)" label={`Ce (sitio efecto, ${concUnit})`} /> : null}
        <Legend color="var(--amber)" label="objetivo" dashed />
        {bisSeries ? <Legend color="var(--magenta, var(--accent))" label="BIS predicho (0-100, eje der.)" dashed /> : null}
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>t (min) →</span>
      </div>
    </div>
  );
}

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 0,
          borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
