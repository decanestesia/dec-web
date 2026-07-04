"use client";

// ============================================================
// Fluidoterapia perioperatoria
//
// Cuatro cálculos independientes:
//  (1) Mantenimiento 4-2-1 (regla de Holliday-Segar)
//        4 mL/kg/h por los primeros 10 kg
//      + 2 mL/kg/h por los siguientes 10 kg (10–20 kg)
//      + 1 mL/kg/h por cada kg > 20
//  (2) Déficit por ayuno = mantenimiento (mL/h) × horas de ayuno
//        reposición clásica: 50 % en 1ª h, 25 % en 2ª h, 25 % en 3ª h
//        (sumando el mantenimiento horario correspondiente)
//  (3) Pérdidas por trauma quirúrgico (tercer espacio / evaporación):
//        mínimo 2 · moderado 4 · mayor 6 mL/kg/h
//  (4) Reanimación por quemadura — fórmula de Parkland/Baxter:
//        4 mL × %SCQ × kg en 24 h (Ringer lactato / cristaloide),
//        50 % en las primeras 8 h DESDE la quemadura, 50 % en las 16 h siguientes.
//
// FUENTES (Vancouver breve):
//  - Holliday MA, Segar WE. The maintenance need for water in
//    parenteral fluid therapy. Pediatrics. 1957;19(5):823-832.
//    (regla 4-2-1 / 100-50-20)
//  - Baxter CR, Shires T. Physiological response to crystalloid
//    resuscitation of severe burns. Ann N Y Acad Sci.
//    1968;150(3):874-894. (fórmula de Parkland/Baxter)
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

// ------------------------------------------------------------
// (1) Mantenimiento 4-2-1 (Holliday-Segar) en mL/h
// ------------------------------------------------------------
function maintenanceRate(weightKg: number): number {
  if (weightKg <= 0) return 0;
  const first = Math.min(weightKg, 10) * 4; // primeros 10 kg → 4 mL/kg/h
  const second = Math.min(Math.max(weightKg - 10, 0), 10) * 2; // 10–20 kg → 2 mL/kg/h
  const rest = Math.max(weightKg - 20, 0) * 1; // > 20 kg → 1 mL/kg/h
  return first + second + rest;
}

// ------------------------------------------------------------
// (3) Grado de trauma quirúrgico → pérdidas mL/kg/h
// ------------------------------------------------------------
type SurgeryTrauma = "minimo" | "moderado" | "mayor";

const TRAUMA_DEF: Record<
  SurgeryTrauma,
  { label: string; rate: number; hint: string }
