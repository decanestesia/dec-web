"use client";

// ============================================================
// Salino hipertónico — port de HypertonicSalineView.swift
// Preparación de NaCl 3% / 7.5% / 23.4% por mezcla a partir de
// las presentaciones disponibles. Volúmenes, mEq, osmolaridad y
// alertas de seguridad. Recetas/ratios copiados 1:1 del Swift.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

// ---- Tipos -------------------------------------------------

// port de HypertonicSalineView.swift:253-262 (struct HSCalc)
interface HSCalc {
  volumeToRemove: number;
  volumeToAdd: number;
  volumeRemaining: number;
  mEqBaseRemaining: number;
  mEqHighAdded: number;
  mEqTotalFinal: number;
  mEqLFinal: number;
  osmolarity: number;
}

type FindingColor = "red" | "orange" | "green" | "purple" | "blue" | "teal";

interface ClinicalFinding {
  id: string;
  title: string;
  icon: string;
  color: FindingColor;
  content: string;
}

// Mapeo de colores SwiftUI → variables CSS DEC.
// .red/.orange/.green/.blue conservan semántica; .purple y .teal
// no tienen variable propia en el sistema DEC → se aproximan.
const FINDING_COLOR: Record<FindingColor, string> = {
  red: "var(--red)",
  orange: "var(--amber)",
  green: "var(--accent)",
  purple: "#a855f7", // ultrahipertónica (SwiftUI .purple)
  blue: "var(--cyan)",
  teal: "var(--cyan)",
};

// Iconos SF Symbols → glifos aproximados para web.
const FINDING_ICON: Record<string, string> = {
  "exclamationmark.octagon.fill": "⛔",
  "exclamationmark.triangle.fill": "⚠",
  "checkmark.circle.fill": "✓",
  stethoscope: "🩺",
  speedometer: "⏱",
  "waveform.path.ecg": "〰",
};

// ---- Parsing (port de HypertonicSalineView.swift:38-42) -----

