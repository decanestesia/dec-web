"use client";

// ============================================================
// PatientBar — barra de paciente activo, global y colapsable.
// Vive bajo el navbar; todas las calculadoras leen el paciente activo.
// Guardar/cargar (local), export/import JSON, y reporte PDF (impresión).
// ============================================================

import { useState } from "react";
import {
  usePatient,
  type Sex,
  type WeightType,
} from "@/lib/patient/PatientContext";
import { openPatientReport } from "@/lib/patient/patientReport";

const WTYPES: { key: WeightType; label: string }[] = [
  { key: "real", label: "real" },
  { key: "ideal", label: "ideal" },
  { key: "adjusted", label: "ajustado" },
  { key: "lean", label: "magro" },
];

function num(v: number | null, d = 0): string {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toFixed(d);
}

export function PatientBar() {
  const p = usePatient();
  const [open, setOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const { active, derived, weightType } = p;

  const setNum = (k: "weightKg" | "heightCm" | "ageYears", v: string) => {
    const n = v.trim() === "" ? null : Number(v.replace(",", "."));
    p.setActive({ [k]: n == null || Number.isNaN(n) ? null : n });
  };

  return (
    <div
      className="no-print"
      style={{
        position: "sticky",
        top: 44,
        zIndex: 40,
        background: "var(--bg-1)",
        borderBottom: "1px solid var(--border)",
        fontSize: "0.7rem",
      }}
    >
      <div className="wrap" style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: 32, flexWrap: "wrap" }}>
        {/* Resumen compacto siempre visible */}
        <button
          onClick={() => setOpen((o) => !o)}
          className="mono"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent)", padding: "0.25rem 0", display: "flex", alignItems: "center", gap: 4 }}
        >
          {open ? "▾" : "▸"} paciente
        </button>
        <span className="mono" style={{ color: "var(--text-2)" }}>
          {active.label || "—"} · {num(active.weightKg, 0)} kg
          {derived.bmi != null && ` · IMC ${num(derived.bmi, 1)}`}
        </span>

        {/* Selector de tipo de peso (siempre visible) */}
        <div style={{ display: "flex", gap: 2, marginLeft: "auto" }}>
          {WTYPES.map((w) => (
            <button
              key={w.key}
              onClick={() => p.setWeightType(w.key)}
              className="mono"
              title={`Usar peso ${w.label} en las calculadoras`}
              style={{
                background: weightType === w.key ? "var(--accent)" : "transparent",
                color: weightType === w.key ? "#000" : "var(--text-3)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                padding: "1px 6px",
                fontSize: "0.6rem",
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel expandido */}
      {open && (
        <div className="wrap" style={{ paddingBottom: "0.6rem", borderTop: "1px dashed var(--border)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "0.4rem", marginTop: "0.5rem" }}>
            <Field label="etiqueta">
              <input value={active.label} onChange={(e) => p.setActive({ label: e.target.value })} style={inputStyle} placeholder="paciente" />
            </Field>
            <Field label="expediente">
              <input value={active.mrn ?? ""} onChange={(e) => p.setActive({ mrn: e.target.value })} style={inputStyle} placeholder="opcional" />
            </Field>
            <Field label="peso (kg)">
              <input inputMode="decimal" value={active.weightKg ?? ""} onChange={(e) => setNum("weightKg", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="talla (cm)">
              <input inputMode="decimal" value={active.heightCm ?? ""} onChange={(e) => setNum("heightCm", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="edad (a)">
              <input inputMode="decimal" value={active.ageYears ?? ""} onChange={(e) => setNum("ageYears", e.target.value)} style={inputStyle} />
            </Field>
            <Field label="sexo">
              <select value={active.sex} onChange={(e) => p.setActive({ sex: e.target.value as Sex })} style={inputStyle}>
                <option value="male">♂ masc</option>
                <option value="female">♀ fem</option>
              </select>
            </Field>
          </div>

          {/* Pesos derivados */}
          <div className="mono" style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", color: "var(--text-3)", fontSize: "0.62rem", marginTop: "0.5rem" }}>
            <span>IBW <b style={{ color: "var(--text-1)" }}>{num(derived.ideal, 1)}</b> kg</span>
            <span>ABW <b style={{ color: "var(--text-1)" }}>{num(derived.adjusted, 1)}</b> kg</span>
            <span>magro <b style={{ color: "var(--text-1)" }}>{num(derived.lean, 1)}</b> kg</span>
            <span>SC <b style={{ color: "var(--text-1)" }}>{num(derived.bsa, 2)}</b> m²</span>
          </div>

          {/* Acciones */}
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            <ActionBtn onClick={p.savePatient}>guardar</ActionBtn>
            <div style={{ position: "relative" }}>
              <ActionBtn onClick={() => setLoadOpen((o) => !o)}>cargar ▾</ActionBtn>
              {loadOpen && (
                <div style={{ position: "absolute", top: "100%", left: 0, background: "var(--bg-2)", border: "1px solid var(--border)", zIndex: 50, minWidth: 160, maxHeight: 220, overflowY: "auto" }}>
                  {p.saved.length === 0 && <div className="mono" style={{ padding: "0.4rem", color: "var(--text-3)", fontSize: "0.6rem" }}>sin pacientes guardados</div>}
                  {p.saved.map((s) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                      <button onClick={() => { p.loadPatient(s.id); setLoadOpen(false); }} className="mono" style={{ flex: 1, textAlign: "left", background: "none", border: "none", color: "var(--text-1)", cursor: "pointer", padding: "0.35rem 0.4rem", fontSize: "0.62rem" }}>
                        {s.label} · {num(s.weightKg, 0)}kg
                      </button>
                      <button onClick={() => p.deletePatient(s.id)} title="borrar" style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", padding: "0 0.4rem" }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <ActionBtn onClick={p.newPatient}>nuevo</ActionBtn>
            <ActionBtn onClick={() => openPatientReport(active)}>reporte PDF</ActionBtn>
            <ActionBtn onClick={() => downloadJSON(p.exportJSON())}>exportar</ActionBtn>
            <label style={{ ...actionStyle, cursor: "pointer" }}>
              importar
              <input type="file" accept="application/json" style={{ display: "none" }} onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) p.importJSON(await f.text());
              }} />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--bg-2)", border: "1px solid var(--border)",
  color: "var(--text-0)", padding: "0.25rem 0.4rem", fontSize: "0.72rem", fontFamily: "inherit",
};
const actionStyle: React.CSSProperties = {
  background: "var(--bg-2)", border: "1px solid var(--border)", color: "var(--text-1)",
  padding: "0.25rem 0.6rem", fontSize: "0.62rem", cursor: "pointer", fontFamily: "var(--font-mono, monospace)",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem" }}>{label}</span>
      {children}
    </label>
  );
}
function ActionBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} className="mono" style={actionStyle}>{children}</button>;
}
function downloadJSON(json: string) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dec-pacientes.json";
  a.click();
  URL.revokeObjectURL(url);
}
