"use client";

// ============================================================
// PatientContext — estado de paciente compartido entre calculadoras.
// El "paciente activo" (peso, talla, edad, sexo) vive aquí y cualquier
// calculadora puede leerlo/escribirlo. Persistencia local (localStorage);
// export/import JSON para que el dato dependa solo del dispositivo/nube del
// usuario (sin backend). Deriva IBW/ABW/LBM/BMI/BSA.
// ============================================================

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Sex = "male" | "female";
export type WeightType = "real" | "ideal" | "adjusted" | "lean";

// Clase ASA (I–VI) + modificador de emergencia (sufijo "E").
export type AsaClass = 1 | 2 | 3 | 4 | 5 | 6;
export type Mallampati = 1 | 2 | 3 | 4;
// Riesgo quirúrgico para RCRI: alto = intraperitoneal / intratorácica /
// vascular suprainguinal (Lee et al. 1999).
export type SurgeryRisk = "low" | "intermediate" | "high";

// Comorbilidades relevantes para la valoración preanestésica y los scores.
// Todas opcionales/boolean; ausente = no marcada (no interrogada ≈ negativa).
export interface Comorbidities {
  htn?: boolean; // hipertensión arterial (STOP-BANG · perfil cardiovascular)
  ischemicHeart?: boolean; // cardiopatía isquémica (RCRI)
  chf?: boolean; // insuficiencia cardíaca congestiva (RCRI)
  cerebrovascular?: boolean; // ACV / AIT (RCRI)
  insulinDm?: boolean; // diabetes en tratamiento con insulina (RCRI)
  copd?: boolean; // EPOC
  osa?: boolean; // apnea obstructiva del sueño / ronquido (STOP-BANG)
  smoker?: boolean; // fumador activo (Apfel: fumador ↓ NVPO)
}

export interface Patient {
  id: string;
  label: string; // alias/etiqueta o nombre (uso exclusivo del médico, local)
  mrn?: string; // nº de expediente opcional (local, del médico)
  weightKg: number | null;
  heightCm: number | null;
  ageYears: number | null;
  sex: Sex;
  notes?: string;
  updatedAt: number;

  // ---- Valoración preanestésica (todos opcionales, backward-compatible) ----
  asaClass?: AsaClass; // clasificación ASA I–VI
  asaEmergency?: boolean; // modificador "E" (emergencia)
  hematocrit?: number; // Hct inicial (%) — para MABL
  creatinine?: number; // creatinina sérica (mg/dL) — RCRI · Cockcroft-Gault
  fastingHours?: number; // horas de ayuno (NPO)
  mallampati?: Mallampati; // vía aérea — clase de Mallampati I–IV
  surgeryRisk?: SurgeryRisk; // riesgo quirúrgico (RCRI)
  comorbidities?: Comorbidities; // antecedentes relevantes
  ponvHistory?: boolean; // antecedente de NVPO / cinetosis (Apfel)
  postopOpioids?: boolean; // uso previsto de opioides postop (Apfel)
  allergies?: string; // alergias (texto libre)
  medications?: string; // medicación habitual (texto libre)
}

export interface DerivedWeights {
  real: number | null;
  ideal: number | null; // IBW Devine
  adjusted: number | null; // ABW = IBW + 0.4(real - IBW)
  lean: number | null; // LBM Boer
  bmi: number | null;
  bsa: number | null; // Mosteller
}

// ---- Fórmulas antropométricas (literatura aceptada) ----
export function idealBodyWeight(heightCm: number, sex: Sex): number {
  // Devine (métrico): 50 (♂) / 45.5 (♀) kg + 0.9 kg por cada cm sobre 152.4.
  const base = sex === "male" ? 50 : 45.5;
  return Math.max(0, base + 0.9 * (heightCm - 152.4));
}
export function leanBodyMass(weightKg: number, heightCm: number, sex: Sex): number {
  // Boer.
  return sex === "male"
    ? 0.407 * weightKg + 0.267 * heightCm - 19.2
    : 0.252 * weightKg + 0.473 * heightCm - 48.3;
}
export function adjustedBodyWeight(weightKg: number, ibw: number): number {
  // ABW = IBW + 0.4 (real - IBW); si el real < IBW se usa el real.
  return weightKg > ibw ? ibw + 0.4 * (weightKg - ibw) : weightKg;
}
export function bodyMassIndex(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return weightKg / (m * m);
}
export function bodySurfaceArea(weightKg: number, heightCm: number): number {
  // Mosteller.
  return Math.sqrt((heightCm * weightKg) / 3600);
}

