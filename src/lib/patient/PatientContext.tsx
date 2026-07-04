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

// ---- Tipos de procedimiento (dependientes de procedimiento) ----
// ARISCAT — sitio de la incisión quirúrgica (Canet 2010).
export type SurgicalSite = "peripheral" | "upperAbdominal" | "intrathoracic";
// Estado funcional (Gupta MICA 2011 · usable también en fragilidad).
export type FunctionalStatus = "independent" | "partial" | "total";
// Magnitud/severidad quirúrgica (SORT — Protopapa 2014).
export type SurgeryMagnitude = "minor" | "intermediate" | "major" | "complex";
// Urgencia quirúrgica (SORT — Protopapa 2014).
export type SurgeryUrgency = "elective" | "expedited" | "urgent" | "immediate";
// Categoría de procedimiento del modelo Gupta MICA (21 grupos, Gupta 2011).
export type GuptaSurgeryType =
  | "anorectal" | "aortic" | "bariatric" | "brain" | "breast" | "cardiac"
  | "ent" | "foregutHpb" | "gallbladderAppendixAdrenalSpleen" | "hernia"
  | "intestinal" | "neck" | "obgyn" | "orthopedic" | "otherAbdominal"
  | "peripheralVascular" | "skin" | "spine" | "thoracicNonEsophageal"
  | "vein" | "urology";

// Comorbilidades relevantes para la valoración preanestésica y los scores.
// Todas opcionales/boolean; ausente = no marcada (no interrogada ≈ negativa).
export interface Comorbidities {
  htn?: boolean; // hipertensión arterial (STOP-BANG · perfil cardiovascular)
  ischemicHeart?: boolean; // cardiopatía isquémica (RCRI)
  chf?: boolean; // insuficiencia cardíaca congestiva (RCRI)
  cerebrovascular?: boolean; // ACV / AIT (RCRI)
  insulinDm?: boolean; // diabetes en tratamiento con insulina (RCRI)
  copd?: boolean; // EPOC (ARISCAT indirecto · Caprini enf. pulmonar)
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

