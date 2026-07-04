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
import {
  TCI_MODELS,
  WEIGHT_DOSE_MODELS,
  tciModelsByDrug,
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

export default function TciClient() {
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
  const needsFull = ["propofol-schnider", "remifentanil-minto", "propofol-eleveld", "remifentanil-eleveld", "propofol-paedfusor", "propofol-kataria"].includes(model.id);
  const covOk =
    weightKg != null &&
    weightKg > 0 &&
    (!needsFull || (ageYears != null && ageYears > 0 && heightCm != null && heightCm > 0));

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
    };
  }, [covOk, target, weightKg, ageYears, heightCm, sex, model, effectiveMode, durationMin]);

  // Fármacos NO-TCI (dosis por peso) — sección informativa aparte.
  const [showNonTci, setShowNonTci] = useState(false);

  const unitLabel = model.unit === "mcg" ? "µg" : "mg";
  // Formato de tasa de infusión: masa/min → por kg/h o µg/kg/min según fármaco.
  const rateToPerKgHr = (massPerMin: number): number =>
    weightKg && weightKg > 0 ? (massPerMin * 60) / weightKg : 0;

  return (
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
              Effect-site solo disponible en modelos con <strong>ke0 verificado</strong>{" "}
              (aquí: Schnider, Minto, Marsh modificado). Los demás son plasma-target
              porque no incluimos un ke0 que no hayamos podido confirmar — preferimos
              omitir a inventar.
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
        </div>
      </div>

      {/* Disclaimer sobrio (contenido clínico → sin humor) */}
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.7, textAlign: "center", lineHeight: 1.7 }}>
        Modelos poblacionales: no reemplazan el juicio clínico ni la monitorización.
        <br />
        El médico titula la dosis y es el responsable de la administración.
      </p>
    </div>
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