function parseDouble(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// ---- Formateo (equivalente a String(format:) de Swift) ------

function fixed(value: number, digits: number): string {
  return value.toFixed(digits);
}

// ============================================================

export default function SalinoHipertonicoPage() {
  // Valores iniciales idénticos al Swift (líneas 28-31)
  const [volumeText, setVolumeText] = useState("500");
  const [baseConcText, setBaseConcText] = useState("0.9");
  const [hypertonicConcText, setHypertonicConcText] = useState("17.7");
  const [targetConcText, setTargetConcText] = useState("3");

  const V = useMemo(() => parseDouble(volumeText), [volumeText]);
  const cBase = useMemo(() => parseDouble(baseConcText), [baseConcText]);
  const cHigh = useMemo(() => parseDouble(hypertonicConcText), [hypertonicConcText]);
  const cTarget = useMemo(() => parseDouble(targetConcText), [targetConcText]);

  // port de HypertonicSalineView.swift:49-64 (var calculation)
  const calculation = useMemo<HSCalc | null>(() => {
    if (
      V === null ||
      !(V > 0) ||
      cBase === null ||
      cHigh === null ||
      cTarget === null ||
      !(cHigh > cBase) ||
      !(cTarget >= cBase) ||
      !(cTarget <= cHigh)
    ) {
      return null;
    }
    // x = V * (cTarget - cBase) / (cHigh - cBase)   ·  swift:53
    const x = (V * (cTarget - cBase)) / (cHigh - cBase);
    // meqL(c) = c * 10000 / 58.44   ·  swift:54  (58.44 = PM NaCl)
    // c en % (g/100 mL) → g/L (×10) → mg/L (×1000) → mEq/L Na⁺ (/58.44, valencia 1)
    const meqL = (c: number): number => (c * 10000.0) / 58.44;
    return {
      volumeToRemove: x, // swift:56
      volumeToAdd: x, // swift:56
      volumeRemaining: V - x, // swift:57
      mEqBaseRemaining: ((V - x) / 1000.0) * meqL(cBase), // swift:58
      mEqHighAdded: (x / 1000.0) * meqL(cHigh), // swift:59
      mEqTotalFinal: (V / 1000.0) * meqL(cTarget), // swift:60
      mEqLFinal: meqL(cTarget), // swift:61
      osmolarity: meqL(cTarget) * 2, // swift:62  (osmolaridad ≈ mEq/L × 2)
    };
  }, [V, cBase, cHigh, cTarget]);

  // port de HypertonicSalineView.swift:66-73 (var validationError)
  const validationError = useMemo<string | null>(() => {
    if (cBase === null || cHigh === null || cTarget === null) return null;
    if (cHigh <= cBase) return "Hipertónica debe ser > base";
    if (cTarget < cBase || cTarget > cHigh) {
      return "Objetivo debe estar entre base e hipertónica";
    }
    return null;
  }, [cBase, cHigh, cTarget]);

  // port de HypertonicSalineView.swift:83-121 (var clinicalFindings)
  const clinicalFindings = useMemo<ClinicalFinding[]>(() => {
    const r = calculation;
    if (r === null || cTarget === null) return [];
    const f: ClinicalFinding[] = [];

    // Osmolaridad → vía de administración  (swift:87-99)
    if (r.osmolarity >= 900) {
      f.push({
        id: "osm",
        title: "CVC obligatorio",
        icon: "exclamationmark.octagon.fill",
        color: "red",
        content: `Osmolaridad ${Math.trunc(r.osmolarity)} mOsm/L. >900 mOsm/L causa flebitis severa por vía periférica.`,
      });
    } else if (r.osmolarity >= 600) {
      f.push({
        id: "osm",
        title: "Vía central recomendada",
        icon: "exclamationmark.triangle.fill",
        color: "orange",
        content: `Osmolaridad ${Math.trunc(r.osmolarity)} mOsm/L. Si periférica: vena de gran calibre, infusión lenta.`,
      });
    } else {
      f.push({
        id: "osm",
        title: "Apta para vía periférica",
        icon: "checkmark.circle.fill",
        color: "green",
        content: `Osmolaridad ${Math.trunc(r.osmolarity)} mOsm/L.`,
      });
    }

    // Concentración objetivo → indicación clínica  (swift:101-110)
    if (cTarget >= 20) {
      f.push({
        id: "conc",
        title: "Concentración ultrahipertónica",
        icon: "stethoscope",
        color: "purple",
        content:
          "Herniación cerebral inminente. Bolo IV por CVC. NaCl 23.4% 30 mL ≈ NaCl 3% 250 mL.",
      });
    } else if (cTarget >= 5) {
      f.push({
        id: "conc",
        title: "Hipertónica concentrada",
        icon: "stethoscope",
        color: "blue",
        content:
          "HIC, edema cerebral, hiponatremia sintomática severa. CVC. Bolos 100-250 mL en 10-20 min.",
      });
    } else if (cTarget >= 2) {
      f.push({
        id: "conc",
        title: "Hipertónica estándar (3%)",
        icon: "stethoscope",
        color: "blue",
        content:
          "• HIC: 250 mL en 10-20 min, repetir según PIC.\n• Hiponatremia sintomática: 100-150 mL en 10 min, repetir hasta 3 dosis.\n• Reanimación pequeño volumen en TCE.",
      });
    }

    // Velocidad de corrección de Na⁺  (swift:112-115)
    if (cTarget >= 2) {
      f.push({
        id: "rate",
        title: "Velocidad de corrección Na⁺",
        icon: "speedometer",
        color: "orange",
        content:
          "MÁX 8-10 mEq/L en 24h. Riesgo de mielinolisis pontina central. Monitorizar Na⁺ c/2-4h.",
      });
    }

    // Monitorización (siempre)  (swift:117-118)
    f.push({
      id: "monit",
      title: "Monitorización",
      icon: "waveform.path.ecg",
      color: "teal",
      content:
        "• Na⁺ sérico c/2-4h\n• Estado neurológico\n• Volemia y diuresis\n• Función renal y K⁺\n• Sitio del catéter",
    });

    return f;
  }, [calculation, cTarget]);

  // port de HypertonicSalineView.swift:123-129 (clearAll)
  const clearAll = () => {
    setVolumeText("500");
    setBaseConcText("0.9");
    setHypertonicConcText("17.7");
    setTargetConcText("3");
  };

  const setPreset = (base: string, high: string) => {
    setBaseConcText(base);
    setHypertonicConcText(high);
  };

  // Quick presets objetivo  (swift:159)
  const QUICK_TARGETS = ["1.5", "2", "3", "5", "7.5"];

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar DEC */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./salino-hipertonico.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Salino hipertónico
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
          Preparación de NaCl 3% / 7.5% / 23.4% por mezcla.
          <br />
          <span style={{ opacity: 0.6 }}>
            // el sodio no perdona errores de dilución — verifica cada mL
          </span>
        </p>
      </div>

      {/* ---- INPUTS: Volumen y soluciones ---- */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> VOLUMEN Y SOLUCIONES
        </div>
        <div
          className="panel-body"
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <NumberField
            label="VOLUMEN (mL)"
            value={volumeText}
            placeholder="500"
            onChange={setVolumeText}
          />
          <NumberField
            label="BASE (%)"
            value={baseConcText}
            placeholder="0.9"
            onChange={setBaseConcText}
          />
          <NumberField
            label="HIPERTÓNICA (%)"
            value={hypertonicConcText}
            placeholder="17.7"
            onChange={setHypertonicConcText}
          />

          {/* Presets base/hipertónica  (swift:138-149) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.4rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "0.6rem",
            }}
          >
            <span
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.6rem" }}
            >
              PRESETS:
            </span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "0.35rem",
                flexWrap: "wrap",
              }}
            >
              <ChipButton
                label="0.9/17.7"
                active={baseConcText === "0.9" && hypertonicConcText === "17.7"}
                onClick={() => setPreset("0.9", "17.7")}
              />
              <ChipButton
                label="0.9/23.4"
                active={baseConcText === "0.9" && hypertonicConcText === "23.4"}
                onClick={() => setPreset("0.9", "23.4")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- INPUTS: Concentración objetivo ---- */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CONCENTRACIÓN OBJETIVO
        </div>
        <div
          className="panel-body"
          style={{ display: "grid", gap: "0.75rem" }}
        >
          <NumberField
            label="FINAL (%)"
            value={targetConcText}
            placeholder="3"
            onChange={setTargetConcText}
          />

          {/* Quick presets objetivo  (swift:154-164) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.4rem",
              borderTop: "1px solid var(--border)",
              paddingTop: "0.6rem",
            }}
          >
            <span
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "0.6rem" }}
            >
              QUICK:
            </span>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                gap: "0.35rem",
                flexWrap: "wrap",
              }}
            >
              {QUICK_TARGETS.map((v) => (
                <ChipButton
                  key={v}
                  label={v}
                  active={targetConcText === v}
                  onClick={() => setTargetConcText(v)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---- RESULTADOS ---- */}
      {/* port de HypertonicSalineView.swift:167-193 */}
      {validationError !== null ? (
        <div
          className="panel"
          style={{ borderLeft: "3px solid var(--red)" }}
        >
          <div className="panel-body">
            <p
              className="mono"
              style={{
                color: "var(--red)",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              ⚠ {validationError}
            </p>
          </div>
        </div>
      ) : calculation !== null ? (
        <div className="fade-up" style={{ display: "grid", gap: "1rem" }}>
          {/* Preparación (swift:174-179) */}
          <div className="panel scanline">
            <div className="panel-header">
              <span className="dot" /> PREPARACIÓN
            </div>
            <div className="panel-body" style={{ display: "grid", gap: "0.9rem" }}>
              <BigResult
                title="Retirar de la base"
                value={`${fixed(calculation.volumeToRemove, 1)} mL`}
              />
              <BigResult
                title="Agregar de la hipertónica"
                value={`${fixed(calculation.volumeToAdd, 1)} mL`}
              />
            </div>
          </div>

          {/* Composición final (swift:181-186) */}
          <div className="panel">
            <div className="panel-header">
              <span className="dot" /> COMPOSICIÓN FINAL
            </div>
            <div className="panel-body" style={{ display: "grid", gap: "0.1rem" }}>
              <CompactResult
                title="Volumen total"
                // swift:182 → volumeRemaining + volumeToAdd, %.0f mL
                value={`${fixed(
                  calculation.volumeRemaining + calculation.volumeToAdd,
                  0
                )} mL`}
              />
              <CompactResult
                title="NaCl total"
                value={`${fixed(calculation.mEqTotalFinal, 1)} mEq`}
              />
              <CompactResult
                title="Concentración"
                value={`${fixed(calculation.mEqLFinal, 1)} mEq/L`}
              />
              <CompactResult
                title="Osmolaridad"
                value={`${fixed(calculation.osmolarity, 0)} mOsm/L`}
              />
            </div>
          </div>

          {/* Información clínica (swift:188-192) */}
          {clinicalFindings.length > 0 && (
            <div className="panel">
              <div className="panel-header">
                <span className="dot" /> INFORMACIÓN CLÍNICA
              </div>
              <div
                className="panel-body"
                style={{ display: "grid", gap: "0.9rem" }}
              >
                {clinicalFindings.map((f) => (
                  <FindingCard key={f.id} finding={f} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Estado sin cálculo: falta algún input o valor fuera de rango
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
          }}
        >
          Completa volumen y concentraciones para calcular la mezcla.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            // volumen &gt; 0 · base &lt; objetivo &lt; hipertónica
          </span>
        </div>
      )}

      {/* Botón limpiar (swift:195-197 ClearFieldsButton) */}
      <div style={{ marginTop: "1.25rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          limpiar campos
        </button>
      </div>

      {/* Footer con humor negro */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          marginTop: "1.5rem",
          opacity: 0.55,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        // dosis y osmolaridades de literatura aceptada · verifica con farmacia
        local
        <br />
        // corrige el Na⁺ lento — la mielina no vuelve a crecer
        <br />
        <Link
          href="/calculadoras"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          ← otras calculadoras
        </Link>
      </p>
    </div>
  );
}

// ============================================================
// Subcomponentes
// ============================================================

function NumberField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
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
        {label}
      </label>
      <input
        type="text"
        inputMode="decimal"
        className="calc-input mono"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function ChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono"
      style={{
        padding: "0.25rem 0.5rem",
        fontSize: "0.6rem",
        letterSpacing: "0.03em",
        background: active ? "var(--accent)" : "var(--bg-1)",
        color: active ? "#000" : "var(--text-2)",
        border: "1px solid",
        borderColor: active ? "var(--accent)" : "var(--border)",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// port de HypertonicSalineView.swift:228-235 (bigResult)
function BigResult({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "0.75rem",
        flexWrap: "wrap",
      }}
    >
      <span style={{ color: "var(--text-1)", fontSize: "0.8rem" }}>
        {title}
      </span>
      <span
        className="mono"
        style={{
          color: "var(--accent)",
          fontSize: "1.25rem",
          fontWeight: 700,
          textShadow: "0 0 30px var(--accent-glow)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// port de HypertonicSalineView.swift:219-226 (compactResult)
function CompactResult({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.4rem 0",
        borderBottom: "1px solid var(--border)",
        fontSize: "0.8rem",
      }}
    >
      <span style={{ color: "var(--text-2)" }}>{title}</span>
      <span
        className="mono"
        style={{ color: "var(--cyan)", fontWeight: 600 }}
      >
        {value}
      </span>
    </div>
  );
}

// port de HypertonicSalineView.swift:237-250 (findingCard)
function FindingCard({ finding }: { finding: ClinicalFinding }) {
  const color = FINDING_COLOR[finding.color];
  const icon = FINDING_ICON[finding.icon] ?? "•";
  return (
    <div style={{ borderLeft: `2px solid ${color}`, paddingLeft: "0.6rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.25rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color, lineHeight: 1 }}>{icon}</span>
        <span
          style={{
            color: "var(--text-0)",
            fontSize: "0.8rem",
            fontWeight: 600,
          }}
        >
          {finding.title}
        </span>
      </div>
      <p
        style={{
          color: "var(--text-2)",
          fontSize: "0.7rem",
          lineHeight: 1.6,
          whiteSpace: "pre-line", // conserva los saltos "\n" del Swift
        }}
      >
        {finding.content}
      </p>
    </div>
  );
}