  // ---- Dependientes de procedimiento y escalas ampliadas -----------------
  // (todos opcionales · backward-compatible)
  // -- Respiratorio / ARISCAT (Canet 2010) --
  spo2Preop?: number; // SpO₂ preoperatoria basal aire ambiente (%)
  hemoglobin?: number; // hemoglobina preop (g/dL) — ARISCAT (anemia ≤10)
  respInfectionRecent?: boolean; // infección respiratoria en el último mes
  // -- Procedimiento (compartido por ARISCAT/SORT/Gupta) --
  surgicalSite?: SurgicalSite; // sitio de la incisión (ARISCAT)
  surgeryDurationHours?: number; // duración prevista de cirugía (h) — ARISCAT
  emergencySurgery?: boolean; // cirugía de emergencia (ARISCAT +8; fallback: asaEmergency)
  functionalStatus?: FunctionalStatus; // estado funcional (Gupta MICA · fragilidad)
  surgeryMagnitude?: SurgeryMagnitude; // severidad quirúrgica (SORT)
  surgeryUrgency?: SurgeryUrgency; // urgencia (SORT)
  surgerySpecialtyHighRisk?: boolean; // especialidad de alto riesgo GI/torácica/vascular (SORT)
  cancer?: boolean; // neoplasia activa (SORT · Caprini malignidad)
  guptaSurgeryType?: GuptaSurgeryType; // categoría de procedimiento (Gupta MICA)
  // -- Factores de TEV / Caprini 2005 no derivables de lo existente --
  priorVTE?: boolean; // TEV previo (3)
  familyVTE?: boolean; // historia familiar de TEV (3)
  thrombophilia?: boolean; // trombofilia congénita/adquirida (3) — engloba F.V Leiden, etc.
  bedRest?: boolean; // paciente médico en cama / reposo (1)
  confinedBed72h?: boolean; // confinado en cama >72 h (2)
  centralLine?: boolean; // acceso venoso central (2)
  varicoseVeins?: boolean; // venas varicosas (1)
  ocpHrt?: boolean; // ACO / THR (1)
  pregnancyPostpartum?: boolean; // embarazo o postparto <1 mes (1)
  strokeRecent?: boolean; // ACV <1 mes (5)
  spinalCordInjury?: boolean; // lesión medular aguda <1 mes (5)
  majorLowerJointArthroplasty?: boolean; // artroplastia electiva mayor de MI (5)
  hipPelvisLegFracture?: boolean; // fractura de cadera/pelvis/pierna (5)
  multipleTrauma?: boolean; // politraumatismo <1 mes (5)
  ibd?: boolean; // enfermedad inflamatoria intestinal (1)
  castImmobilization?: boolean; // yeso inmovilizador (2)
  arthroscopic?: boolean; // cirugía artroscópica (2)
  legEdema?: boolean; // piernas edematizadas (1)
  recurrentMiscarriage?: boolean; // aborto espontáneo recurrente (1)
  sepsisRecent?: boolean; // sepsis <1 mes (1)
  acuteMi?: boolean; // IAM agudo (1)
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

// ---- ARISCAT (complicaciones pulmonares postoperatorias) ------------
// Canet J, et al. Anesthesiology. 2010;113(6):1338-1350.
// 7 predictores con puntos ponderados. Riesgo por total:
//   <26 bajo (~1.6%) · 26-44 intermedio (~13.3%) · ≥45 alto (~42.1%).
// Anemia preop = Hb ≤10 g/dL (si solo hay Hct, deriva Hb ≈ Hct/3).
// Emergencia: usa emergencySurgery, con fallback a asaEmergency.
// Devuelve null si faltan los datos imprescindibles (edad, SpO₂, sitio).
export type AriscatRisk = "low" | "intermediate" | "high";
export interface AriscatResult {
  points: number;
  risk: AriscatRisk;
  riskPct: number; // % complicación pulmonar (banda)
}

/** Hemoglobina efectiva (g/dL): usa hemoglobin; si falta, deriva de Hct/3. */
function effectiveHb(p: Patient): number | null {
  if (p.hemoglobin != null) return p.hemoglobin;
  if (p.hematocrit != null) return p.hematocrit / 3;
  return null;
}

export function ariscat(p: Patient): AriscatResult | null {
  // Datos imprescindibles del score dependiente de procedimiento.
  if (p.ageYears == null || p.spo2Preop == null || p.surgicalSite == null) return null;

  const age = p.ageYears;
  const agePts = age <= 50 ? 0 : age <= 80 ? 3 : 16; // ≤50 · 51-80 · >80

  const spo2 = p.spo2Preop;
  const spo2Pts = spo2 >= 96 ? 0 : spo2 >= 91 ? 8 : 24; // ≥96 · 91-95 · ≤90

  const infPts = p.respInfectionRecent ? 17 : 0; // infección respiratoria <1 mes

  const hb = effectiveHb(p);
  const anemiaPts = hb != null && hb <= 10 ? 11 : 0; // anemia preop Hb ≤10

  const sitePts =
    p.surgicalSite === "intrathoracic" ? 24
    : p.surgicalSite === "upperAbdominal" ? 15
    : 0; // periférica

  // Duración: ≤2 h → 0 · >2-3 h → 16 · >3 h → 23.
  const dur = p.surgeryDurationHours;
  const durPts = dur == null ? 0 : dur <= 2 ? 0 : dur <= 3 ? 16 : 23;

  const emerg = p.emergencySurgery ?? p.asaEmergency ?? false;
  const emergPts = emerg ? 8 : 0;

  const points = agePts + spo2Pts + infPts + anemiaPts + sitePts + durPts + emergPts;
  const risk: AriscatRisk = points < 26 ? "low" : points <= 44 ? "intermediate" : "high";
  const riskPct = points < 26 ? 1.6 : points <= 44 ? 13.3 : 42.1;
  return { points, risk, riskPct };
}

// ---- Caprini 2005 (riesgo de TEV) -----------------------------------
// Caprini JA. Dis Mon. 2005;51(2-3):70-78.
// Puntos ponderados (1/2/3/5). Categorías por total:
//   0 mínimo · 1-2 bajo · 3-4 moderado · ≥5 alto.
// Reutiliza edad, IMC (deriveWeights), comorbilidades (copd/chf/osa),
// cancer, y los factores dedicados priorVTE/thrombophilia/etc.
// NO devuelve null: es una suma de factores (ausente = negativo/no interrogado),
// pero la edad se pondera solo si está disponible.
export type CapriniCategory = "minimal" | "low" | "moderate" | "high";
export interface CapriniResult {
  points: number;
  category: CapriniCategory;
}

export function caprini(p: Patient): CapriniResult {
  const c = p.comorbidities ?? {};
  const d = deriveWeights(p);
  let pts = 0;

  // Edad (1: 41-60 · 2: 61-74 · 3: ≥75).
  if (p.ageYears != null) {
    const a = p.ageYears;
    if (a >= 75) pts += 3;
    else if (a >= 61) pts += 2;
    else if (a >= 41) pts += 1;
  }

  // ---- 1 punto c/u ----
  if (d.bmi != null && d.bmi > 25) pts += 1; // IMC >25
  if (p.legEdema) pts += 1; // piernas edematizadas
  if (p.varicoseVeins) pts += 1; // venas varicosas
  if (p.pregnancyPostpartum) pts += 1; // embarazo / postparto
  if (p.recurrentMiscarriage) pts += 1; // aborto espontáneo recurrente
  if (p.ocpHrt) pts += 1; // ACO / THR
  if (p.sepsisRecent) pts += 1; // sepsis <1 mes
  if (c.copd) pts += 1; // EPOC / función pulmonar anormal (o neumonía grave)
  if (p.acuteMi) pts += 1; // IAM agudo
  if (c.chf) pts += 1; // ICC <1 mes
  if (p.ibd) pts += 1; // enfermedad inflamatoria intestinal
  if (p.bedRest) pts += 1; // paciente médico en cama
  // (cirugía menor +1: cuando la magnitud SORT es "minor")
  if (p.surgeryMagnitude === "minor") pts += 1;

  // ---- 2 puntos c/u ----
  if (p.arthroscopic) pts += 2; // cirugía artroscópica
  // cirugía abierta/laparoscópica mayor >45 min ≈ magnitud major/complex
  if (p.surgeryMagnitude === "major" || p.surgeryMagnitude === "complex") pts += 2;
  if (p.cancer) pts += 2; // malignidad
  if (p.confinedBed72h) pts += 2; // confinado en cama >72 h
  if (p.castImmobilization) pts += 2; // yeso inmovilizador
  if (p.centralLine) pts += 2; // acceso venoso central

  // ---- 3 puntos c/u ----
  if (p.priorVTE) pts += 3; // TEV previo
  if (p.familyVTE) pts += 3; // historia familiar de TEV
  if (p.thrombophilia) pts += 3; // trombofilia congénita/adquirida (F.V Leiden, ACL, etc.)

  // ---- 5 puntos c/u ----
  if (p.strokeRecent) pts += 5; // ACV <1 mes
  if (p.majorLowerJointArthroplasty) pts += 5; // artroplastia electiva mayor MI
  if (p.hipPelvisLegFracture) pts += 5; // fractura cadera/pelvis/pierna
  if (p.spinalCordInjury) pts += 5; // lesión medular aguda <1 mes
  if (p.multipleTrauma) pts += 5; // politraumatismo <1 mes

  const category: CapriniCategory =
    pts === 0 ? "minimal" : pts <= 2 ? "low" : pts <= 4 ? "moderate" : "high";
  return { points: pts, category };
}

// ---- Gupta MICA (IAM / paro cardíaco perioperatorio) ----------------
// Gupta PK, et al. Circulation. 2011;124(4):381-387.
// Modelo logístico: riesgo(%) = e^x/(1+e^x)×100, con
//   x = −5.25 + 0.02·edad + f(estado funcional) + f(ASA) + f(creatinina)
//       + f(tipo de cirugía).
// Coeficientes PUBLICADOS de Gupta 2011 (verificados en 2 fuentes
// independientes: omnicalculator.com/health/mica y mdapp.co). NO inventados.
export interface GuptaResult {
  riskPct: number; // % (IAM o paro a 30 días)
}

// ASA: coeficientes del modelo (Gupta 2011). ASA V = referencia (0).
const GUPTA_ASA: Record<AsaClass, number> = {
  1: -5.17, 2: -3.29, 3: -1.92, 4: -0.95, 5: 0, 6: 0,
};
// Estado funcional (independiente = referencia).
const GUPTA_FUNCTIONAL: Record<FunctionalStatus, number> = {
  independent: 0, partial: 0.65, total: 1.03,
};
// Tipo de procedimiento (21 grupos, Gupta 2011). Hernia = referencia (0).
const GUPTA_SURGERY: Record<GuptaSurgeryType, number> = {
  anorectal: -0.16,
  aortic: 1.6,
  bariatric: -0.25,
  brain: 1.4,
  breast: -1.61,
  cardiac: 1.01,
  ent: 0.71, // ORL (excepto tiroides/paratiroides)
  foregutHpb: 1.39, // foregut / hepatopancreatobiliar
  gallbladderAppendixAdrenalSpleen: 0.59,
  hernia: 0,
  intestinal: 1.14,
  neck: 0.18, // cuello (tiroides/paratiroides)
  obgyn: 0.76,
  orthopedic: 0.8, // ortopédica / extremidad no vascular
  otherAbdominal: 1.13,
  peripheralVascular: 0.86,
  skin: 0.54,
  spine: 0.21,
  thoracicNonEsophageal: 0.4,
  vein: -1.09,
  urology: -0.26,
};

export function guptaMica(p: Patient): GuptaResult | null {
  // Imprescindibles: edad, ASA, estado funcional, tipo de cirugía.
  if (p.ageYears == null || p.asaClass == null) return null;
  if (p.functionalStatus == null || p.guptaSurgeryType == null) return null;

  // Creatinina: normal 0 · >1.5 mg/dL +0.61 · desconocida +0.46 (Gupta 2011).
  const crTerm =
    p.creatinine == null ? 0.46 : p.creatinine > 1.5 ? 0.61 : 0;

  const x =
    -5.25 +
    0.02 * p.ageYears +
    GUPTA_FUNCTIONAL[p.functionalStatus] +
    GUPTA_ASA[p.asaClass] +
    crTerm +
    GUPTA_SURGERY[p.guptaSurgeryType];

  const risk = (Math.exp(x) / (1 + Math.exp(x))) * 100;
  return { riskPct: risk };
}

// ---- SORT (mortalidad a 30 días) ------------------------------------
// Protopapa KL, et al. Br J Surg. 2014;101(13):1774-1783.
// Modelo logístico: riesgo(%) = e^x/(1+e^x)×100, con constante −7.366.
// Coeficientes PUBLICADOS (Tabla 4, Protopapa 2014 · full text PMC4240514):
//   ASA III +1.411 · IV +2.388 · V +4.081 (I-II = ref)
//   urgencia expedita +1.236 · urgente +1.657 · inmediata +2.452 (electiva = ref)
//   especialidad alto riesgo (GI/torácica/vascular) +0.712
//   severidad Xmayor/compleja +0.381 (menor-intermedia-mayor = ref)
//   cáncer +0.667 · edad 65-79 +0.777 · ≥80 +1.591 (<65 = ref)
export interface SortResult {
  riskPct: number; // % mortalidad a 30 días
}

const SORT_ASA: Record<AsaClass, number> = {
  1: 0, 2: 0, 3: 1.411, 4: 2.388, 5: 4.081, 6: 4.081,
};
const SORT_URGENCY: Record<SurgeryUrgency, number> = {
  elective: 0, expedited: 1.236, urgent: 1.657, immediate: 2.452,
};

export function sort(p: Patient): SortResult | null {
  // Imprescindibles: ASA, urgencia, magnitud, edad.
  if (p.asaClass == null || p.surgeryUrgency == null) return null;
  if (p.surgeryMagnitude == null || p.ageYears == null) return null;

  const ageTerm = p.ageYears >= 80 ? 1.591 : p.ageYears >= 65 ? 0.777 : 0;
  const severityTerm = p.surgeryMagnitude === "complex" ? 0.381 : 0; // Xmayor/compleja
  const specialtyTerm = p.surgerySpecialtyHighRisk ? 0.712 : 0;
  const cancerTerm = p.cancer ? 0.667 : 0;

  const x =
    -7.366 +
    SORT_ASA[p.asaClass] +
    SORT_URGENCY[p.surgeryUrgency] +
    specialtyTerm +
    severityTerm +
    cancerTerm +
    ageTerm;

  const risk = (Math.exp(x) / (1 + Math.exp(x))) * 100;
  return { riskPct: risk };
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
