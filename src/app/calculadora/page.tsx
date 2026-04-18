"use client";

import { useState, useMemo } from "react";
import { DrugCatalog, Drug } from "@/lib/drugs";
import drugsData from "../../../public/drugs.json";

const catalog = drugsData as DrugCatalog;

export default function CalculadoraPage() {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("");
  const [rate, setRate] = useState("");
  const [direction, setDirection] = useState<"dose-to-rate" | "rate-to-dose">("dose-to-rate");

  const filtered = useMemo(() => {
    if (!searchQ.trim()) return catalog.drugs.slice(0, 15);
    const q = searchQ.toLowerCase();
    return catalog.drugs.filter((d) => d.name.toLowerCase().includes(q)).slice(0, 15);
  }, [searchQ]);

  const concMcgMl = useMemo(() => {
    if (!selectedDrug) return 0;
    const amtMcg = selectedDrug.ampuleUnit === "mg" ? selectedDrug.ampuleAmount * 1000 :
                   selectedDrug.ampuleUnit === "µg" ? selectedDrug.ampuleAmount :
                   selectedDrug.ampuleAmount;
    return selectedDrug.standardDilutionMl > 0 ? amtMcg / selectedDrug.standardDilutionMl : 0;
  }, [selectedDrug]);

  const availableUnits = useMemo(() => {
    if (!selectedDrug) return [];
    const units = new Set<string>();
    units.add(selectedDrug.typicalDoseUnit);
    selectedDrug.doseRanges.forEach((r) => { if (r.unit) units.add(r.unit); });
    return Array.from(units);
  }, [selectedDrug]);

  const needsWeight = doseUnit.includes("/kg");

  const result = useMemo(() => {
    if (!selectedDrug || concMcgMl <= 0) return null;
    const w = parseFloat(weight) || 70;
    const u = doseUnit.toLowerCase();

    if (direction === "dose-to-rate") {
      const d = parseFloat(dose) || 0;
      if (d <= 0) return null;
      let doseMcgMin = 0;
      if (u.includes("/kg/min")) { doseMcgMin = d * w; if (u.startsWith("mg")) doseMcgMin *= 1000; }
      else if (u.includes("/kg/h")) { doseMcgMin = (d * w) / 60; if (u.startsWith("mg")) doseMcgMin *= 1000; }
      else if (u.includes("/min")) { doseMcgMin = d; if (u.startsWith("mg")) doseMcgMin *= 1000; }
      else if (u.includes("/h")) { doseMcgMin = d / 60; if (u.startsWith("mg")) doseMcgMin *= 1000; }
      else return null;
      const mlH = (doseMcgMin / concMcgMl) * 60;
      return { primary: `${mlH.toFixed(1)} mL/h`, secondary: `${(doseMcgMin / concMcgMl).toFixed(2)} mL/min` };
    } else {
      const r = parseFloat(rate) || 0;
      if (r <= 0) return null;
      const mcgMin = (r / 60) * concMcgMl;
      let doseVal = 0;
      let doseLabel = "";
      if (u.includes("/kg/min")) { doseVal = mcgMin / w; if (u.startsWith("mg")) doseVal /= 1000; doseLabel = doseUnit; }
      else if (u.includes("/kg/h")) { doseVal = (mcgMin * 60) / w; if (u.startsWith("mg")) doseVal /= 1000; doseLabel = doseUnit; }
      else if (u.includes("/min")) { doseVal = mcgMin; if (u.startsWith("mg")) doseVal /= 1000; doseLabel = doseUnit; }
      else if (u.includes("/h")) { doseVal = mcgMin * 60; if (u.startsWith("mg")) doseVal /= 1000; doseLabel = doseUnit; }
      else return null;
      return { primary: `${doseVal.toFixed(4)} ${doseLabel}`, secondary: `a ${r} mL/h` };
    }
  }, [selectedDrug, weight, dose, rate, doseUnit, direction, concMcgMl]);

  function selectDrug(d: Drug) {
    setSelectedDrug(d);
    setDoseUnit(d.typicalDoseUnit);
    setDose("");
    setRate("");
    setSearchQ("");
  }

  return (
    <div className="wrap" style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 700, margin: "0 auto" }}>
      <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}><b>$</b> exec infusion_calc</div>
      <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "1.5rem" }}>Calculadora de Infusión</h1>

      {/* Drug selector */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header"><span className="dot" /> FÁRMACO</div>
        <div className="panel-body">
          {selectedDrug ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "var(--text-0)", fontSize: "0.9rem", fontWeight: 600 }}>{selectedDrug.name}</div>
                <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.15rem" }}>
                  {selectedDrug.ampulePresentation} → {fN(selectedDrug.standardDilutionMl)} mL · {concMcgMl.toFixed(2)} {selectedDrug.ampuleUnit === "U" ? "U" : "µg"}/mL
                </div>
              </div>
              <button onClick={() => { setSelectedDrug(null); setSearchQ(""); }} className="btn btn-outline" style={{ padding: "0.2rem 0.5rem", fontSize: "0.6rem" }}>cambiar</button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                className="calc-input mono"
                placeholder="buscar fármaco..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                autoFocus
              />
              <div style={{ maxHeight: 200, overflowY: "auto", marginTop: "0.5rem" }}>
                {filtered.map((d) => (
                  <button
                    key={d.name}
                    onClick={() => selectDrug(d)}
                    className="card-interactive"
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "0.4rem 0.5rem", background: "transparent", border: "none", borderBottom: "1px solid var(--border)", color: "var(--text-0)", cursor: "pointer", fontSize: "0.8rem" }}
                  >
                    <span style={{ fontWeight: 500 }}>{d.name}</span>
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", marginLeft: "0.5rem" }}>{d.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDrug && (
        <>
          {/* Direction toggle */}
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panel-header"><span className="dot" /> DIRECCIÓN</div>
            <div className="panel-body" style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => setDirection("dose-to-rate")}
                className={direction === "dose-to-rate" ? "btn btn-fill" : "btn btn-outline"}
                style={{ flex: 1, justifyContent: "center", fontSize: "0.65rem" }}
              >
                Dosis → Velocidad
              </button>
              <button
                onClick={() => setDirection("rate-to-dose")}
                className={direction === "rate-to-dose" ? "btn btn-fill" : "btn btn-outline"}
                style={{ flex: 1, justifyContent: "center", fontSize: "0.65rem" }}
              >
                Velocidad → Dosis
              </button>
            </div>
          </div>

          {/* Inputs */}
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panel-header"><span className="dot" /> PARÁMETROS</div>
            <div className="panel-body" style={{ display: "grid", gap: "0.65rem" }}>
              {/* Weight */}
              <div>
                <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.2rem" }}>
                  PESO (kg) {!needsWeight && <span style={{ opacity: 0.4 }}>— opcional</span>}
                </label>
                <input type="number" className="calc-input mono" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {direction === "dose-to-rate" ? (
                  <div>
                    <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.2rem" }}>DOSIS</label>
                    <input type="number" className="calc-input mono" placeholder="0.1" value={dose} onChange={(e) => setDose(e.target.value)} step="any" />
                  </div>
                ) : (
                  <div>
                    <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.2rem" }}>VELOCIDAD (mL/h)</label>
                    <input type="number" className="calc-input mono" placeholder="10" value={rate} onChange={(e) => setRate(e.target.value)} step="any" />
                  </div>
                )}
                <div>
                  <label className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", display: "block", marginBottom: "0.2rem" }}>UNIDAD</label>
                  <select className="calc-select mono" value={doseUnit} onChange={(e) => setDoseUnit(e.target.value)}>
                    {availableUnits.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="panel scanline">
            <div className="panel-header"><span className="dot" style={{ background: result ? "var(--accent)" : "var(--text-3)", boxShadow: result ? "0 0 8px var(--accent)" : "none" }} /> RESULTADO</div>
            <div className="panel-body" style={{ textAlign: "center", padding: "1.5rem 1rem" }}>
              {result ? (
                <>
                  <div className="calc-result">{result.primary}</div>
                  <div className="mono" style={{ color: "var(--text-2)", fontSize: "0.75rem", marginTop: "0.35rem" }}>{result.secondary}</div>
                </>
              ) : (
                <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.7rem" }}>
                  {direction === "dose-to-rate" ? "Ingrese dosis para calcular velocidad" : "Ingrese velocidad para calcular dosis"}
                </div>
              )}
            </div>
          </div>

          {/* Dose ranges reference */}
          {selectedDrug.doseRanges.length > 0 && (
            <div className="panel" style={{ marginTop: "1rem" }}>
              <div className="panel-header">RANGOS DE REFERENCIA</div>
              <div className="panel-body">
                {selectedDrug.doseRanges.map((r, i) => (
                  <div key={i} className="data-row">
                    <span className="data-label">{r.label}</span>
                    <span className="data-value mono" style={{ fontSize: "0.75rem" }}>{formatDoseRange(r)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <div className="panel" style={{ borderLeft: "3px solid var(--amber)", marginTop: "1.5rem" }}>
        <div className="panel-body">
          <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.7 }}>
            ⚕️ Verifique siempre la concentración real de su dilución, dosis y vía antes de administrar. Esta calculadora es de apoyo — el juicio clínico siempre prevalece.
          </p>
        </div>
      </div>
    </div>
  );
}

function fN(n: number): string {
  return n === Math.floor(n) && n < 100000 ? n.toString() : n.toFixed(2);
}

function formatDoseRange(r: { min: number; max: number; unit: string; label: string }): string {
  if (r.min === 0 && r.max === 0) return r.label;
  if (r.min === r.max) return `${r.min} ${r.unit}`;
  return `${r.min} – ${r.max} ${r.unit}`;
}
