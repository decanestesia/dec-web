"use client";

// ============================================================
// Valoración preanestésica — formulario que escribe al PACIENTE ACTIVO
// (usePatient().setActive) y muestra los scores de riesgo EN VIVO
// (RCRI · STOP-BANG · Apfel · CrCl · MABL) reutilizando los helpers
// puros del contexto (fórmulas EXACTAS de las calculadoras dedicadas).
// Un botón genera el PDF de valoración (openPatientReport).
//
// Estética DEC: terminal/dark/sharp, mono lowercase, panels, var(--...).
// Los datos básicos (peso/talla/edad/sexo) ya están en la barra de paciente;
// aquí se añaden ASA, comorbilidades, vía aérea, riesgo quirúrgico, labs,
// ayuno, alergias, medicación y notas.
//
// FUENTES (Vancouver breve) de los scores:
//   RCRI — Lee TH, et al. Circulation. 1999;100(10):1043-1049.
//   STOP-BANG — Chung F, et al. Anesthesiology 2008;108:812 · Chest 2016;149:631.
//   Apfel — Apfel CC, et al. Anesthesiology. 1999;91(3):693-700.
//   Cockcroft-Gault — Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41.
//   MABL — Gross JB. Anesthesiology. 1983;58(3):277-280.
// ============================================================

import { useMemo } from "react";
import Link from "next/link";
import {
  usePatient,
  rcriScore,
  stopBang,
  apfel,
  cockcroftGault,
  mabl,
  kdigoStage,
  type Sex,
  type AsaClass,
  type Mallampati,
  type SurgeryRisk,
  type Comorbidities,
} from "@/lib/patient/PatientContext";
import { openPatientReport } from "@/lib/patient/patientReport";

// ------------------------------------------------------------
// Parsing — acepta coma o punto; vacío = null.
// ------------------------------------------------------------
function parseNumber(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const num = Number(raw.replace(",", "."));
  return Number.isNaN(num) ? null : num;
}
function numToText(v: number | null | undefined): string {
  return v == null ? "" : String(v);
}

// Comorbilidades: orden y etiquetas de los checkboxes.
const COMORBIDITIES: { key: keyof Comorbidities; label: string; hint: string }[] = [
  { key: "htn", label: "Hipertensión arterial", hint: "STOP-BANG (P) · perfil cardiovascular" },
  { key: "ischemicHeart", label: "Cardiopatía isquémica", hint: "RCRI +1 · IAM/angina/nitratos" },
  { key: "chf", label: "Insuficiencia cardíaca (ICC)", hint: "RCRI +1" },
  { key: "cerebrovascular", label: "Enf. cerebrovascular (ACV/AIT)", hint: "RCRI +1" },
  { key: "insulinDm", label: "Diabetes con insulina", hint: "RCRI +1 · solo si requiere insulina" },
  { key: "copd", label: "EPOC", hint: "riesgo respiratorio" },
  { key: "osa", label: "Apnea del sueño / ronquido", hint: "STOP-BANG (S+O)" },
  { key: "smoker", label: "Fumador activo", hint: "Apfel: fumar ↓ NVPO" },
];

const ASA_OPTIONS: { value: AsaClass; label: string }[] = [
  { value: 1, label: "I — sano" },
  { value: 2, label: "II — enf. leve" },
  { value: 3, label: "III — enf. grave" },
  { value: 4, label: "IV — amenaza vital" },
  { value: 5, label: "V — moribundo" },
  { value: 6, label: "VI — muerte encefálica" },
];

const MALLAMPATI_OPTIONS: { value: Mallampati; label: string }[] = [
  { value: 1, label: "I" },
  { value: 2, label: "II" },
  { value: 3, label: "III" },
  { value: 4, label: "IV" },
];

const SURGERY_RISK_OPTIONS: { value: SurgeryRisk; label: string }[] = [
  { value: "low", label: "bajo" },
  { value: "intermediate", label: "intermedio" },
  { value: "high", label: "alto" },
];

// Color por banda de riesgo genérico.
function bandColor(level: "low" | "mid" | "high"): string {
  return level === "low" ? "var(--accent)" : level === "mid" ? "var(--amber)" : "var(--red)";
}

