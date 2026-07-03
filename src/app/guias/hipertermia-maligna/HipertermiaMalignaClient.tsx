"use client";

// ============================================================
// Hipertermia maligna (HM) — protocolo de emergencia + mini-calc
//
// Referencia estructurada de reconocimiento y manejo, con una
// mini-calculadora de dosis de dantroleno por peso.
//
// EXACTITUD CLÍNICA (app de alta precisión): cada dosis, umbral
// y regla proviene de literatura aceptada. NO inventar cifras.
// Rangos, no cifras ilusorias. Fuentes en formato Vancouver breve.
//
// FUENTES (Vancouver breve):
//  - Malignant Hyperthermia Association of the United States
//    (MHAUS). Managing an MH Crisis / Emergency Therapy for MH.
//    www.mhaus.org · Línea directa MH: 1-800-644-9737
//    (fuera de EUA/Canadá: +1-315-464-7079).
//  - Gropper MA, et al. Miller's Anesthesia. 9.ª ed. Elsevier;
//    2020 — cap. Malignant Hyperthermia.
//  - Glahn KPE, et al. European Malignant Hyperthermia Group
//    (EMHG): recognition and management of MH crisis.
//    Br J Anaesth. 2010;105(4):417-420.
//  - Larach MG, et al. Clinical presentation, treatment and
//    complications of MH in North America (NAMHR). Anesth Analg.
//    2010;110(2):498-507.
//  - Fichas técnicas: dantroleno sódico IV liofilizado 20 mg/vial
//    (Dantrium®/Revonto®) y nanocristalino 250 mg/vial (Ryanodex®).
//
// Dosis clave (MHAUS / Miller):
//   Dantroleno 2.5 mg/kg IV en bolo, repetir cada 5-10 min hasta
//   revertir signos; suele requerir hasta ~10 mg/kg y puede
//   superarse esa cifra si persisten los signos.
// ============================================================

import { useMemo, useState } from "react";
import Link from "next/link";

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
// Presentaciones de dantroleno
//   Clásico liofilizado: 20 mg/vial + 3 g manitol; reconstituir
//     con 60 mL de agua estéril (sin bacteriostático).
//   Nanocristalino: 250 mg/vial; reconstituir con 5 mL de agua
//     estéril; disolución mucho más rápida.
// ------------------------------------------------------------
type Formulation = "classic20" | "nano250";

interface FormulationInfo {
  key: Formulation;
  label: string;
  mgPerVial: number;
  reconstitution: string;
  note: string;
}

const FORMULATIONS: Record<Formulation, FormulationInfo> = {
  classic20: {
    key: "classic20",
    label: "20 mg/vial (liofilizado)",
    mgPerVial: 20,
    reconstitution: "60 mL agua estéril / vial",
    note: "Dantrium® / Revonto® · contiene manitol · agitar hasta disolver",
  },
  nano250: {
    key: "nano250",
    label: "250 mg/vial (nanocristalino)",
    mgPerVial: 250,
    reconstitution: "5 mL agua estéril / vial",
    note: "Ryanodex® · disolución rápida · menos viales que manejar",
  },
};

// ------------------------------------------------------------
// Cálculo de dosis de dantroleno
//   Bolo inicial: 2.5 mg/kg IV
//   Techo orientativo acumulado citado con frecuencia: ~10 mg/kg
//   (puede superarse si persisten los signos — MHAUS/Miller).
// ------------------------------------------------------------
interface DantroleneResult {
  weightKg: number;
  bolusMg: number; // 2.5 mg/kg
  cumulative10Mg: number; // 10 mg/kg (techo orientativo)
  vialsBolus: number; // viales para el primer bolo
  vialsCumulative: number; // viales para llegar a 10 mg/kg
  formulation: FormulationInfo;
}

const BOLUS_MG_PER_KG = 2.5;
const CUMULATIVE_MG_PER_KG = 10;