export function deriveWeights(p: Patient): DerivedWeights {
  const w = p.weightKg;
  const h = p.heightCm;
  if (w == null || w <= 0) {
    return { real: w ?? null, ideal: null, adjusted: null, lean: null, bmi: null, bsa: null };
  }
  const ideal = h && h > 0 ? idealBodyWeight(h, p.sex) : null;
  return {
    real: w,
    ideal,
    adjusted: ideal != null ? adjustedBodyWeight(w, ideal) : null,
    lean: h && h > 0 ? leanBodyMass(w, h, p.sex) : null,
    bmi: h && h > 0 ? bodyMassIndex(w, h) : null,
    bsa: h && h > 0 ? bodySurfaceArea(w, h) : null,
  };
}

/** Devuelve el peso (kg) del tipo pedido, con fallback al real. */
export function weightOfType(p: Patient, type: WeightType): number | null {
  const d = deriveWeights(p);
  switch (type) {
    case "ideal": return d.ideal ?? d.real;
    case "adjusted": return d.adjusted ?? d.real;
    case "lean": return d.lean ?? d.real;
    default: return d.real;
  }
}

// ============================================================
// Scores de riesgo perioperatorio — helpers puros
// Fórmulas EXACTAS de las calculadoras dedicadas (mismos cortes y
// porcentajes de literatura aceptada). Cada una con su cita breve.
// Devuelven null cuando faltan datos imprescindibles.
// ============================================================

// ---- RCRI (Índice de Lee revisado) ----------------------------------
// Lee TH, et al. Circulation. 1999;100(10):1043-1049.
// 6 factores, 1 punto c/u: cirugía alto riesgo, cardiopatía isquémica,
// ICC, enfermedad cerebrovascular, DM insulinodependiente, Cr > 2 mg/dL.
// Riesgo de evento cardíaco mayor: 0→0.4% · 1→0.9% · 2→6.6% · ≥3→11%.
export type RcriRiskClass = "Clase I" | "Clase II" | "Clase III" | "Clase IV";
export interface RcriResult {
  points: number; // 0–6
  riskClass: RcriRiskClass;
  riskPct: number; // % evento cardíaco mayor
}

export function rcriScore(p: Patient): RcriResult {
  const c = p.comorbidities ?? {};
  const points =
    (p.surgeryRisk === "high" ? 1 : 0) +
    (c.ischemicHeart ? 1 : 0) +
    (c.chf ? 1 : 0) +
    (c.cerebrovascular ? 1 : 0) +
    (c.insulinDm ? 1 : 0) +
    (p.creatinine != null && p.creatinine > 2 ? 1 : 0);

  // ≥3 factores → clase IV (misma banda de mayor riesgo, Lee 1999).
  const RISK: Record<0 | 1 | 2 | 3, { cls: RcriRiskClass; pct: number }> = {
    0: { cls: "Clase I", pct: 0.4 },
    1: { cls: "Clase II", pct: 0.9 },
    2: { cls: "Clase III", pct: 6.6 },
    3: { cls: "Clase IV", pct: 11 },
  };
  const key = (points >= 3 ? 3 : points) as 0 | 1 | 2 | 3;
  return { points, riskClass: RISK[key].cls, riskPct: RISK[key].pct };
}