> = {
  minimo: {
    label: "Mínimo",
    rate: 2,
    hint: "cirugía superficial (p. ej. hernia, mama)",
  },
  moderado: {
    label: "Moderado",
    rate: 4,
    hint: "cirugía intermedia (p. ej. colecistectomía)",
  },
  mayor: {
    label: "Mayor",
    rate: 6,
    hint: "cirugía con gran exposición (p. ej. laparotomía)",
  },
};
const TRAUMA_ORDER: SurgeryTrauma[] = ["minimo", "moderado", "mayor"];

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function FluidoterapiaClient() {
  // Paciente activo (barra global): el PESO es bidireccional. La fluidoterapia
  // (4-2-1, déficit, tercer espacio y Parkland) usa PESO REAL/ACTUAL por
  // definición de las fórmulas, así que el cálculo toma derived.real — no el
  // tipo de peso seleccionado en la barra.
  const { active, setActive, derived } = usePatient();

  // El input de peso refleja el paciente activo; al escribir, se actualiza el
  // paciente (y con él TODAS las calculadoras). Sin estado local duplicado.
  const weightText =
    active.weightKg != null ? String(active.weightKg) : "";
  const setWeightText = (text: string) =>
    setActive({ weightKg: parseNumber(text) });

  const [fastingText, setFastingText] = useState("");
  const [trauma, setTrauma] = useState<SurgeryTrauma>("moderado");
  const [tbsaText, setTbsaText] = useState("");

  const weight = derived.real; // peso real/actual del paciente activo
  const fastingHours = useMemo(() => parseNumber(fastingText), [fastingText]);
  const tbsa = useMemo(() => parseNumber(tbsaText), [tbsaText]);

  const weightValid = weight !== null && weight > 0 && weight <= 400;
  const fastingValid =
    fastingHours !== null && fastingHours >= 0 && fastingHours <= 48;
  const tbsaValid = tbsa !== null && tbsa > 0 && tbsa <= 100;

  // (1) Mantenimiento
  const maintenance = useMemo(
    () => (weightValid ? maintenanceRate(weight!) : null),
    [weight, weightValid]
  );

  // (2) Déficit por ayuno + reposición horaria
  const fasting = useMemo(() => {
    if (maintenance === null || !fastingValid) return null;
    const deficit = maintenance * fastingHours!; // mL totales acumulados
    // Reposición del déficit: 50 % / 25 % / 25 %, MÁS el mantenimiento horario.
    const h1 = deficit * 0.5 + maintenance;
    const h2 = deficit * 0.25 + maintenance;
    const h3 = deficit * 0.25 + maintenance;
    return { deficit, h1, h2, h3 };
  }, [maintenance, fastingHours, fastingValid]);

  // (3) Pérdidas por trauma quirúrgico (mL/h)
  const traumaLoss = useMemo(() => {
    if (!weightValid) return null;
    return TRAUMA_DEF[trauma].rate * weight!;
  }, [weight, weightValid, trauma]);

  // (4) Parkland/Baxter
  const parkland = useMemo(() => {
    if (!weightValid || !tbsaValid) return null;
    const total24 = 4 * tbsa! * weight!; // mL en 24 h
    const first8 = total24 * 0.5; // 50 % en primeras 8 h desde la quemadura
    const next16 = total24 * 0.5; // 50 % en las 16 h siguientes
    return {
      total24,
      first8,
      first8Rate: first8 / 8, // mL/h en las primeras 8 h
      next16,
      next16Rate: next16 / 16, // mL/h en las siguientes 16 h
    };
  }, [weight, weightValid, tbsa, tbsaValid]);

  const clearAll = () => {
    // No borra el peso: pertenece al paciente activo (compartido). Solo limpia
    // los campos propios de esta calculadora.
    setFastingText("");
    setTbsaText("");
    setTrauma("moderado");
  };

  const round = (n: number) => Math.round(n);

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const resultRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: "0.75rem",
    padding: "0.4rem 0",
    borderTop: "1px solid var(--border)",
  };

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 820, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./fluidoterapia.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Fluidoterapia perioperatoria
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
          mantenimiento 4-2-1 · déficit por ayuno · pérdidas por trauma · Parkland
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>
            {"// el tercer espacio no aparece en ningún manómetro"}
          </span>
        </p>
      </div>

      {/* ==================== PARÁMETROS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PARÁMETROS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.75rem",
            }}
          >
            {/* Peso */}
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
                onChange={(e) => setWeightText(e.target.value)}
                min={0}
                step="any"
              />
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.5rem",
                  marginTop: "0.25rem",
                  opacity: 0.75,
                }}
              >
                usa el paciente activo (barra superior) · peso real
              </div>
            </div>

            {/* Horas de ayuno */}
            <div>
              <label className="mono" style={labelStyle}>
                Ayuno (h)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="8"
                value={fastingText}
                onChange={(e) => setFastingText(e.target.value)}
                min={0}
                step="any"
              />
            </div>

            {/* %SCQ opcional */}
            <div>
              <label className="mono" style={labelStyle}>
                %SCQ (opcional)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="—"
                value={tbsaText}
                onChange={(e) => setTbsaText(e.target.value)}
                min={0}
                max={100}
                step="any"
              />
            </div>
          </div>

          {/* Grado de trauma quirúrgico (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Trauma quirúrgico
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "1px",
                background: "var(--border)",
                border: "1px solid var(--border)",
              }}
            >
              {TRAUMA_ORDER.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrauma(t)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.25rem",
                    fontSize: "0.65rem",
                    cursor: "pointer",
                    border: "none",
                    background: t === trauma ? "var(--accent)" : "var(--bg-1)",
                    color: t === trauma ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                  }}
                >
                  {TRAUMA_DEF[t].label} ({TRAUMA_DEF[t].rate})
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                lineHeight: 1.6,
                marginTop: "0.35rem",
              }}
            >
              {"// " + TRAUMA_DEF[trauma].hint + " — " + TRAUMA_DEF[trauma].rate + " mL/kg/h"}
            </div>
          </div>
        </div>
      </div>

      {!weightValid ? (
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
          Ingresa el peso ({">"}0 kg) para calcular mantenimiento, déficit y pérdidas.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// %SCQ es opcional (solo para Parkland en quemados)"}
          </span>
        </div>
      ) : (
        <>
          {/* ============ (1) MANTENIMIENTO 4-2-1 ============ */}
          {maintenance !== null && (
            <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
              <div className="panel-header">
                <span className="dot" /> MANTENIMIENTO 4-2-1 (Holliday-Segar)
              </div>
              <div className="panel-body" style={{ display: "grid", gap: "0.5rem" }}>
                <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
                  <div className="calc-result" style={{ color: "var(--accent)" }}>
                    {round(maintenance)}
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: "1rem" }}>
                      {" "}mL/h
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem" }}
                  >
                    ≈ {round(maintenance * 24)} mL/24 h
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============ (2) DÉFICIT POR AYUNO ============ */}
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> DÉFICIT POR AYUNO
            </div>
            <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
              {fasting !== null && fastingHours !== null && fastingHours > 0 ? (
                <>
                  <div style={resultRowStyle}>
                    <span className="mono" style={{ color: "var(--text-2)", fontSize: "0.7rem" }}>
                      Déficit total ({fastingHours} h de ayuno)
                    </span>
                    <span className="mono" style={{ color: "var(--text-0)", fontSize: "0.9rem", fontWeight: 700 }}>
                      {round(fasting.deficit)} mL
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}
                  >
                    {"// reposición: 50 % en 1ª h · 25 % en 2ª h · 25 % en 3ª h + mantenimiento horario"}
                  </div>
                  <div style={resultRowStyle}>
                    <span style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
                      1ª hora <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>(50 % déf. + mant.)</span>
                    </span>
                    <span className="mono" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 700 }}>
                      {round(fasting.h1)} mL
                    </span>
                  </div>
                  <div style={resultRowStyle}>
                    <span style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
                      2ª hora <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>(25 % déf. + mant.)</span>
                    </span>
                    <span className="mono" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 700 }}>
                      {round(fasting.h2)} mL
                    </span>
                  </div>
                  <div style={resultRowStyle}>
                    <span style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
                      3ª hora <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>(25 % déf. + mant.)</span>
                    </span>
                    <span className="mono" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 700 }}>
                      {round(fasting.h3)} mL
                    </span>
                  </div>
                </>
              ) : (
                <div
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.65rem", padding: "0.4rem 0" }}
                >
                  {"// ingresa las horas de ayuno para estimar el déficit"}
                </div>
              )}
            </div>
          </div>

          {/* ============ (3) PÉRDIDAS POR TRAUMA QUIRÚRGICO ============ */}
          {traumaLoss !== null && (
            <div className="panel" style={{ marginBottom: "1rem" }}>
              <div className="panel-header">
                <span className="dot" /> PÉRDIDAS POR TRAUMA QUIRÚRGICO
              </div>
              <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
                <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
                  <div
                    className="mono"
                    style={{
                      color: "var(--text-3)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: "0.25rem",
                    }}
                  >
                    Trauma {TRAUMA_DEF[trauma].label.toLowerCase()} · {TRAUMA_DEF[trauma].rate} mL/kg/h
                  </div>
                  <div className="calc-result" style={{ color: "var(--cyan)" }}>
                    {round(traumaLoss)}
                    <span className="mono" style={{ color: "var(--text-3)", fontSize: "1rem" }}>
                      {" "}mL/h
                    </span>
                  </div>
                </div>
                <div
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6, textAlign: "center" }}
                >
                  {"// se suma al mantenimiento y a la reposición del déficit durante la cirugía"}
                </div>
              </div>
            </div>
          )}

          {/* ============ (4) PARKLAND / BAXTER ============ */}
          <div className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panel-header">
              <span className="dot" /> QUEMADURAS — PARKLAND / BAXTER
            </div>
            <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
              {parkland !== null && tbsa !== null ? (
                <>
                  <div style={{ textAlign: "center", padding: "0.25rem 0" }}>
                    <div
                      className="mono"
                      style={{
                        color: "var(--text-3)",
                        fontSize: "0.55rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Total en 24 h · 4 mL × {tbsa} %SCQ × {weight} kg
                    </div>
                    <div className="calc-result" style={{ color: "var(--amber)" }}>
                      {round(parkland.total24)}
                      <span className="mono" style={{ color: "var(--text-3)", fontSize: "1rem" }}>
                        {" "}mL
                      </span>
                    </div>
                    <div
                      className="mono"
                      style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem" }}
                    >
                      Ringer lactato (cristaloide)
                    </div>
                  </div>
                  <div style={resultRowStyle}>
                    <span style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
                      Primeras 8 h <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem" }}>(desde la quemadura)</span>
                    </span>
                    <span className="mono" style={{ color: "var(--amber)", fontSize: "0.85rem", fontWeight: 700 }}>
                      {round(parkland.first8)} mL · {round(parkland.first8Rate)} mL/h
                    </span>
                  </div>
                  <div style={resultRowStyle}>
                    <span style={{ color: "var(--text-1)", fontSize: "0.78rem" }}>
                      Siguientes 16 h
                    </span>
                    <span className="mono" style={{ color: "var(--amber)", fontSize: "0.85rem", fontWeight: 700 }}>
                      {round(parkland.next16)} mL · {round(parkland.next16Rate)} mL/h
                    </span>
                  </div>
                  <div
                    className="mono"
                    style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}
                  >
                    {"// las 8 h se cuentan DESDE la hora de la quemadura, no desde el ingreso"}
                    <br />
                    {"// es una estimación inicial; titular por diuresis (0.5–1 mL/kg/h en adultos)"}
                  </div>
                </>
              ) : (
                <div
                  className="mono"
                  style={{ color: "var(--text-3)", fontSize: "0.65rem", padding: "0.4rem 0" }}
                >
                  {"// ingresa el %SCQ (superficie corporal quemada) para calcular Parkland"}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button type="button" onClick={clearAll} className="btn btn-outline btn-sm">
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIA: fórmulas ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FÓRMULAS DE REFERENCIA
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {["Concepto", "Fórmula"].map((h) => (
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
                {[
                  { c: "Mantenimiento 4-2-1", f: "4 mL/kg/h (0–10 kg) + 2 (10–20 kg) + 1 (>20 kg)" },
                  { c: "Déficit por ayuno", f: "mantenimiento (mL/h) × horas de ayuno" },
                  { c: "Reposición del déficit", f: "50 % en 1ª h · 25 % en 2ª h · 25 % en 3ª h + mant." },
                  { c: "Trauma quirúrgico", f: "mínimo 2 · moderado 4 · mayor 6 mL/kg/h" },
                  { c: "Parkland (quemados)", f: "4 mL × %SCQ × kg / 24 h; 50 % en 1as 8 h" },
                ].map((row) => (
                  <tr key={row.c} style={{ borderTop: "1px solid var(--border)" }}>
                    <td
                      style={{
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.76rem",
                        color: "var(--text-0)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.c}
                    </td>
                    <td
                      className="mono"
                      style={{ padding: "0.5rem 0.7rem", fontSize: "0.72rem", color: "var(--text-1)" }}
                    >
                      {row.f}
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
              La regla 4-2-1 deriva del método 100-50-20 mL/kg/día de Holliday-Segar;
              da la tasa <strong>horaria</strong> de mantenimiento.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              El aporte intraoperatorio total es la suma de{" "}
              <strong>mantenimiento + reposición del déficit + pérdidas por trauma</strong>{" "}
              (más pérdidas hemáticas medidas). El esquema de tercer espacio (2/4/6) es
              orientativo; muchas guías modernas favorecen fluidoterapia restrictiva/dirigida
              por objetivos.
            </li>
            <li style={{ marginBottom: "0.4rem" }}>
              <strong>Parkland</strong> es una estimación de inicio: se calcula sobre %SCQ de
              <strong> 2.º/3.º grado</strong>, con Ringer lactato, y se{" "}
              <strong>titula por diuresis</strong> (0.5–1 mL/kg/h adulto; 1–1.5 mL/kg/h niño).
              Las 8 h se cuentan desde la quemadura.
            </li>
            <li style={{ marginBottom: "0" }}>
              Individualiza según hemodinamia, función renal, comorbilidad cardiaca y tipo de
              cirugía. Estos números orientan; no reemplazan la monitorización.
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
        Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy.
        Pediatrics. 1957;19(5):823-832.
        <br />
        Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe
        burns. Ann N Y Acad Sci. 1968;150(3):874-894.
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
        {"// fluidoterapia — fórmulas clásicas de literatura aceptada, no dogma"}
        <br />
        {"// no sustituye el juicio clínico, la monitorización ni la diuresis horaria"}
        <br />
        {"// el paciente no se reanima con la calculadora, sino con la vía permeable"}
      </p>

      {/* Volver */}
      <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
        <Link
          href="/calculadoras"
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.7rem", textDecoration: "none" }}
        >
          ← /calculadoras
        </Link>
      </div>
    </div>
  );
}