function computeDantrolene(
  weightKg: number,
  formulation: Formulation
): DantroleneResult {
  const info = FORMULATIONS[formulation];
  const bolusMg = weightKg * BOLUS_MG_PER_KG;
  const cumulative10Mg = weightKg * CUMULATIVE_MG_PER_KG;
  return {
    weightKg,
    bolusMg,
    cumulative10Mg,
    vialsBolus: Math.ceil(bolusMg / info.mgPerVial),
    vialsCumulative: Math.ceil(cumulative10Mg / info.mgPerVial),
    formulation: info,
  };
}

// ------------------------------------------------------------
// Datos de la referencia (tablas estáticas)
// ------------------------------------------------------------
interface RefTableData {
  headers: string[];
  rows: string[][];
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function HipertermiaMalignaClient() {
  const [weightText, setWeightText] = useState("");
  const [formulation, setFormulation] = useState<Formulation>("classic20");

  const weightKg = useMemo(() => parseNumber(weightText), [weightText]);
  const weightValid = weightKg !== null && weightKg > 0 && weightKg <= 250;

  const dose = useMemo(
    () =>
      weightValid && weightKg !== null
        ? computeDantrolene(weightKg, formulation)
        : null,
    [weightValid, weightKg, formulation]
  );

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
      style={{ paddingTop: "1.75rem", paddingBottom: "3rem", maxWidth: 860 }}
    >
      {/* Migas */}
      <Link
        href="/guias"
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.7rem",
          textDecoration: "none",
        }}
      >
        ← /guias
      </Link>

      {/* Header estándar */}
      <div style={{ margin: "1rem 0 1.5rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./hipertermia-maligna.sh
        </div>
        <h1 style={{ fontSize: "1.7rem", fontWeight: 800, lineHeight: 1.2 }}>
          Hipertermia maligna
        </h1>
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.65rem",
            marginTop: "0.4rem",
            lineHeight: 1.7,
          }}
        >
          reconocimiento · manejo paso a paso · dantroleno por peso · complicaciones
          <br />
          {/* humor negro — no aplica al contenido clínico real */}
          <span style={{ opacity: 0.6 }}>
            {"// la fiebre es tardía; el capnógrafo lo dice mucho antes que el termómetro"}
          </span>
        </p>
      </div>

      {/* ==================== BANNER DE EMERGENCIA ==================== */}
      <div
        className="panel"
        style={{
          borderLeft: "3px solid var(--red)",
          marginBottom: "1.25rem",
        }}
      >
        <div
          className="panel-body"
          style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
        >
          <span style={{ color: "var(--red)", fontSize: "0.9rem", flexShrink: 0 }}>
            ⛔
          </span>
          <div
            style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65 }}
          >
            Crisis de HM = <b>emergencia anestésica</b>. Pide ayuda, pide el carro
            de HM y pide dantroleno de inmediato. La primera medida es{" "}
            <b>suspender todos los gatillantes</b> y dar <b>dantroleno</b> sin
            demora.
            <div
              className="mono"
              style={{
                marginTop: "0.5rem",
                fontSize: "0.72rem",
                color: "var(--red)",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              Línea directa MHAUS (24 h, EUA/Canadá): 1-800-644-9737
              <br />
              Fuera de EUA/Canadá: +1-315-464-7079
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 1 · RECONOCIMIENTO ==================== */}
      <SectionHeader
        label="1 · Reconocimiento"
        note="// el signo más temprano y sensible es la hipercapnia que no cede con más ventilación minuto"
      />

      <DataTable
        table={{
          headers: ["Signo", "Rasgo", "Momento"],
          rows: [
            [
              "↑ EtCO₂ inexplicada",
              "Hipercapnia que no cede al aumentar la ventilación minuto. Signo más temprano y sensible.",
              "Temprano",
            ],
            [
              "Taquicardia sinusal",
              "Inexplicada, desproporcionada; a menudo el primer signo hemodinámico.",
              "Temprano",
            ],
            [
              "Rigidez muscular",
              "Espasmo de maseteros (trismo) tras succinilcolina y/o rigidez generalizada.",
              "Temprano–intermedio",
            ],
            [
              "Taquipnea / acidosis",
              "En ventilación espontánea, taquipnea; acidosis mixta (respiratoria + metabólica).",
              "Intermedio",
            ],
            [
              "Hipertermia",
              "Ascenso rápido de temperatura (puede subir > 1 °C cada 5 min). Signo TARDÍO.",
              "Tardío",
            ],
            [
              "Rabdomiólisis",
              "↑ CK, mioglobinuria (orina oscura), hiperpotasemia por lisis muscular.",
              "Tardío",
            ],
            [
              "Arritmias / inestabilidad",
              "Arritmias ventriculares por hiperK y acidosis; puede evolucionar a paro / CID.",
              "Tardío",
            ],
          ],
        }}
      />
      <RefLine>
        Ref: MHAUS — Signs of an MH Event · Glahn KPE, et al. (EMHG). Br J Anaesth
        2010;105:417 · Gropper MA, et al. Miller&apos;s Anesthesia 9.ª ed.
      </RefLine>

      <Callout variant="warn">
        No esperes la fiebre para actuar. La <b>hipertermia es un signo tardío</b>;
        la hipercapnia inexplicada, la taquicardia y la rigidez llegan antes.
        Ante la sospecha, trata como HM mientras confirmas.
      </Callout>

      {/* ==================== 2 · GATILLANTES ==================== */}
      <SectionHeader
        label="2 · Agentes gatillantes y seguros"
        note="// halogenados y succinilcolina disparan; casi todo lo demás es seguro"
      />

      <DataTable
        table={{
          headers: ["Gatillantes (SUSPENDER)", "Seguros / alternativas"],
          rows: [
            [
              "Halogenados: sevoflurano, desflurano, isoflurano, enflurano, halotano.",
              "Propofol, etomidato, ketamina, barbitúricos, benzodiazepinas.",
            ],
            [
              "Succinilcolina (relajante despolarizante).",
              "Bloqueantes NO despolarizantes (rocuronio, vecuronio, cisatracurio).",
            ],
            [
              "— (no hay otros gatillantes anestésicos establecidos).",
              "Opioides, óxido nitroso, anestésicos locales, oxígeno.",
            ],
          ],
        }}
      />
      <RefLine>
        Ref: MHAUS — Safe/Unsafe Anesthetics · Miller&apos;s Anesthesia 9.ª ed.
      </RefLine>

      {/* ==================== 3 · MANEJO PASO A PASO ==================== */}
      <SectionHeader
        label="3 · Manejo paso a paso"
        note="// suspender · dantroleno · hiperventilar · enfriar · corregir · vigilar"
      />

      <StepList
        steps={[
          {
            n: 1,
            title: "Suspender gatillantes",
            body:
              "Interrumpe halogenados y succinilcolina de inmediato. Pide ayuda y el carro de HM. Avisa al cirujano para concluir/pausar la cirugía cuanto antes.",
            color: "var(--red)",
          },
          {
            n: 2,
            title: "Hiperventilar con O₂ 100%",
            body:
              "FiO₂ 1.0 a flujos altos (≥ 10 L/min). Aumenta la ventilación minuto para lavar el CO₂. Si es posible, coloca filtros de carbón activado en las ramas del circuito; no es indispensable retrasar el dantroleno por cambiar la máquina.",
            color: "var(--cyan)",
          },
          {
            n: 3,
            title: "DANTROLENO 2.5 mg/kg IV en bolo",
            body:
              "Bolo IV inicial de 2.5 mg/kg. Repite cada 5–10 min hasta que cedan los signos (↓ EtCO₂, ↓ rigidez, ↓ taquicardia, ↓ temperatura). A menudo se requiere hasta ~10 mg/kg y puede superarse esa cifra si los signos persisten. Usa la mini-calculadora de abajo.",
            color: "var(--accent)",
          },
          {
            n: 4,
            title: "Enfriamiento activo",
            body:
              "Si T ≥ 39 °C: SSN 0.9% frío IV, hielo en ingles/axilas/cuello, lavados de cavidades con suero frío, mantas de enfriamiento. DETÉN el enfriamiento al llegar a ≈ 38 °C para evitar hipotermia por rebote.",
            color: "var(--cyan)",
          },
          {
            n: 5,
            title: "Tratar hiperpotasemia y arritmias",
            body:
              "HiperK: cloruro cálcico o gluconato (estabiliza membrana), insulina + glucosa, bicarbonato; considerar salbutamol; diálisis si es refractaria. Arritmias: tratar por hiperK/acidosis; antiarrítmicos estándar (amiodarona, lidocaína). EVITA bloqueantes de canales de calcio con dantroleno (colapso/hiperK).",
            color: "var(--amber)",
          },
          {
            n: 6,
            title: "Corregir acidosis",
            body:
              "Guiada por gasometría. Bicarbonato de sodio para acidosis metabólica significativa. Mantén la hiperventilación para el componente respiratorio.",
            color: "var(--amber)",
          },
          {
            n: 7,
            title: "Diuresis y protección renal",
            body:
              "Mantén diuresis > 1–2 mL/kg/h con líquidos ± furosemida/manitol (recuerda que cada vial clásico de dantroleno ya aporta manitol). Objetivo: proteger el riñón de la mioglobinuria por rabdomiólisis.",
            color: "var(--accent)",
          },
          {
            n: 8,
            title: "Monitorizar y trasladar a UCI",
            body:
              "Temperatura central, EtCO₂, gasometría seriada, K⁺, CK, coagulación (CID), mioglobina, láctico, diuresis. Traslada a UCI ≥ 24 h: la HM puede recrudecer. Notifica MHAUS y registra el caso; refiere a la familia para estudio (test de contractura / genético RYR1).",
            color: "var(--text-2)",
          },
        ]}
      />

      <RefLine>
        Ref: MHAUS — Emergency Therapy for MH · EMHG (Glahn KPE, et al. Br J
        Anaesth 2010;105:417) · Miller&apos;s Anesthesia 9.ª ed.
      </RefLine>

      {/* ==================== 4 · MINI-CALCULADORA DANTROLENO ==================== */}
      <SectionHeader
        label="4 · Dosis de dantroleno por peso"
        note="// 2.5 mg/kg en bolo, repetible; techo orientativo ~10 mg/kg (superable si persisten los signos)"
      />

      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> CALCULADORA
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
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
              max={250}
              step="any"
            />
          </div>

          {/* Presentación (segmented) */}
          <div>
            <label className="mono" style={labelStyle}>
              Presentación de dantroleno
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
              {(Object.keys(FORMULATIONS) as Formulation[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFormulation(f)}
                  className="mono"
                  style={{
                    padding: "0.5rem 0.35rem",
                    fontSize: "0.62rem",
                    cursor: "pointer",
                    border: "none",
                    background:
                      f === formulation ? "var(--accent)" : "var(--bg-1)",
                    color: f === formulation ? "#000" : "var(--text-2)",
                    transition: "all 0.15s",
                    lineHeight: 1.3,
                  }}
                >
                  {FORMULATIONS[f].label}
                </button>
              ))}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.35rem",
                lineHeight: 1.6,
              }}
            >
              {FORMULATIONS[formulation].note}
              <br />
              {"// reconstitución: "}
              {FORMULATIONS[formulation].reconstitution}
            </div>
          </div>
        </div>
      </div>

      {/* Resultado de la calculadora */}
      {dose ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> RESULTADO · {dose.weightKg.toFixed(0)} kg
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
            {/* Bolo inicial grande */}
            <div style={{ textAlign: "center", padding: "0.35rem 0 0.1rem" }}>
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
                Bolo inicial · 2.5 mg/kg
              </div>
              <div className="calc-result" style={{ color: "var(--accent)" }}>
                {dose.bolusMg.toFixed(0)} mg
              </div>
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.6rem",
                  marginTop: "0.35rem",
                }}
              >
                ≈ {dose.vialsBolus} vial(es) de{" "}
                {dose.formulation.mgPerVial} mg · repetir cada 5–10 min hasta
                revertir signos
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            {/* Techo orientativo 10 mg/kg */}
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
                style={{ color: "var(--text-1)", fontSize: "0.8rem" }}
              >
                Techo orientativo · 10 mg/kg
              </span>
              <span style={{ flex: 1 }} />
              <span
                className="mono"
                style={{
                  color: "var(--amber)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                }}
              >
                {dose.cumulative10Mg.toFixed(0)} mg
              </span>
              <span
                className="mono"
                style={{
                  color: "var(--text-2)",
                  fontSize: "0.72rem",
                  whiteSpace: "nowrap",
                }}
              >
                ≈ {dose.vialsCumulative} vial(es)
              </span>
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "-0.4rem",
                lineHeight: 1.6,
              }}
            >
              {"// ~10 mg/kg es referencia, NO límite absoluto: puede superarse si persisten los signos (MHAUS/Miller)"}
            </div>
          </div>
        </div>
      ) : (
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
          Ingresa el peso (0–250 kg) para calcular el bolo de dantroleno.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// pesos fuera de rango no computan"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={() => setWeightText("")}
          className="btn btn-outline btn-sm"
        >
          limpiar peso
        </button>
      </div>

      {/* Tabla de referencia rápida por peso */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> BOLO 2.5 mg/kg — REFERENCIA RÁPIDA
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}
            >
              <thead>
                <tr style={{ background: "var(--bg-3)" }}>
                  {[
                    "Peso",
                    "Bolo (2.5 mg/kg)",
                    "Viales 20 mg",
                    "≈ 10 mg/kg",
                  ].map((h) => (
                    <th
                      key={h}
                      className="mono"
                      style={{
                        textAlign: "left",
                        padding: "0.5rem 0.7rem",
                        fontSize: "0.58rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "var(--text-2)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((kg) => {
                  const bolus = kg * BOLUS_MG_PER_KG;
                  const cum = kg * CUMULATIVE_MG_PER_KG;
                  return (
                    <tr
                      key={kg}
                      style={{ borderTop: "1px solid var(--border)" }}
                    >
                      <td
                        className="mono"
                        style={{
                          padding: "0.45rem 0.7rem",
                          fontSize: "0.72rem",
                          color: "var(--text-0)",
                          fontWeight: 600,
                        }}
                      >
                        {kg} kg
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.45rem 0.7rem",
                          fontSize: "0.72rem",
                          color: "var(--accent)",
                          fontWeight: 700,
                        }}
                      >
                        {bolus.toFixed(0)} mg
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.45rem 0.7rem",
                          fontSize: "0.72rem",
                          color: "var(--text-1)",
                        }}
                      >
                        {Math.ceil(bolus / 20)}
                      </td>
                      <td
                        className="mono"
                        style={{
                          padding: "0.45rem 0.7rem",
                          fontSize: "0.72rem",
                          color: "var(--amber)",
                          fontWeight: 600,
                        }}
                      >
                        {cum.toFixed(0)} mg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className="mono"
          style={{
            padding: "0.6rem 0.75rem",
            borderTop: "1px solid var(--border)",
            color: "var(--text-3)",
            fontSize: "0.55rem",
            lineHeight: 1.6,
          }}
        >
          {"// viales calculados para presentación clásica de 20 mg (1 vial nano de 250 mg cubre casi cualquier bolo de adulto)"}
        </div>
      </div>

      {/* ==================== 5 · PRESENTACIONES ==================== */}
      <SectionHeader
        label="5 · Presentaciones de dantroleno"
        note="// el clásico de 20 mg exige reconstituir muchos viales bajo presión; el de 250 mg simplifica"
      />

      <DataTable
        table={{
          headers: ["Presentación", "mg/vial", "Reconstitución", "Notas"],
          rows: [
            [
              "Liofilizado clásico",
              "20 mg",
              "60 mL agua estéril",
              "Dantrium®/Revonto® · contiene 3 g manitol/vial · agitar hasta disolver (lento) · un adulto de 70 kg necesita ≈ 9 viales sólo para el primer bolo.",
            ],
            [
              "Nanocristalino",
              "250 mg",
              "5 mL agua estéril",
              "Ryanodex® · disolución rápida · menos viales · verifica disponibilidad en tu carro de HM.",
            ],
          ],
        }}
      />
      <RefLine>
        Ref: Fichas técnicas dantroleno sódico IV (liofilizado 20 mg;
        nanocristalino 250 mg) · MHAUS — What&apos;s in the MH Cart.
      </RefLine>

      <Callout variant="info">
        El dantroleno de 20 mg se reconstituye con <b>agua estéril para inyección
        SIN bacteriostático</b> (no SSN), y su disolución es lenta: reparte la
        tarea entre varias personas. Cada vial clásico aporta manitol, lo que
        contribuye a la diuresis pero suma osmoles a tener en cuenta.
      </Callout>

      {/* ==================== 6 · COMPLICACIONES ==================== */}
      <SectionHeader
        label="6 · Complicaciones y objetivos"
        note="// la crisis no termina con el dantroleno: vigila hiperK, rabdomiólisis, CID y recrudecimiento"
      />

      <DataTable
        table={{
          headers: ["Problema", "Manejo", "Objetivo"],
          rows: [
            [
              "Hiperpotasemia",
              "Ca²⁺ (cloruro/gluconato), insulina + glucosa, bicarbonato, salbutamol; diálisis si refractaria.",
              "Normalizar K⁺; estabilizar membrana miocárdica.",
            ],
            [
              "Arritmias",
              "Tratar hiperK/acidosis de base; amiodarona/lidocaína. NO usar bloqueantes de canales de Ca con dantroleno.",
              "Ritmo estable sin BCC concomitantes.",
            ],
            [
              "Acidosis metabólica",
              "Bicarbonato guiado por gasometría; mantener hiperventilación.",
              "Corregir pH; lavar CO₂.",
            ],
            [
              "Rabdomiólisis / mioglobinuria",
              "Hidratación agresiva; diuresis forzada ± manitol/furosemida.",
              "Diuresis > 1–2 mL/kg/h; proteger riñón.",
            ],
            [
              "CID / coagulopatía",
              "Soporte con hemoderivados guiado por laboratorio.",
              "Controlar sangrado; corregir coagulopatía.",
            ],
            [
              "Recrudecimiento",
              "UCI ≥ 24 h; dantroleno de mantenimiento 1 mg/kg cada 4–6 h (o infusión) según protocolo, hasta 24–48 h estable.",
              "Evitar rebote; monitorización prolongada.",
            ],
          ],
        }}
      />
      <RefLine>
        Ref: MHAUS — Post-Acute Phase / Follow-up · Larach MG, et al. (NAMHR)
        Anesth Analg 2010;110:498 · Miller&apos;s Anesthesia 9.ª ed.
      </RefLine>

      <Callout variant="danger">
        Tras controlar la crisis, el mantenimiento habitual es <b>dantroleno 1
        mg/kg cada 4–6 h (o en infusión) durante 24–48 h</b> y traslado a UCI: la
        HM puede recrudecer. Notifica a MHAUS, registra el episodio y refiere al
        paciente y su familia para estudio (contractura in vitro / genética
        RYR1/CACNA1S).
      </Callout>

      {/* ==================== FUENTES ==================== */}
      <SectionHeader label="Fuentes" />
      <ul
        className="mono"
        style={{
          margin: "0 0 1.5rem",
          paddingLeft: "1.1rem",
          color: "var(--text-2)",
          fontSize: "0.66rem",
          lineHeight: 1.9,
        }}
      >
        <li>
          Malignant Hyperthermia Association of the United States (MHAUS).
          Emergency Therapy for Malignant Hyperthermia / Managing an MH Crisis.
          www.mhaus.org · Línea directa 1-800-644-9737.
        </li>
        <li>
          Gropper MA, et al. Miller&apos;s Anesthesia, 9.ª ed. Elsevier; 2020 —
          Malignant Hyperthermia.
        </li>
        <li>
          Glahn KPE, et al. Recognizing and managing a malignant hyperthermia
          crisis: guidelines from the European Malignant Hyperthermia Group. Br J
          Anaesth. 2010;105(4):417-420.
        </li>
        <li>
          Larach MG, et al. Clinical presentation, treatment, and complications
          of malignant hyperthermia in North America (NAMHR). Anesth Analg.
          2010;110(2):498-507.
        </li>
        <li>
          Fichas técnicas de dantroleno sódico IV: liofilizado 20 mg/vial
          (Dantrium®/Revonto®) y nanocristalino 250 mg/vial (Ryanodex®).
        </li>
      </ul>

      {/* Disclaimer con humor negro */}
      <footer
        style={{
          marginTop: "2rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            lineHeight: 1.8,
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          {"// dosis y umbrales de literatura aceptada (MHAUS · Miller · EMHG)"}
          <br />
          {"// no sustituye el protocolo institucional de HM, el carro ni la línea directa"}
          <br />
          {"// la calculadora orienta el bolo; el paciente marca cuántos hacen falta"}
        </p>
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
        >
          <Link
            href="/guias"
            className="btn btn-outline btn-sm"
            style={{ textDecoration: "none" }}
          >
            ← guías clínicas
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------------------------------------
// Componentes de presentación (réplica del patrón guías/transfusion)
// ------------------------------------------------------------
function SectionHeader({ label, note }: { label: string; note?: string }) {
  return (
    <div style={{ margin: "2.5rem 0 1rem" }}>
      <h2
        className="mono"
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--accent)",
          margin: 0,
          paddingBottom: "0.4rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {label}
      </h2>
      {note ? (
        <p
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.58rem",
            marginTop: "0.4rem",
            opacity: 0.7,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

function RefLine({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mono"
      style={{
        color: "var(--text-3)",
        fontSize: "0.58rem",
        margin: "-0.5rem 0 1rem",
        opacity: 0.7,
        lineHeight: 1.6,
      }}
    >
      {children}
    </p>
  );
}

type CalloutVariant = "info" | "warn" | "danger";

const CALLOUT: Record<CalloutVariant, { border: string; icon: string }> = {
  info: { border: "var(--cyan)", icon: "ℹ" },
  warn: { border: "var(--amber)", icon: "⚠" },
  danger: { border: "var(--red)", icon: "⛔" },
};

function Callout({
  variant,
  children,
}: {
  variant: CalloutVariant;
  children: React.ReactNode;
}) {
  const c = CALLOUT[variant];
  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${c.border}`, margin: "1.25rem 0" }}
    >
      <div
        className="panel-body"
        style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
      >
        <span style={{ color: c.border, fontSize: "0.9rem", flexShrink: 0 }}>
          {c.icon}
        </span>
        <div
          style={{ color: "var(--text-1)", fontSize: "0.8rem", lineHeight: 1.65 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface RefTableProps {
  table: RefTableData;
}

function DataTable({ table }: RefTableProps) {
  return (
    <div
      style={{
        overflowX: "auto",
        margin: "0 0 1.25rem",
        border: "1px solid var(--border)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
        <thead>
          <tr style={{ background: "var(--bg-3)" }}>
            {table.headers.map((h, i) => (
              <th
                key={i}
                className="mono"
                style={{
                  textAlign: "left",
                  padding: "0.5rem 0.7rem",
                  fontSize: "0.58rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "var(--text-2)",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, ri) => (
            <tr key={ri} style={{ borderTop: "1px solid var(--border)" }}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={ci === 0 ? "mono" : undefined}
                  style={{
                    padding: "0.5rem 0.7rem",
                    fontSize: ci === 0 ? "0.7rem" : "0.78rem",
                    verticalAlign: "top",
                    color: ci === 0 ? "var(--text-0)" : "var(--text-1)",
                    fontWeight: ci === 0 ? 600 : 400,
                    lineHeight: 1.55,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------
// Lista de pasos numerada con color por paso
// ------------------------------------------------------------
interface Step {
  n: number;
  title: string;
  body: string;
  color: string;
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <div style={{ display: "grid", gap: "0.6rem", marginBottom: "1.25rem" }}>
      {steps.map((s) => (
        <div
          key={s.n}
          className="panel"
          style={{ borderLeft: `3px solid ${s.color}` }}
        >
          <div
            className="panel-body"
            style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}
          >
            <span
              className="mono"
              style={{
                color: s.color,
                fontWeight: 700,
                fontSize: "0.95rem",
                flexShrink: 0,
                minWidth: "1.4rem",
                textAlign: "center",
              }}
            >
              {s.n}
            </span>
            <div>
              <div
                className="mono"
                style={{
                  color: "var(--text-0)",
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  marginBottom: "0.3rem",
                }}
              >
                {s.title}
              </div>
              <p
                style={{
                  color: "var(--text-1)",
                  fontSize: "0.78rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {s.body}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