// ---- STOP-BANG (cribado de AOS) — PARCIAL ---------------------------
// Chung F, et al. Anesthesiology 2008;108(5):812-821 · Chest 2016;149(3):631-638.
// 8 ítems, 1 punto c/u. Desde el paciente activo solo son derivables:
//   B (IMC>35), A (edad>50), G (sexo masculino), P (HTA), S/O (OSA/ronquido).
// Los ítems T (cansancio) y N (cuello>40 cm) no se recogen aquí ⇒ el score es
// un LÍMITE INFERIOR (parcial). "osa" cuenta S y O si está marcada.
// Bandas: 0-2 bajo · 3-4 intermedio · 5-8 alto.
export type StopBangRisk = "low" | "intermediate" | "high";
export interface StopBangResult {
  score: number; // 0–8 (parcial)
  risk: StopBangRisk;
  partial: true; // recordatorio: no incluye todos los ítems
}

export function stopBang(p: Patient): StopBangResult {
  const c = p.comorbidities ?? {};
  const d = deriveWeights(p);
  let score = 0;
  if (d.bmi != null && d.bmi > 35) score += 1; // B
  if (p.ageYears != null && p.ageYears > 50) score += 1; // A
  if (p.sex === "male") score += 1; // G
  if (c.htn) score += 1; // P
  if (c.osa) score += 2; // S + O (ronquido + apneas presenciadas)
  const risk: StopBangRisk = score <= 2 ? "low" : score <= 4 ? "intermediate" : "high";
  return { score, risk, partial: true };
}

// ---- Apfel (riesgo de NVPO) -----------------------------------------
// Apfel CC, et al. Anesthesiology. 1999;91(3):693-700.
// 4 factores: sexo femenino · no fumador · antecedente NVPO/cinetosis ·
// opioides postop. Riesgo ~24 h: 0→10% · 1→21% · 2→39% · 3→61% · 4→79%.
export interface ApfelResult {
  score: number; // 0–4
  riskPct: number;
}

export function apfel(p: Patient): ApfelResult {
  const smoker = p.comorbidities?.smoker ?? false;
  const score =
    (p.sex === "female" ? 1 : 0) +
    (!smoker ? 1 : 0) +
    (p.ponvHistory ? 1 : 0) +
    (p.postopOpioids ? 1 : 0);
  const RISK: Record<0 | 1 | 2 | 3 | 4, number> = { 0: 10, 1: 21, 2: 39, 3: 61, 4: 79 };
  return { score, riskPct: RISK[score as 0 | 1 | 2 | 3 | 4] };
}

// ---- Cockcroft-Gault (aclaramiento de creatinina) -------------------
// Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41.
// CrCl (mL/min) = (140 − edad) × peso × (0.85 si mujer) / (72 × Cr).
// Usa el peso real del paciente activo (como la calculadora dedicada por defecto).
export function cockcroftGault(p: Patient): number | null {
  const age = p.ageYears;
  const w = p.weightKg;
  const cr = p.creatinine;
  if (age == null || w == null || cr == null) return null;
  if (age <= 0 || w <= 0 || cr <= 0) return null;
  const sexFactor = p.sex === "female" ? 0.85 : 1;
  const value = ((140 - age) * w * sexFactor) / (72 * cr);
  return value > 0 ? value : 0;
}

// ---- MABL (pérdida sanguínea máxima permitida) ----------------------
// Gross JB. Anesthesiology. 1983;58(3):277-280.
// VSE = peso × EBV(mL/kg) [70 varón · 65 mujer] ·
// MABL = VSE × (Hct − Hct_min) / Hct.  Hct_min por defecto 21%.
export function mabl(p: Patient, hctMin = 21): number | null {
  const w = p.weightKg;
  const hct = p.hematocrit;
  if (w == null || hct == null) return null;
  if (w <= 0 || hct <= 0 || hct <= hctMin) return null;
  const ebvPerKg = p.sex === "female" ? 65 : 70;
  const ebv = w * ebvPerKg;
  return (ebv * (hct - hctMin)) / hct;
}

// ---- Estadio KDIGO por CrCl (para el reporte) -----------------------
// KDIGO 2012 — mismas bandas que la calculadora de aclaramiento.
export function kdigoStage(crcl: number): string {
  if (crcl >= 90) return "G1 (normal/alta)";
  if (crcl >= 60) return "G2 (descenso leve)";
  if (crcl >= 45) return "G3a (leve-moderado)";
  if (crcl >= 30) return "G3b (moderado-grave)";
  if (crcl >= 15) return "G4 (grave)";
  return "G5 (fallo renal)";
}

