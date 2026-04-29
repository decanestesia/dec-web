"use client";

import { useEffect, useMemo, useState } from "react";
import type { DrugInfusionEntry } from "@/lib/drugs";

interface Props {
  drugName: string;
  entries: DrugInfusionEntry[];
}

export function InfusionCalculator({ drugName, entries }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [weight, setWeight] = useState("70");
  const [dose, setDose] = useState("");

  const entry = entries[activeIdx];

  // Initialize dose to midpoint when entry changes
  useEffect(() => {
    if (entry) {
      const mid = (entry.dose_min + entry.dose_max) / 2 || entry.dose_min || 0;
      setDose(mid > 0 ? mid.toFixed(2).replace(/\.?0+$/, "") : "");
    }
  }, [activeIdx, entry]);

  const calculation = useMemo(() => {
    if (!entry || !entry.ampule_amount || !entry.standard_dilution_ml) {
      return null;
    }
    const w = parseFloat(weight) || 0;
    const d = parseFloat(dose) || 0;
    if (d <= 0) return null;

    const concentration = entry.ampule_amount / entry.standard_dilution_ml;
    const u = entry.dose_unit.toLowerCase();
    const needsWeight = u.includes("/kg");
    if (needsWeight && w <= 0) return null;

    let mlPerHour: number;
    let totalDose: string;

    if (u.includes("mcg/kg/min") || u.includes("µg/kg/min")) {
      const ugH = d * w * 60;
      const amtH = entry.ampule_unit === "mg" ? ugH / 1000 : ugH;
      mlPerHour = amtH / concentration;
      totalDose = `${(d * w).toFixed(2)} µg/min`;
    } else if (u.includes("mcg/kg/h") || u.includes("µg/kg/h")) {
      const ugH = d * w;
      const amtH = entry.ampule_unit === "mg" ? ugH / 1000 : ugH;
      mlPerHour = amtH / concentration;
      totalDose = `${(d * w).toFixed(2)} µg/h`;
    } else if (u.includes("mg/kg/h")) {
      const mgH = d * w;
      const amtH =
        entry.ampule_unit === "µg" || entry.ampule_unit === "mcg"
          ? mgH * 1000
          : mgH;
      mlPerHour = amtH / concentration;
      totalDose = `${(d * w).toFixed(2)} mg/h`;
    } else if (u.includes("mg/kg/min")) {
      const mgH = d * w * 60;
      const amtH =
        entry.ampule_unit === "µg" || entry.ampule_unit === "mcg"
          ? mgH * 1000
          : mgH;
      mlPerHour = amtH / concentration;
      totalDose = `${(d * w).toFixed(2)} mg/min`;
    } else if (u.includes("mg/h")) {
      mlPerHour = d / concentration;
      totalDose = `${d.toFixed(2)} mg/h`;
    } else if (u.includes("mg/min")) {
      mlPerHour = (d * 60) / concentration;
      totalDose = `${d.toFixed(2)} mg/min`;
    } else if (u.includes("u/h") || u.includes("ui/h")) {
      mlPerHour = d / concentration;
      totalDose = `${d.toFixed(2)} U/h`;
    } else if (u.includes("u/kg/h") || u.includes("ui/kg/h")) {
      mlPerHour = (d * w) / concentration;
      totalDose = `${(d * w).toFixed(2)} U/h`;
    } else {
      return null;
    }

    return {
      concentration,
      mlPerHour,
      mlPerMin: mlPerHour / 60,
      totalDose,
    };
  }, [entry, dose, weight]);

  if (!entry) return null;

  const needsWeight = entry.dose_unit.toLowerCase().includes("/kg");

  return (
    <div className="panel scanline">
      <div className="panel-header">
        <span className="dot" /> INFUSION CALC
      </div>
      <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
        {/* Tabs si hay múltiples indicaciones */}
        {entries.length > 1 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.25rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {entries.map((e, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIdx(i)}
                className="mono"
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.6rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  background:
                    i === activeIdx ? "var(--accent)" : "var(--bg-1)",
                  color: i === activeIdx ? "#000" : "var(--text-2)",
                  border: "1px solid",
                  borderColor:
                    i === activeIdx ? "var(--accent)" : "var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}

        {/* Presentación */}
        {entry.ampule_presentation && (
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.6rem",
            }}
          >
            <span style={{ color: "var(--text-2)" }}>
              {entry.ampule_presentation}
            </span>
            {entry.standard_dilution_ml && (
              <span> → diluir a {entry.standard_dilution_ml} mL</span>
            )}
          </div>
        )}

        {/* Weight */}
        <div>
          <label
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.6rem",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            PESO (kg){" "}
            {!needsWeight && (
              <span style={{ opacity: 0.4 }}>
                — no requerido para esta unidad
              </span>
            )}
          </label>
          <input
            type="number"
            className="calc-input mono"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            min={0}
            step="0.5"
          />
        </div>

        {/* Dose */}
        <div>
          <label
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.6rem",
              display: "block",
              marginBottom: "0.25rem",
            }}
          >
            DOSIS ({entry.dose_unit}){" "}
            <span style={{ opacity: 0.6 }}>
              [{entry.dose_min} – {entry.dose_max}]
            </span>
          </label>
          <input
            type="number"
            className="calc-input mono"
            placeholder={String(entry.dose_min)}
            value={dose}
            onChange={(e) => setDose(e.target.value)}
            step="any"
          />
        </div>

        {/* Concentration info */}
        {entry.ampule_amount && entry.standard_dilution_ml && (
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.6rem",
              padding: "0.3rem 0",
              borderTop: "1px solid var(--border)",
            }}
          >
            CONCENTRACIÓN: {(entry.ampule_amount / entry.standard_dilution_ml).toFixed(3)}{" "}
            {entry.ampule_unit}/mL
          </div>
        )}

        {/* Result */}
        {calculation ? (
          <div
            style={{
              background: "var(--bg-1)",
              padding: "1rem",
              border: "1px solid var(--accent-border)",
              textAlign: "center",
            }}
          >
            <div className="calc-result">
              {calculation.mlPerHour.toFixed(2)} mL/h
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.7rem",
                marginTop: "0.35rem",
              }}
            >
              {calculation.mlPerMin.toFixed(3)} mL/min · dosis total{" "}
              {calculation.totalDose}
            </div>
          </div>
        ) : entry.ampule_amount && entry.standard_dilution_ml ? (
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.65rem",
              textAlign: "center",
              padding: "0.75rem",
              border: "1px dashed var(--border)",
            }}
          >
            {needsWeight && (parseFloat(weight) || 0) <= 0
              ? "↑ Ingrese el peso del paciente"
              : !dose || (parseFloat(dose) || 0) <= 0
                ? "↑ Ingrese una dosis válida"
                : `Unidad ${entry.dose_unit} no soportada por la calculadora`}
          </div>
        ) : (
          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.65rem",
              textAlign: "center",
              padding: "0.5rem",
            }}
          >
            // sin datos de ampolla para esta indicación
          </div>
        )}

        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.55rem",
            opacity: 0.7,
            textAlign: "center",
          }}
        >
          // {drugName} · verificar siempre con la ficha técnica
        </p>
      </div>
    </div>
  );
}