export default function ValoracionClient() {
  const { active, setActive } = usePatient();

  // ---- Scores EN VIVO (helpers puros) ----
  const rcri = useMemo(() => rcriScore(active), [active]);
  const sb = useMemo(() => stopBang(active), [active]);
  const apf = useMemo(() => apfel(active), [active]);
  const crcl = useMemo(() => cockcroftGault(active), [active]);
  const maxBl = useMemo(() => mabl(active), [active]);

  // Helpers de escritura al paciente activo.
  const setC = (key: keyof Comorbidities, val: boolean) =>
    setActive({ comorbidities: { ...(active.comorbidities ?? {}), [key]: val } });

  const rcriLevel = rcri.points === 0 || rcri.points === 1 ? "low" : rcri.points === 2 ? "mid" : "high";
  const sbLevel = sb.risk === "low" ? "low" : sb.risk === "intermediate" ? "mid" : "high";
  const apfLevel = apf.score <= 1 ? "low" : apf.score === 2 ? "mid" : "high";

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 900, margin: "0 auto" }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./valoracion-preanestesica.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>Valoración preanestésica</h1>
        <p
          className="mono"
          style={{ color: "var(--text-3)", fontSize: "0.65rem", marginTop: "0.25rem", lineHeight: 1.7 }}
        >
          scores de riesgo + hoja PDF · usa el paciente activo (barra superior)
          <br />
          {/* humor negro — no aplica al contenido clínico */}
          <span style={{ opacity: 0.6 }}>{"// una historia clínica sin escribirla; la firma sigue siendo tuya"}</span>
        </p>
      </div>

      {/* ==================== DATOS BÁSICOS (paciente activo) ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> DATOS BÁSICOS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}>
            {"// estos campos son el paciente activo compartido: editarlos aquí los actualiza en toda la app"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.6rem" }}>
            <FieldNum label="peso (kg)" value={numToText(active.weightKg)} onChange={(t) => setActive({ weightKg: parseNumber(t) })} placeholder="70" />
            <FieldNum label="talla (cm)" value={numToText(active.heightCm)} onChange={(t) => setActive({ heightCm: parseNumber(t) })} placeholder="170" />
            <FieldNum label="edad (años)" value={numToText(active.ageYears)} onChange={(t) => setActive({ ageYears: parseNumber(t) })} placeholder="68" />
            <Field label="sexo">
              <select
                className="calc-select mono"
                value={active.sex}
                onChange={(e) => setActive({ sex: e.target.value as Sex })}
              >
                <option value="male">♂ masculino</option>
                <option value="female">♀ femenino</option>
              </select>
            </Field>
            <Field label="etiqueta">
              <input className="calc-input mono" value={active.label} onChange={(e) => setActive({ label: e.target.value })} placeholder="paciente" />
            </Field>
            <Field label="expediente">
              <input className="calc-input mono" value={active.mrn ?? ""} onChange={(e) => setActive({ mrn: e.target.value })} placeholder="opcional" />
            </Field>
          </div>
        </div>
      </div>

      {/* ==================== ASA · VÍA AÉREA · CIRUGÍA ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ASA · VÍA AÉREA · CIRUGÍA
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          <Field label="clasificación ASA">
            <select
              className="calc-select mono"
              value={active.asaClass ?? ""}
              onChange={(e) => setActive({ asaClass: e.target.value === "" ? undefined : (Number(e.target.value) as AsaClass) })}
            >
              <option value="">— sin definir —</option>
              {ASA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{`ASA ${o.label}`}</option>
              ))}
            </select>
          </Field>
          <label className="mono" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-1)", fontSize: "0.72rem", cursor: "pointer" }}>
            <input type="checkbox" checked={active.asaEmergency ?? false} onChange={(e) => setActive({ asaEmergency: e.target.checked })} />
            modificador de emergencia (sufijo &laquo;E&raquo;)
          </label>

          <Field label="vía aérea — Mallampati">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
              <Segment active={active.mallampati == null} onClick={() => setActive({ mallampati: undefined })} label="—" />
              {MALLAMPATI_OPTIONS.map((o) => (
                <Segment key={o.value} active={active.mallampati === o.value} onClick={() => setActive({ mallampati: o.value })} label={o.label} />
              ))}
            </div>
          </Field>

          <Field label="riesgo quirúrgico (RCRI)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
              <Segment active={active.surgeryRisk == null} onClick={() => setActive({ surgeryRisk: undefined })} label="—" />
              {SURGERY_RISK_OPTIONS.map((o) => (
                <Segment key={o.value} active={active.surgeryRisk === o.value} onClick={() => setActive({ surgeryRisk: o.value })} label={o.label} />
              ))}
            </div>
            <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem", lineHeight: 1.5 }}>
              {"// alto = intraperitoneal / intratorácica / vascular suprainguinal (Lee 1999) → +1 RCRI"}
            </div>
          </Field>
        </div>
      </div>

      {/* ==================== COMORBILIDADES ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> COMORBILIDADES / ANTECEDENTES
        </div>
        <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.5rem" }}>
          {COMORBIDITIES.map((c) => {
            const on = active.comorbidities?.[c.key] ?? false;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setC(c.key, !on)}
                aria-pressed={on}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem", textAlign: "left", cursor: "pointer",
                  padding: "0.55rem 0.65rem",
                  border: `1px solid ${on ? "var(--accent-border)" : "var(--border)"}`,
                  background: on ? "var(--accent-glow)" : "var(--bg-1)",
                  transition: "all 0.15s",
                }}
              >
                <span
                  aria-hidden="true"
                  className="mono"
                  style={{
                    flexShrink: 0, width: "1.05rem", height: "1.05rem", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                    border: `1px solid ${on ? "var(--accent)" : "var(--border-hi)"}`,
                    background: on ? "var(--accent)" : "transparent",
                    color: on ? "#000" : "var(--text-3)", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1,
                  }}
                >
                  {on ? "✓" : ""}
                </span>
                <span style={{ display: "grid", gap: "0.1rem" }}>
                  <span style={{ color: on ? "var(--text-0)" : "var(--text-1)", fontSize: "0.76rem", fontWeight: 600 }}>{c.label}</span>
                  <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem" }}>{"// " + c.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== NVPO (Apfel) · LABS · AYUNO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> NVPO · LABORATORIO · AYUNO
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.85rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.5rem" }}>
            <Check label="Antecedente de NVPO / cinetosis" hint="Apfel +1" checked={active.ponvHistory ?? false} onChange={(v) => setActive({ ponvHistory: v })} />
            <Check label="Opioides postoperatorios previstos" hint="Apfel +1" checked={active.postopOpioids ?? false} onChange={(v) => setActive({ postopOpioids: v })} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.6rem" }}>
            <FieldNum label="hematocrito (%)" value={numToText(active.hematocrit)} onChange={(t) => setActive({ hematocrit: parseNumber(t) ?? undefined })} placeholder="42" />
            <FieldNum label="creatinina (mg/dL)" value={numToText(active.creatinine)} onChange={(t) => setActive({ creatinine: parseNumber(t) ?? undefined })} placeholder="1.1" />
            <FieldNum label="ayuno (horas)" value={numToText(active.fastingHours)} onChange={(t) => setActive({ fastingHours: parseNumber(t) ?? undefined })} placeholder="8" />
          </div>
          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.6 }}>
            {"// creatinina > 2 mg/dL suma +1 al RCRI y alimenta Cockcroft-Gault · hematocrito alimenta la MABL (Hct mín 21%)"}
          </div>
        </div>
      </div>

      {/* ==================== TEXTO LIBRE ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> ALERGIAS · MEDICACIÓN · NOTAS
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <Field label="alergias">
            <textarea className="calc-input mono" style={{ resize: "vertical", minHeight: "2.2rem" }} value={active.allergies ?? ""} onChange={(e) => setActive({ allergies: e.target.value })} placeholder="NKDA / látex / fármacos…" />
          </Field>
          <Field label="medicación habitual">
            <textarea className="calc-input mono" style={{ resize: "vertical", minHeight: "2.2rem" }} value={active.medications ?? ""} onChange={(e) => setActive({ medications: e.target.value })} placeholder="antihipertensivos, anticoagulantes, insulina…" />
          </Field>
          <Field label="notas">
            <textarea className="calc-input mono" style={{ resize: "vertical", minHeight: "2.2rem" }} value={active.notes ?? ""} onChange={(e) => setActive({ notes: e.target.value })} placeholder="plan anestésico, hallazgos, consideraciones…" />
          </Field>
        </div>
      </div>

      {/* ==================== SCORES EN VIVO ==================== */}
      <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> SCORES DE RIESGO (en vivo)
        </div>
        <div className="panel-body" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1px", background: "var(--border)", border: "1px solid var(--border)" }}>
          <ScoreCard
            title="ASA"
            value={active.asaClass ? `${active.asaClass}${active.asaEmergency ? "E" : ""}` : "—"}
            sub={active.asaClass ? "clasificación física" : "sin definir"}
            color={active.asaClass && active.asaClass >= 4 ? "var(--red)" : active.asaClass === 3 ? "var(--amber)" : "var(--accent)"}
          />
          <ScoreCard
            title="RCRI (Lee)"
            value={`${rcri.points}`}
            sub={`${rcri.riskClass} · ${rcri.riskPct}%`}
            color={bandColor(rcriLevel)}
          />
          <ScoreCard
            title="STOP-BANG"
            value={`${sb.score}`}
            sub={`${sb.risk === "low" ? "bajo" : sb.risk === "intermediate" ? "intermedio" : "alto"} · parcial`}
            color={bandColor(sbLevel)}
          />
          <ScoreCard
            title="Apfel (NVPO)"
            value={`${apf.score}`}
            sub={`~${apf.riskPct}% a 24 h`}
            color={bandColor(apfLevel)}
          />
          <ScoreCard
            title="CrCl (C-G)"
            value={crcl != null ? crcl.toFixed(0) : "—"}
            sub={crcl != null ? `mL/min · ${kdigoStage(crcl)}` : "falta edad/peso/Cr"}
            color={crcl == null ? "var(--text-3)" : crcl >= 60 ? "var(--accent)" : crcl >= 30 ? "var(--amber)" : "var(--red)"}
          />
          <ScoreCard
            title="MABL"
            value={maxBl != null ? `${Math.round(maxBl)}` : "—"}
            sub={maxBl != null ? "mL · Hct mín 21%" : "falta peso/Hct"}
            color={maxBl == null ? "var(--text-3)" : "var(--accent)"}
          />
        </div>
      </div>

      {/* ==================== ACCIONES ==================== */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <button type="button" onClick={() => openPatientReport(active)} className="btn btn-fill btn-sm">
          generar PDF ▸
        </button>
        <Link href="/calculadoras" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
          calculadoras
        </Link>
      </div>

      {/* ==================== FUENTES ==================== */}
      <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.6rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
        <div style={{ color: "var(--text-2)", marginBottom: "0.3rem" }}>Fuentes de los scores</div>
        RCRI — Lee TH, et al. Circulation. 1999;100(10):1043-1049.
        <br />
        STOP-BANG — Chung F, et al. Anesthesiology. 2008;108(5):812-821 · Chest. 2016;149(3):631-638. (aquí parcial: sin cansancio ni circunferencia cervical)
        <br />
        Apfel CC, et al. Anesthesiology. 1999;91(3):693-700.
        <br />
        Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41.
        <br />
        Gross JB. Anesthesiology. 1983;58(3):277-280 (MABL).
      </div>

      {/* Disclaimer con humor negro */}
      <p className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.6, textAlign: "center", lineHeight: 1.7 }}>
        {"// valoración preanestésica — scores poblacionales de literatura aceptada, no destino"}
        <br />
        {"// STOP-BANG es parcial (faltan ítems no recogidos); reestratifica con la escala completa si procede"}
        <br />
        {"// la app calcula, el médico decide y firma"}
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Subcomponentes de UI
// ------------------------------------------------------------
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span
        className="mono"
        style={{ color: "var(--text-3)", fontSize: "0.6rem", letterSpacing: "0.05em", textTransform: "uppercase" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function FieldNum({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        inputMode="decimal"
        className="calc-input mono"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={0}
        step="any"
      />
    </Field>
  );
}

function Segment({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mono"
      style={{
        padding: "0.5rem 0.25rem", fontSize: "0.65rem", cursor: "pointer", border: "none",
        background: active ? "var(--accent)" : "var(--bg-1)",
        color: active ? "#000" : "var(--text-2)", transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function Check({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem", textAlign: "left", cursor: "pointer",
        padding: "0.55rem 0.65rem",
        border: `1px solid ${checked ? "var(--accent-border)" : "var(--border)"}`,
        background: checked ? "var(--accent-glow)" : "var(--bg-1)",
        transition: "all 0.15s",
      }}
    >
      <span
        aria-hidden="true"
        className="mono"
        style={{
          flexShrink: 0, width: "1.05rem", height: "1.05rem", display: "inline-flex",
          alignItems: "center", justifyContent: "center",
          border: `1px solid ${checked ? "var(--accent)" : "var(--border-hi)"}`,
          background: checked ? "var(--accent)" : "transparent",
          color: checked ? "#000" : "var(--text-3)", fontSize: "0.75rem", fontWeight: 700, lineHeight: 1,
        }}
      >
        {checked ? "✓" : ""}
      </span>
      <span style={{ display: "grid", gap: "0.1rem" }}>
        <span style={{ color: checked ? "var(--text-0)" : "var(--text-1)", fontSize: "0.76rem", fontWeight: 600 }}>{label}</span>
        <span className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem" }}>{"// " + hint}</span>
      </span>
    </button>
  );
}

function ScoreCard({ title, value, sub, color }: { title: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: "var(--bg-2)", textAlign: "center", padding: "0.75rem 0.5rem" }}>
      <div
        className="mono"
        style={{ color: "var(--text-3)", fontSize: "0.55rem", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.3rem" }}
      >
        {title}
      </div>
      <div style={{ color, fontSize: "1.5rem", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
      <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", marginTop: "0.3rem", lineHeight: 1.4 }}>{sub}</div>
    </div>
  );
}