// ---- Contexto ----
interface PatientContextValue {
  active: Patient;
  setActive: (patch: Partial<Patient>) => void;
  derived: DerivedWeights;
  weightType: WeightType;
  setWeightType: (t: WeightType) => void;
  saved: Patient[];
  savePatient: () => void;
  loadPatient: (id: string) => void;
  deletePatient: (id: string) => void;
  newPatient: () => void;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

const emptyPatient = (): Patient => ({
  id: cryptoId(),
  label: "Paciente",
  weightKg: null,
  heightCm: null,
  ageYears: null,
  sex: "male",
  updatedAt: nowStamp(),
});

// Evita Date.now()/Math.random() directos en SSR: se resuelven en cliente.
function nowStamp(): number {
  return typeof performance !== "undefined" ? Math.floor(Date.now()) : 0;
}
function cryptoId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "p" + Math.floor(Date.now()).toString(36);
}

const ACTIVE_KEY = "dec.patient.active";
const SAVED_KEY = "dec.patient.saved";
const WTYPE_KEY = "dec.patient.weightType";

const Ctx = createContext<PatientContextValue | null>(null);

export function PatientProvider({ children }: { children: ReactNode }) {
  const [active, setActiveState] = useState<Patient>(emptyPatient);
  const [saved, setSaved] = useState<Patient[]>([]);
  const [weightType, setWeightTypeState] = useState<WeightType>("real");
  const [hydrated, setHydrated] = useState(false);

  // Hidratación desde localStorage (solo cliente).
  useEffect(() => {
    try {
      const a = localStorage.getItem(ACTIVE_KEY);
      if (a) setActiveState(JSON.parse(a));
      const s = localStorage.getItem(SAVED_KEY);
      if (s) setSaved(JSON.parse(s));
      const w = localStorage.getItem(WTYPE_KEY) as WeightType | null;
      if (w) setWeightTypeState(w);
    } catch {
      /* ignore corrupto */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
  }, [active, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [saved, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem(WTYPE_KEY, weightType);
  }, [weightType, hydrated]);

  const setActive = (patch: Partial<Patient>) =>
    setActiveState((p) => ({ ...p, ...patch, updatedAt: nowStamp() }));
  const setWeightType = (t: WeightType) => setWeightTypeState(t);

  const savePatient = () =>
    setSaved((list) => {
      const snap = { ...active, updatedAt: nowStamp() };
      const i = list.findIndex((x) => x.id === snap.id);
      if (i >= 0) {
        const copy = [...list];
        copy[i] = snap;
        return copy;
      }
      return [snap, ...list];
    });
  const loadPatient = (id: string) => {
    const p = saved.find((x) => x.id === id);
    if (p) setActiveState({ ...p });
  };
  const deletePatient = (id: string) => setSaved((l) => l.filter((x) => x.id !== id));
  const newPatient = () => setActiveState(emptyPatient());

  const exportJSON = () => JSON.stringify({ active, saved, weightType }, null, 2);
  const importJSON = (json: string): boolean => {
    try {
      const data = JSON.parse(json);
      if (data.active) setActiveState(data.active);
      if (Array.isArray(data.saved)) setSaved(data.saved);
      if (data.weightType) setWeightTypeState(data.weightType);
      return true;
    } catch {
      return false;
    }
  };

  const derived = useMemo(() => deriveWeights(active), [active]);

  const value: PatientContextValue = {
    active, setActive, derived, weightType, setWeightType,
    saved, savePatient, loadPatient, deletePatient, newPatient,
    exportJSON, importJSON,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePatient(): PatientContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePatient debe usarse dentro de <PatientProvider>");
  return ctx;
}

/** Hook de conveniencia: peso activo del tipo seleccionado (o el pasado). */
export function useActiveWeight(type?: WeightType): number | null {
  const { active, weightType } = usePatient();
  return weightOfType(active, type ?? weightType);
}
