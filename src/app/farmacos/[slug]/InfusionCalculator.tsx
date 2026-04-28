"use client";

import { useMemo, useState } from "react";
import type { DrugInfusionEntry } from "@/lib/drugs";

interface Props {
  drugName: string;
  entries: DrugInfusionEntry[];
}

export function InfusionCalculator({ drugName, entries }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [weight, setWeight] = useState<number>(70);
  const [dose, setDose] = useState<number>(0);

  const entry = entries[activeIdx];

  // Initialize dose to midpoint when entry changes
  useMemo(() => {
    if (entry && dose === 0) {
      setDose((entry.dose_min + entry.dose_max) / 2 || entry.dose_min || 1);
    }
  }, [entry, dose]);

  // Calculate flow rate (mL/h) given dose, weight, dilution
  const calculation = useMemo(() => {
    if (!entry || !entry.ampule_amount || !entry.standard_dilution_ml) {
      return null;
    }
    // Concentration mg or µg per mL of diluted solution
    const concentration = entry.ampule_amount / entry.standard_dilution_ml;

    let mlPerHour: number;
    let totalDoseLabel: string;
    const u = entry.dose_unit.toLowerCase();

    // Convert dose to "amount per hour" matching ampule unit
    if (u.includes("mcg/kg/min") || u.includes("µg/kg/min")) {
      // dose * weight = µg/min → * 60 = µg/h. Convert to ampule unit.
      const ugPerHour = dose * weight * 60;
      const amountPerHour =
        entry.ampule_unit === "mg" ? ugPerHour / 1000 : ugPerHour;
      mlPerHour = amountPerHour / concentration;
      totalDoseLabel = `${(dose * weight).toFixed(2)} µg/min`;
    } else if (u.includes("mcg/kg/h") || u.includes("µg/kg/h")) {
      const ugPerHour = dose * weight;
      const amountPerHour =
        entry.ampule_unit === "mg" ? ugPerHour / 1000 : ugPerHour;
      mlPerHour = amountPerHour / concentration;
      totalDoseLabel = `${(dose * weight).toFixed(2)} µg/h`;
    } else if (u.includes("mg/kg/h")) {
      const mgPerHour = dose * weight;
      const amountPerHour =
        entry.ampule_unit === "µg" || entry.ampule_unit === "mcg"
          ? mgPerHour * 1000
          : mgPerHour;
      mlPerHour = amountPerHour / concentration;
      totalDoseLabel = `${(dose * weight).toFixed(2)} mg/h`;
    } else if (u.includes("mg/kg/min")) {
      const mgPerHour = dose * weight * 60;
      const amountPerHour =
        entry.ampule_unit === "µg" || entry.ampule_unit === "mcg"
          ? mgPerHour * 1000
          : mgPerHour;
      mlPerHour = amountPerHour / concentration;
      totalDoseLabel = `${(dose * weight).toFixed(2)} mg/min`;
    } else if (u.includes("mg/h")) {
      mlPerHour = dose / concentration;
      totalDoseLabel = `${dose.toFixed(2)} mg/h`;
    } else if (u.includes("u/h") || u.includes("ui/h")) {
      mlPerHour = dose / concentration;
      totalDoseLabel = `${dose.toFixed(2)} U/h`;
    } else if (u.includes("u/kg/h") || u.includes("ui/kg/h")) {
      mlPerHour = (dose * weight) / concentration;
      totalDoseLabel = `${(dose * weight).toFixed(2)} U/h`;
    } else {
      return null;
    }

    return {
      concentration,
      mlPerHour,
      totalDoseLabel,
    };
  }, [entry, dose, weight]);

  if (!entry) return null;

  return (
    <div className="space-y-3">
      {/* Tabs si hay múltiples entradas */}
      {entries.length > 1 && (
        <div className="flex flex-wrap gap-1">
          {entries.map((e, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActiveIdx(i);
                setDose(0);
              }}
              className={`px-3 py-1 rounded text-xs ${
                i === activeIdx
                  ? "bg-emerald-600 text-white"
                  : "bg-foreground/10 hover:bg-foreground/20"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      )}

      {/* Presentación */}
      {entry.ampule_presentation && (
        <div className="text-sm">
          <span className="text-foreground/60">Presentación: </span>
          <strong>{entry.ampule_presentation}</strong>
          {entry.standard_dilution_ml && (
            <span className="text-foreground/60">
              {" "}
              · diluir a {entry.standard_dilution_ml} mL
            </span>
          )}
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Peso (kg)</span>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value) || 0)}
            min={0}
            step={0.5}
            className="w-full mt-1 px-3 py-2 rounded border border-foreground/20 bg-background"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">
            Dosis ({entry.dose_unit}){" "}
            <span className="text-foreground/50 text-xs">
              [{entry.dose_min} – {entry.dose_max}]
            </span>
          </span>
          <input
            type="number"
            value={dose}
            onChange={(e) => setDose(Number(e.target.value) || 0)}
            min={0}
            step={0.01}
            className="w-full mt-1 px-3 py-2 rounded border border-foreground/20 bg-background"
          />
        </label>
      </div>

      {/* Result */}
      {calculation ? (
        <div className="p-3 rounded bg-emerald-600 text-white">
          <div className="text-xs uppercase tracking-wide opacity-80">
            Flujo de la bomba
          </div>
          <div className="text-3xl font-bold tabular-nums">
            {calculation.mlPerHour.toFixed(2)} mL/h
          </div>
          <div className="text-xs opacity-80 mt-1">
            Dosis total: {calculation.totalDoseLabel} · Concentración:{" "}
            {calculation.concentration.toFixed(3)} {entry.ampule_unit}/mL
          </div>
        </div>
      ) : (
        <div className="p-3 rounded bg-foreground/10 text-sm text-foreground/70">
          Calculadora no disponible para esta unidad ({entry.dose_unit}).
          Consulta el rango de dosis manualmente.
        </div>
      )}

      <p className="text-xs text-foreground/50">
        Resultado calculado para {drugName}. Verifica siempre con la ficha
        técnica.
      </p>
    </div>
  );
}
