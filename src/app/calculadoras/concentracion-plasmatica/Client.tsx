"use client";

// ============================================================
// Estimador de concentración plasmática (Cp) — farmacocinético
//
// ALCANCE: estimación POBLACIONAL de la concentración plasmática
// tras un bolo IV y/o una infusión continua, usando modelos
// compartimentales publicados (mamillares, macroconstantes
// A/B/C · α/β/γ derivadas de V1/V2/V3/CL/Q). NO es un TCI ni una
// bomba objetivo: no ajusta lazo cerrado, no corrige por Ce, y
// asume un paciente "promedio" del set de parámetros elegido.
//
// El modelo evalúa la respuesta unitaria a bolo (mg -> µg/mL por
// suma de exponenciales) y aplica superposición para la infusión
// (integral analítica de cada término exponencial). Cada set de
// parámetros lleva su cita. No inventar. No falsa precisión.
// ============================================================

import { useMemo, useState } from "react";
import { EXTENDED_MODELS } from "./pk-models-extended";
import { usePatient } from "@/lib/patient/PatientContext";

// ------------------------------------------------------------
// Modelo compartimental mamillar -> macroconstantes
// Referencia del álgebra: Bailey JM, Shafer SL. A simple analytical
// solution to the three-compartment pharmacokinetic model suitable
// for computer-controlled infusion pumps. IEEE Trans Biomed Eng.
// 1991;38(6):522-5. (raíces del polinomio característico y
// coeficientes A/B/C por fracciones parciales)
// ------------------------------------------------------------

// Un set de parámetros micro: volúmenes (L) y aclaramientos (L/min).
// V1 = compartimento central; V2/V3 = periféricos; CL = eliminación;
// Q2/Q3 = aclaramientos intercompartimentales.
export interface MicroParams {
  V1: number; // L
  V2: number; // L
  V3: number; // L (0 si bicompartimental)
  CL: number; // L/min
  Q2: number; // L/min
  Q3: number; // L/min (0 si bicompartimental)
}

// Resultado de la conversión a exponenciales: Cp(t) tras bolo unitario
// de 1 mg = sum_i coef_i * exp(-lambda_i * t)  [unidades: (mg/L)/mg = 1/L]
// Multiplicado por dosis en mg -> mg/L == µg/mL.
interface Exponentials {
  coef: number[]; // 1/L
  lambda: number[]; // 1/min
}

// Micro-rate constants -> tri/bi-exponenciales.
// k10 = CL/V1 ; k12 = Q2/V1 ; k21 = Q2/V2 ; k13 = Q3/V1 ; k31 = Q3/V3
function microToExponentials(p: MicroParams): Exponentials {
  const { V1, V2, V3, CL, Q2, Q3 } = p;
  const k10 = CL / V1;
  const k12 = Q2 / V1;
  const k21 = V2 > 0 ? Q2 / V2 : 0;
  const k13 = V3 > 0 ? Q3 / V1 : 0;
  const k31 = V3 > 0 ? Q3 / V3 : 0;

  const threeComp = V3 > 0 && Q3 > 0;

  if (!threeComp) {
    // Bicompartimental: polinomio característico
    // s^2 + a1 s + a0 = 0, con
    // a1 = k10 + k12 + k21 ; a0 = k10 * k21
    const a1 = k10 + k12 + k21;
    const a0 = k10 * k21;
    const disc = Math.sqrt(Math.max(a1 * a1 - 4 * a0, 0));
    const alpha = (a1 + disc) / 2;
    const beta = (a1 - disc) / 2;
    // Coeficientes para bolo unitario (Bailey/Shafer):
    // A = (alpha - k21) / (V1 * (alpha - beta))
    // B = (k21 - beta)  / (V1 * (alpha - beta))
    const denom = V1 * (alpha - beta);
    const A = (alpha - k21) / denom;
    const B = (k21 - beta) / denom;
    return { coef: [A, B], lambda: [alpha, beta] };
  }

  // Tricompartimental. Coeficientes del polinomio cúbico
  // s^3 + a2 s^2 + a1 s + a0 (signos según Bailey & Shafer 1991)
  const a2 = k10 + k12 + k13 + k21 + k31;
  const a1 = k21 * k31 + k10 * k31 + k10 * k21 + k12 * k31 + k13 * k21;
  const a0 = k10 * k21 * k31;

  const roots = cubicRoots(a2, a1, a0); // devuelve las tres raíces positivas (lambda)
  const [l1, l2, l3] = roots;

  // Coeficientes por fracciones parciales (bolo unitario):
  // coef_i = ( (k21 - lambda_i)(k31 - lambda_i) ) /
  //          ( V1 * (lambda_j - lambda_i)(lambda_k - lambda_i) )
  const coefFor = (li: number, lj: number, lk: number): number =>
    ((k21 - li) * (k31 - li)) / (V1 * (lj - li) * (lk - li));

  const C1 = coefFor(l1, l2, l3);
  const C2 = coefFor(l2, l1, l3);
  const C3 = coefFor(l3, l1, l2);

  return { coef: [C1, C2, C3], lambda: [l1, l2, l3] };
}

// Raíces del cúbico s^3 + a2 s^2 + a1 s + a0 con las tres raíces
// reales positivas (caso mamillar bien planteado). Método de Cardano
// para el caso de tres raíces reales (trigonométrico), devueltas
// ordenadas descendente (alpha > beta > gamma).
function cubicRoots(a2: number, a1: number, a0: number): [number, number, number] {
  // s = y - a2/3 -> y^3 + p y + q = 0
  const p = a1 - (a2 * a2) / 3;
  const q = (2 * a2 * a2 * a2) / 27 - (a2 * a1) / 3 + a0;
  const shift = a2 / 3;

  // Discriminante para tres raíces reales: (p/3)^3 + (q/2)^2 <= 0
  const term = Math.sqrt(Math.max(-(p * p * p) / 27, 0));
  const arg = term === 0 ? 0 : Math.acos(clamp(-q / (2 * term), -1, 1));
  const m = 2 * Math.sqrt(Math.max(-p / 3, 0));

  const y1 = m * Math.cos(arg / 3);
  const y2 = m * Math.cos((arg + 2 * Math.PI) / 3);
  const y3 = m * Math.cos((arg + 4 * Math.PI) / 3);

  const r = [y1 - shift, y2 - shift, y3 - shift].map((v) => Math.abs(v));
  r.sort((a, b) => b - a);
  return [r[0], r[1], r[2]];
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi);
}

// ------------------------------------------------------------
// Cp para una dosis en BOLO (mg) en t minutos tras el bolo:
//   Cp(t) = dosisMg * sum coef_i * exp(-lambda_i * t)   [µg/mL]
// ------------------------------------------------------------
function cpBolus(exp: Exponentials, doseMg: number, tMin: number): number {
  let s = 0;
  for (let i = 0; i < exp.coef.length; i++) {
    s += exp.coef[i] * Math.exp(-exp.lambda[i] * tMin);
  }
  return doseMg * s; // mg/L == µg/mL
}

// ------------------------------------------------------------
// Cp para una INFUSIÓN a tasa constante rateMgMin (mg/min), iniciada
// en t=0, evaluada en tMin (min). Por superposición, integrando cada
// término exponencial de la respuesta unitaria al bolo:
//   Cp(t) = rate * sum (coef_i / lambda_i) * (1 - exp(-lambda_i t))
// (válido durante la infusión; asumimos infusión aún corriendo a tMin)
// ------------------------------------------------------------
function cpInfusion(exp: Exponentials, rateMgMin: number, tMin: number): number {
  let s = 0;
  for (let i = 0; i < exp.coef.length; i++) {
    if (exp.lambda[i] <= 0) continue;
    s += (exp.coef[i] / exp.lambda[i]) * (1 - Math.exp(-exp.lambda[i] * tMin));
  }
  return rateMgMin * s;
}

// Cp en estado estacionario de una infusión: rate / CL
function cpSteadyState(clLmin: number, rateMgMin: number): number {
  if (clLmin <= 0) return 0;
  return rateMgMin / clLmin; // (mg/min)/(L/min) = mg/L = µg/mL
}

// ------------------------------------------------------------
// ke0 (constante de equilibrio plasma↔sitio efecto, min⁻¹) para el
// sitio-efecto Ce. Estos NO son parámetros del set PK (V/CL): son valores
// PD publicados y citados, replicados aquí para desacoplar esta calculadora
// de src/lib/tci/. Cada uno lleva su fuente. Los modelos sin ke0 confirmado
// devuelven 0 → esta calculadora solo traza Cp para ellos (no inventamos ke0).
//
// Fuentes (ya usadas y citadas en el proyecto):
//  · Marsh (propofol)        1.21              Struys MMRF et al. Anesthesiology 2000;92:399-406 (Marsh modificado)
//  · Eleveld propofol 2018   0.146·(WT/70)^−¼  Eleveld DJ et al. Br J Anaesth 2018;120:942-959 (ke0 arterial, Tabla 3)
//  · Minto (remifentanilo)   0.595−0.007·(edad−40)  Minto CF et al. Anesthesiology 1997;86:24-33 (impl. STANPUMP)
//  · Eleveld remifentanilo   1.09              Eleveld DJ et al. Anesthesiology 2017;126:1005-18 (referencia SEF)
//  · Shafer (fentanilo)      0.147             Scott JC, Stanski DR. J Pharmacol Exp Ther 1987;240:159-166
//  · Hannivoort (dexmed.)    0.0428            Colin PJ et al. Br J Anaesth 2017;119:200-210 (MOAA/S; experimental)
// ------------------------------------------------------------
interface Ke0Info {
  ke0: number; // min⁻¹ (0 = modelo sin sitio-efecto disponible aquí)
  source: string; // cita breve del ke0
  note?: string; // caveat visible (ke0 pump-dependiente / experimental / etc.)
}
function ke0For(drugId: string, cov: Cov): Ke0Info {
  switch (drugId) {
    case "propofol": // Marsh modificado
      return { ke0: 1.21, source: "Struys, Anesthesiology 2000 (Marsh modificado)" };
    case "propofol-eleveld":
      return {
        ke0: 0.146 * Math.pow(cov.weightKg / 70, -0.25),
        source: "Eleveld 2018 (ke0 arterial 0.146·(peso/70)^−¼)",
      };
    case "remifentanil": // Minto
      return {
        ke0: Math.max(0.01, 0.595 - 0.007 * (cov.ageYears - 40)),
        source: "Minto 1997 (ke0 0.595−0.007·(edad−40); impl. STANPUMP)",
      };
    case "remifentanil-eleveld":
      return {
        ke0: 1.09,
        source: "Eleveld 2017 (ke0 referencia 1.09; edad no ajustada)",
        note: "ke0 de referencia (35 a/70 kg/♂); no se ajusta por edad. Endpoint SEF, no BIS.",
      };
    case "fentanyl":
      return { ke0: 0.147, source: "Scott & Stanski 1987 (ke0 0.147)" };
    case "dex_hannivoort":
      return {
        ke0: 0.0428,
        source: "Colin 2017 (ke0 0.0428; MOAA/S)",
        note: "ke0 experimental (endpoint MOAA/S; t½ke0 ≈ 16 min).",
      };
    default:
      // Peds propofol, midazolam, Dyck/Morse dexmed., ketamina (Kamp), rocuronio:
      // sin ke0 confirmado para ESTE set PK → solo Cp.
      return { ke0: 0, source: "" };
  }
}

// ------------------------------------------------------------
// Muestreo de la trayectoria Cp(t) y Ce(t) sobre la ventana simulada, para
// la gráfica. Cp reutiliza las MISMAS soluciones analíticas del bolo y la
// infusión (cpBolus/cpInfusion) que la calculadora ya emplea — no cambia
// ningún coeficiente PK. Ce se obtiene integrando numéricamente la ecuación
// del sitio efecto dCe/dt = ke0·(Cp − Ce) (Euler, mismo álgebra que el motor
// TCI del proyecto) sobre la Cp muestreada. Si ke0 = 0, Ce queda vacía.
// ------------------------------------------------------------
export interface TrajSample {
  tMin: number;
  cp: number; // µg/mL (== mg/L)
  ce: number; // µg/mL — solo válido si hasCe
}
function sampleTrajectory(params: {
  exp: Exponentials;
  boloDoseMg: number | null; // bolo administrado en t=0 (mg), o null
  rateMgMin: number | null; // infusión constante desde t=0 (mg/min), o null
  ke0: number; // min⁻¹ (0 → sin Ce)
  tMaxMin: number; // horizonte de simulación (min)
}): { samples: TrajSample[]; hasCe: boolean } {
  const { exp, boloDoseMg, rateMgMin, ke0, tMaxMin } = params;
  const hasCe = ke0 > 0;

  // Paso de integración fino para el sitio efecto (Euler estable con ke0
  // rápidos ~1.2 min⁻¹); submuestreamos para dibujar ~180 puntos.
  const tMax = tMaxMin > 0 ? tMaxMin : 1;
  const dt = Math.min(0.05, tMax / 2000); // min
  const drawStep = Math.max(1, Math.round(tMax / dt / 180));

  const cpAt = (t: number): number => {
    let cp = 0;
    if (boloDoseMg !== null && boloDoseMg > 0) cp += cpBolus(exp, boloDoseMg, t);
    if (rateMgMin !== null && rateMgMin > 0) cp += cpInfusion(exp, rateMgMin, t);
    return cp;
  };

  const samples: TrajSample[] = [];
  let ce = 0;
  let t = 0;
  let i = 0;
  // t=0
  samples.push({ tMin: 0, cp: cpAt(0), ce: 0 });
  while (t < tMax - 1e-9) {
    const step = Math.min(dt, tMax - t);
    const cpNow = cpAt(t);
    if (hasCe) ce += ke0 * (cpNow - ce) * step;
    t += step;
    i++;
    if (i % drawStep === 0 || t >= tMax - 1e-9) {
      samples.push({ tMin: t, cp: cpAt(t), ce: Math.max(0, ce) });
    }
  }
  return { samples, hasCe };
}

// ------------------------------------------------------------
// Catálogo de fármacos con parámetros PK poblacionales citados.
// Los volúmenes/aclaramientos se escalan por peso donde el modelo
// original es por-kg; para Marsh (propofol) V1 y CL escalan con peso.
// ------------------------------------------------------------

// Covariables del paciente. Los modelos por-peso clásicos (Marsh, Shafer,
// Minto, midazolam) solo usan weightKg; los modelos generales (Eleveld,
// Hannivoort, etc.) usan además edad, talla y sexo.
export interface Cov {
  weightKg: number;
  ageYears: number;
  heightCm: number;
  sex: "male" | "female";
}

export interface DrugModel {
  id: string;
  name: string;
  note: string; // subtítulo clínico corto
  unit: "mcg" | "mg"; // unidad natural de la dosis clínica
  citation: string; // Vancouver breve del set PK
  // función que devuelve MicroParams dadas las covariables
  micro: (c: Cov) => MicroParams;
  // rango típico de Cp de referencia (para orientar, no como target)
  refCp?: string;
  peds?: boolean; // modelo pediátrico
}

// -- FENTANILO — Shafer SL, Varvel JR. Anesthesiology 1991;74:53-63
//    (modelo tricompartimental "Shafer"; V y CL absolutos, no por kg).
//    Valores ampliamente citados (STANPUMP / Shafer): V1 12.7 L,
//    V2 50 L, V3 295 L; CL 0.63 L/min, Q2 4.82 L/min, Q3 2.28 L/min.
const FENTANYL: DrugModel = {
  id: "fentanyl",
  name: "Fentanilo",
  note: "opioide · analgesia intraop",
  unit: "mcg",
  citation:
    "Shafer SL, Varvel JR. Anesthesiology. 1991;74:53-63 (parámetros Shafer, STANPUMP).",
  micro: () => ({
    V1: 12.7,
    V2: 50.0,
    V3: 295.0,
    CL: 0.63,
    Q2: 4.82,
    Q3: 2.28,
  }),
  refCp: "Cp analgésica ~1-2 ng/mL; supresión respuesta a incisión ~3-6 ng/mL (0.003-0.006 µg/mL)",
};

// -- REMIFENTANILO — Minto CF, et al. Anesthesiology 1997;86:10-33.
//    Modelo tricompartimental dependiente de edad y LBM. Aquí usamos
//    el estándar de referencia del paper para el "sujeto tipo"
//    (varón 70 kg, 170 cm, 40 años) — parámetros publicados del set
//    Minto para ese sujeto. El módulo NO reescala por edad (caveat).
const REMIFENTANIL: DrugModel = {
  id: "remifentanil",
  name: "Remifentanilo",
  note: "opioide ultracorto · context-sensitive ~3-4 min",
  unit: "mcg",
  citation:
    "Minto CF, et al. Anesthesiology. 1997;86:10-33 (sujeto tipo 70 kg/40 a/170 cm).",
  micro: () => ({
    // Minto, sujeto de referencia (Anesthesiology 1997;86 tabla parámetros)
    V1: 5.1,
    V2: 9.82,
    V3: 5.42,
    CL: 2.6,
    Q2: 2.05,
    Q3: 0.076,
  }),
  refCp: "Cp intraop típica ~2-8 ng/mL (0.002-0.008 µg/mL) según estímulo/combinación",
};

// -- MIDAZOLAM — parámetros bicompartimentales poblacionales.
//    Greenblatt DJ, et al. Anesthesiology 1984;61:27-35 y revisión
//    en Stoelting: Vd ~1.0-1.5 L/kg, CL ~6.4-11 mL/kg/min, t½β 1.7-2.6 h.
//    Aquí: modelo bicompartimental por-kg con V1 0.15 L/kg, V2 0.85 L/kg,
//    CL 6.6 mL/kg/min, Q2 ~ para reproducir t½α corto.
const MIDAZOLAM: DrugModel = {
  id: "midazolam",
  name: "Midazolam",
  note: "benzodiacepina · sedación/inducción",
  unit: "mg",
  citation:
    "Greenblatt DJ, et al. Anesthesiology. 1984;61:27-35; Stoelting Pharmacology (Vd 1-1.5 L/kg, CL 6-11 mL/kg/min).",
  micro: ({ weightKg: w }) => ({
    V1: 0.15 * w,
    V2: 0.85 * w,
    V3: 0,
    CL: 0.0066 * w * 1000 / 1000, // 6.6 mL/kg/min -> L/min
    Q2: 0.02 * w, // aprox. para t½α ~7-10 min (k12 ≈ 0.13/min); no un valor microcinético publicado
    Q3: 0,
  }),
  refCp: "Cp sedación ~40-100 ng/mL (0.04-0.1 µg/mL); hipnosis/inducción >250 ng/mL (>0.25 µg/mL)",
};

// -- PROPOFOL (Marsh) — Marsh B, et al. Br J Anaesth 1991;67:41-48.
//    Modelo tricompartimental por-peso. Constantes de tasa fijas
//    (Marsh "diprifusor"): k10 0.119, k12 0.112, k13 0.0419,
//    k21 0.055, k31 0.0033 /min ; V1 = 0.228 L/kg.
//    Derivamos micro-params consistentes con esas k y V1.
const PROPOFOL_MARSH: DrugModel = {
  id: "propofol",
  name: "Propofol (Marsh)",
  note: "hipnótico IV · inducción/mantenimiento",
  unit: "mg",
  citation:
    "Marsh B, et al. Br J Anaesth. 1991;67:41-48 (Diprifusor; V1 0.228 L/kg, k fijas).",
  micro: ({ weightKg: w }) => {
    const V1 = 0.228 * w; // L
    const k10 = 0.119;
    const k12 = 0.112;
    const k13 = 0.0419;
    const k21 = 0.055;
    const k31 = 0.0033;
    // Reconstruir volúmenes/aclaramientos consistentes:
    // Q2 = k12*V1 = k21*V2 -> V2 = k12*V1/k21 ; análogo V3.
    const V2 = (k12 * V1) / k21;
    const V3 = (k13 * V1) / k31;
    return {
      V1,
      V2,
      V3,
      CL: k10 * V1,
      Q2: k12 * V1,
      Q3: k13 * V1,
    };
  },
  refCp: "Cp hipnosis ~2-6 µg/mL; despertar ~1-1.5 µg/mL (Marsh/Schnider)",
};

const DRUGS: DrugModel[] = [
  PROPOFOL_MARSH,
  ...EXTENDED_MODELS.filter((m) => ["propofol-eleveld", "paedfusor", "kataria"].includes(m.id)),
  REMIFENTANIL,
  ...EXTENDED_MODELS.filter((m) => m.id === "remifentanil-eleveld"),
  FENTANYL,
  MIDAZOLAM,
  ...EXTENDED_MODELS.filter((m) => m.id.startsWith("dex_")),
  ...EXTENDED_MODELS.filter((m) => m.id.startsWith("ketamine")),
  ...EXTENDED_MODELS.filter((m) => m.id.startsWith("rocuronium")),
];

// ------------------------------------------------------------
// Parsing tolerante a coma decimal
// ------------------------------------------------------------
function parseNum(text: string): number | null {
  const raw = text.trim();
  if (raw.length === 0) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isNaN(n) ? null : n;
}

// Formato de Cp: elige unidad legible según magnitud
function formatCp(cpUgMl: number): { value: string; unit: string } {
  // cpUgMl en µg/mL == mg/L
  if (cpUgMl >= 0.5) {
    return { value: cpUgMl.toFixed(2), unit: "µg/mL" };
  }
  // µg/mL -> ng/mL (×1000)
  const ng = cpUgMl * 1000;
  if (ng >= 0.5) {
    return { value: ng.toFixed(1), unit: "ng/mL" };
  }
  return { value: (cpUgMl * 1000).toFixed(3), unit: "ng/mL" };
}

// ------------------------------------------------------------
// Componente
// ------------------------------------------------------------
export default function ConcentracionPlasmaticaClient() {
  const [drugId, setDrugId] = useState<string>("propofol");

  // Covariables PK (peso, edad, talla, sexo) → provienen del PACIENTE ACTIVO
  // (barra superior). Sin estado local: el value = contexto, onChange = setActive.
  // Editar aquí actualiza el paciente y, por ende, TODAS las calculadoras.
  const { active, setActive } = usePatient();

  // El value del input es el valor del contexto (string). Campo vacío si null
  // (fallback editable: al escribir se crea el dato en el paciente).
  const weightText = active.weightKg != null ? String(active.weightKg) : "";
  const ageText = active.ageYears != null ? String(active.ageYears) : "";
  const heightText = active.heightCm != null ? String(active.heightCm) : "";
  const sex = active.sex;

  // onChange → escribe de vuelta al paciente (bidireccional). Vacío → null.
  const setWeightText = (t: string) => setActive({ weightKg: parseNum(t) });
  const setAgeText = (t: string) => setActive({ ageYears: parseNum(t) });
  const setHeightText = (t: string) => setActive({ heightCm: parseNum(t) });
  const setSex = (s: "male" | "female") => setActive({ sex: s });

  // Bolo
  const [boloText, setBoloText] = useState("");
  const [boloElapsedText, setBoloElapsedText] = useState("0"); // min desde bolo

  // Infusión
  const [infusionRateText, setInfusionRateText] = useState(""); // en unidad/kg/min o unidad/kg/h según toggle
  const [infusionRateUnit, setInfusionRateUnit] = useState<"perKgMin" | "perKgHr">(
    "perKgHr"
  );
  const [infusionElapsedText, setInfusionElapsedText] = useState("10"); // min corriendo

  const drug = useMemo(
    () => DRUGS.find((d) => d.id === drugId) ?? PROPOFOL_MARSH,
    [drugId]
  );

  const weightKg = parseNum(weightText);

  const result = useMemo(() => {
    if (weightKg === null || !(weightKg > 0)) return null;

    const cov: Cov = {
      weightKg,
      ageYears: parseNum(ageText) ?? 40,
      heightCm: parseNum(heightText) ?? 170,
      sex,
    };
    const micro = drug.micro(cov);
    const exp = microToExponentials(micro);

    // --- BOLO ---
    const boloDose = parseNum(boloText); // en unidad natural (mcg o mg)
    const boloElapsed = parseNum(boloElapsedText) ?? 0;
    let cpBoloUgMl: number | null = null;
    let cpBoloPeakUgMl: number | null = null;
    let boloDoseMg: number | null = null; // dosis en mg para la trayectoria
    if (boloDose !== null && boloDose > 0 && boloElapsed >= 0) {
      boloDoseMg = drug.unit === "mcg" ? boloDose / 1000 : boloDose;
      cpBoloUgMl = cpBolus(exp, boloDoseMg, boloElapsed);
      cpBoloPeakUgMl = cpBolus(exp, boloDoseMg, 0); // pico teórico t=0 (dosis/V1)
    }

    // --- INFUSIÓN ---
    const rateInput = parseNum(infusionRateText);
    const infElapsed = parseNum(infusionElapsedText) ?? 0;
    let cpInfUgMl: number | null = null;
    let cpSsUgMl: number | null = null;
    let rateMgMinOut: number | null = null; // tasa en mg/min para la trayectoria
    if (rateInput !== null && rateInput > 0 && infElapsed >= 0) {
      // rate en unidad/kg/(min|h) -> mg/min total
      const perMin =
        infusionRateUnit === "perKgHr" ? rateInput / 60 : rateInput; // unidad/kg/min
      const totalUnitPerMin = perMin * weightKg; // unidad/min (mcg o mg)
      const rateMgMin =
        drug.unit === "mcg" ? totalUnitPerMin / 1000 : totalUnitPerMin;
      rateMgMinOut = rateMgMin;
      cpInfUgMl = cpInfusion(exp, rateMgMin, infElapsed);
      cpSsUgMl = cpSteadyState(micro.CL, rateMgMin);
    }

    // Cp total (bolo + infusión) si ambos presentes y comparten reloj:
    // Nota: usamos el tiempo del bolo y de infusión de forma
    // independiente; el total solo se muestra si el usuario dio ambos,
    // sumando la contribución del bolo en su t y la infusión en su t.
    let cpTotalUgMl: number | null = null;
    if (cpBoloUgMl !== null && cpInfUgMl !== null) {
      cpTotalUgMl = cpBoloUgMl + cpInfUgMl;
    }

    return {
      micro,
      exp,
      cov,
      cpBoloUgMl,
      cpBoloPeakUgMl,
      cpInfUgMl,
      cpSsUgMl,
      cpTotalUgMl,
      boloDoseMg,
      rateMgMin: rateMgMinOut,
      boloElapsed,
      infElapsed,
    };
  }, [
    drug,
    weightKg,
    ageText,
    heightText,
    sex,
    boloText,
    boloElapsedText,
    infusionRateText,
    infusionRateUnit,
    infusionElapsedText,
  ]);

  // Vidas medias aparentes (a partir de lambdas) para orientación
  const halfLives = useMemo(() => {
    if (!result) return null;
    return result.exp.lambda.map((l) => (l > 0 ? Math.LN2 / l : Infinity));
  }, [result]);

  // ke0 del fármaco activo (para el sitio efecto Ce). Depende del paciente
  // (peso/edad en Eleveld/Minto). 0 → el modelo no tiene sitio efecto aquí.
  const ke0Info = useMemo<Ke0Info | null>(() => {
    if (!result) return null;
    return ke0For(drugId, result.cov);
  }, [drugId, result]);

  // Trayectoria Cp/Ce para la gráfica. Horizonte = cubre los tiempos que el
  // usuario introdujo (bolo/infusión) con un mínimo razonable para ver la
  // subida/caída y el retraso del sitio efecto.
  const trajectory = useMemo(() => {
    if (!result || !ke0Info) return null;
    const hasBolo = result.boloDoseMg !== null;
    const hasInf = result.rateMgMin !== null;
    if (!hasBolo && !hasInf) return null;

    const elapsedMax = Math.max(result.boloElapsed, result.infElapsed, 0);
    // Ventana: al menos 15 min, y ~1.4× el mayor tiempo introducido, acotada.
    const tMaxMin = clamp(Math.max(15, elapsedMax * 1.4), 15, 240);

    return sampleTrajectory({
      exp: result.exp,
      boloDoseMg: result.boloDoseMg,
      rateMgMin: result.rateMgMin,
      ke0: ke0Info.ke0,
      tMaxMin,
    });
  }, [result, ke0Info]);

  const clearAll = () => {
    setBoloText("");
    setBoloElapsedText("0");
    setInfusionRateText("");
    setInfusionElapsedText("10");
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--text-3)",
    fontSize: "0.6rem",
    display: "block",
    marginBottom: "0.25rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  };

  const unitLabel = drug.unit === "mcg" ? "µg" : "mg";

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header estándar */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./concentracion-plasmatica.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Concentración plasmática (Cp)
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
          estimación PK poblacional · bolo IV + infusión · modelo bi/tricompartimental
          <br />
          <span style={{ opacity: 0.6 }}>
            {"// esto NO es un TCI: es un modelo, y el modelo no es el paciente"}
          </span>
        </p>
      </div>

      {/* ==================== CAVEAT PROMINENTE ==================== */}
      <div
        className="panel"
        style={{ borderLeft: "3px solid var(--amber)", marginBottom: "1rem" }}
      >
        <div
          className="panel-body"
          style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}
        >
          <span style={{ color: "var(--amber)", fontSize: "0.9rem" }}>⚠</span>
          <p
            style={{
              color: "var(--text-1)",
              fontSize: "0.72rem",
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Estimación <strong>poblacional</strong>, no individualizada. La
            variabilidad interindividual de la Cp es grande (a menudo
            ±50-100%). Los modelos asumen función hepática/cardíaca y volemia
            normales: <strong>no válidos</strong> en shock/bajo gasto,
            hepatopatía severa, obesidad extrema (IMC alto sacado de rango del
            set), pediatría o edades extremas sin reescalado. No sustituye la
            monitorización (BIS/entropía, hemodinámica, clínica).
          </p>
        </div>
      </div>

      {/* ==================== FÁRMACO Y PESO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> FÁRMACO Y PACIENTE
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div>
            <label className="mono" style={labelStyle}>
              Fármaco{" "}
              <span style={{ opacity: 0.5, textTransform: "none" }}>
                — set PK poblacional
              </span>
            </label>
            <select
              className="calc-select mono"
              value={drugId}
              onChange={(e) => setDrugId(e.target.value)}
            >
              {DRUGS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.note}
                </option>
              ))}
            </select>
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                marginTop: "0.3rem",
                lineHeight: 1.5,
              }}
            >
              {drug.citation}
            </div>
          </div>

          <div
            className="mono"
            style={{
              color: "var(--text-3)",
              fontSize: "0.55rem",
              lineHeight: 1.5,
              opacity: 0.8,
            }}
          >
            {"// peso · edad · talla · sexo usan el "}
            <span style={{ color: "var(--cyan)" }}>paciente activo (barra superior)</span>
            {" — editar aquí lo actualiza en todas las calculadoras"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="mono" style={labelStyle}>Peso (kg)</label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="70" value={weightText} onChange={(e) => setWeightText(e.target.value)} min={0} step="any" />
            </div>
            <div>
              <label className="mono" style={labelStyle}>Edad (años)</label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="40" value={ageText} onChange={(e) => setAgeText(e.target.value)} min={0} step="any" />
            </div>
            <div>
              <label className="mono" style={labelStyle}>Talla (cm)</label>
              <input type="number" inputMode="decimal" className="calc-input mono" placeholder="170" value={heightText} onChange={(e) => setHeightText(e.target.value)} min={0} step="any" />
            </div>
          </div>

          <div>
            <label className="mono" style={labelStyle}>Sexo</label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className="mono"
                  style={{
                    flex: 1, padding: "0.45rem", fontSize: "0.7rem", cursor: "pointer",
                    background: sex === s ? "var(--accent)" : "var(--bg-1)",
                    color: sex === s ? "#000" : "var(--text-2)",
                    border: `1px solid ${sex === s ? "var(--accent)" : "var(--border)"}`,
                  }}
                >
                  {s === "male" ? "Masculino" : "Femenino"}
                </button>
              ))}
            </div>
          </div>

          <div className="mono" style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}>
            {drug.refCp}
            {!drug.peds && (
              <span style={{ opacity: 0.6 }}> · edad/talla/sexo solo afectan a modelos generales (Eleveld, Hannivoort…)</span>
            )}
          </div>
        </div>
      </div>

      {/* ==================== BOLO IV ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> BOLO IV
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="mono" style={labelStyle}>
                Dosis bolo ({unitLabel})
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder={drug.unit === "mcg" ? "100" : "150"}
                value={boloText}
                onChange={(e) => setBoloText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
            <div>
              <label className="mono" style={labelStyle}>
                Tiempo desde bolo (min)
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder="0"
                value={boloElapsedText}
                onChange={(e) => setBoloElapsedText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
          </div>
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}
          >
            {"// Cp(t) = dosis/V1 al inicio, cae por redistribución (α) y eliminación (β/γ)"}
          </div>
        </div>
      </div>

      {/* ==================== INFUSIÓN ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> INFUSIÓN CONTINUA
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="mono" style={labelStyle}>
                Tasa ({unitLabel}/kg/{infusionRateUnit === "perKgHr" ? "h" : "min"})
              </label>
              <input
                type="number"
                inputMode="decimal"
                className="calc-input mono"
                placeholder={drug.unit === "mcg" ? "0.1" : "6"}
                value={infusionRateText}
                onChange={(e) => setInfusionRateText(e.target.value)}
                min={0}
                step="any"
              />
            </div>
            <div>
              <label className="mono" style={labelStyle}>
                Unidad de tasa
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
                {(["perKgHr", "perKgMin"] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setInfusionRateUnit(u)}
                    className="mono"
                    style={{
                      padding: "0.5rem 0.25rem",
                      fontSize: "0.6rem",
                      cursor: "pointer",
                      border: "none",
                      background:
                        u === infusionRateUnit ? "var(--accent)" : "var(--bg-1)",
                      color: u === infusionRateUnit ? "#000" : "var(--text-2)",
                      transition: "all 0.15s",
                    }}
                  >
                    {u === "perKgHr" ? "/kg/h" : "/kg/min"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="mono" style={labelStyle}>
              Tiempo de infusión (min)
            </label>
            <input
              type="number"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="10"
              value={infusionElapsedText}
              onChange={(e) => setInfusionElapsedText(e.target.value)}
              min={0}
              step="any"
            />
          </div>
          <div
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", lineHeight: 1.5 }}
          >
            {"// Cp por superposición; asume infusión aún corriendo a ese tiempo"}
          </div>
        </div>
      </div>

      {/* ==================== RESULTADOS ==================== */}
      {result ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> Cp ESTIMADA
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.6rem" }}>
            {/* Bolo */}
            {result.cpBoloUgMl !== null ? (
              <CpRow
                title="Cp bolo"
                cp={result.cpBoloUgMl}
                sub={
                  result.cpBoloPeakUgMl !== null
                    ? `pico teórico (t=0) ${formatCp(result.cpBoloPeakUgMl).value} ${
                        formatCp(result.cpBoloPeakUgMl).unit
                      }`
                    : undefined
                }
              />
            ) : null}

            {/* Infusión */}
            {result.cpInfUgMl !== null ? (
              <CpRow
                title="Cp infusión"
                cp={result.cpInfUgMl}
                sub={
                  result.cpSsUgMl !== null
                    ? `estado estacionario (Css) ${formatCp(result.cpSsUgMl).value} ${
                        formatCp(result.cpSsUgMl).unit
                      }`
                    : undefined
                }
              />
            ) : null}

            {/* Total */}
            {result.cpTotalUgMl !== null ? (
              <div
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.6rem",
                  marginTop: "0.2rem",
                }}
              >
                <CpRow title="Cp total (bolo + infusión)" cp={result.cpTotalUgMl} accent />
              </div>
            ) : null}

            {result.cpBoloUgMl === null && result.cpInfUgMl === null ? (
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.65rem",
                  padding: "0.5rem 0",
                }}
              >
                Ingresa un bolo y/o una infusión para estimar la Cp.
              </div>
            ) : null}
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
          }}
        >
          Ingresa un peso válido para estimar la Cp.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {"// sin peso no hay volumen de distribución que valga"}
          </span>
        </div>
      )}

      {/* ==================== GRÁFICA Cp / Ce ==================== */}
      {trajectory ? (
        <div className="panel fade-up" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> TRAYECTORIA Cp{trajectory.hasCe ? " / Ce" : ""} vs TIEMPO
          </div>
          <div className="panel-body">
            <CpCeChart
              samples={trajectory.samples}
              showCe={trajectory.hasCe}
              cpUnitScale={cpUnitScale(trajectory.samples)}
            />
            {trajectory.hasCe ? (
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  lineHeight: 1.6,
                  marginTop: "0.5rem",
                }}
              >
                {"// Ce (sitio efecto) vía dCe/dt = ke0·(Cp − Ce)"}
                {ke0Info && ke0Info.ke0 > 0 ? (
                  <>
                    {" · ke0 "}
                    <span style={{ color: "var(--cyan)" }}>{ke0Info.ke0.toFixed(3)} min⁻¹</span>
                    {" — "}
                    {ke0Info.source}
                  </>
                ) : null}
                {ke0Info?.note ? (
                  <>
                    <br />
                    <span style={{ color: "var(--amber)" }}>⚠ {ke0Info.note}</span>
                  </>
                ) : null}
              </div>
            ) : (
              <div
                className="mono"
                style={{
                  color: "var(--text-3)",
                  fontSize: "0.55rem",
                  lineHeight: 1.6,
                  marginTop: "0.5rem",
                }}
              >
                <span style={{ color: "var(--amber)" }}>
                  Este modelo no tiene ke0 confirmado para su set PK → solo se traza Cp (plasma).
                </span>
                <br />
                {"// no inventamos ke0: el sitio efecto (Ce) requiere un ke0 publicado y validado"}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ==================== PARÁMETROS PK ==================== */}
      {result ? (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> PARÁMETROS DEL MODELO
          </div>
          <div className="panel-body" style={{ display: "grid", gap: "0.35rem" }}>
            <PkRow label="V1 (central)" value={`${result.micro.V1.toFixed(2)} L`} />
            <PkRow label="V2 (periférico rápido)" value={`${result.micro.V2.toFixed(2)} L`} />
            {result.micro.V3 > 0 ? (
              <PkRow label="V3 (periférico lento)" value={`${result.micro.V3.toFixed(2)} L`} />
            ) : null}
            <PkRow label="CL (eliminación)" value={`${result.micro.CL.toFixed(3)} L/min`} />
            <PkRow label="Q2" value={`${result.micro.Q2.toFixed(3)} L/min`} />
            {result.micro.Q3 > 0 ? (
              <PkRow label="Q3" value={`${result.micro.Q3.toFixed(3)} L/min`} />
            ) : null}
            {halfLives ? (
              <div
                className="mono"
                style={{
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.4rem",
                  marginTop: "0.15rem",
                  color: "var(--text-3)",
                  fontSize: "0.58rem",
                  lineHeight: 1.6,
                }}
              >
                t½ aparentes:{" "}
                {halfLives
                  .filter((h) => Number.isFinite(h))
                  .map((h) => (h < 60 ? `${h.toFixed(1)} min` : `${(h / 60).toFixed(1)} h`))
                  .join(" · ")}
                <br />
                <span style={{ opacity: 0.7 }}>
                  {"// α = redistribución rápida; el último término = eliminación (β/γ)"}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ==================== NOTAS DE MODELO ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> QUÉ ES Y QUÉ NO ES ESTE CÁLCULO
        </div>
        <div className="panel-body">
          <ul
            style={{
              margin: "0 0 0 1.1rem",
              padding: 0,
              color: "var(--text-1)",
              fontSize: "0.78rem",
              lineHeight: 1.7,
            }}
          >
            <li style={{ marginBottom: "0.45rem" }}>
              Estima la concentración <strong>plasmática</strong> (Cp), no la del
              sitio efecto (Ce). La Ce va con retraso (histéresis, ke0) y suele
              ser lo que mejor predice el efecto clínico — este módulo no la modela.
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              Modelos: propofol{" "}
              <span className="mono" style={{ color: "var(--cyan)" }}>Marsh</span>,
              remifentanilo{" "}
              <span className="mono" style={{ color: "var(--cyan)" }}>Minto</span>,
              fentanilo{" "}
              <span className="mono" style={{ color: "var(--cyan)" }}>Shafer</span>,
              midazolam bicompartimental (Greenblatt/Stoelting).
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              La caída tras el bolo es <strong>bi/triexponencial</strong>: primero
              cae rápido por redistribución (fase α), luego lento por eliminación
              (β/γ). El &quot;pico teórico t=0&quot; = dosis/V1 sobreestima el pico
              real (la mezcla no es instantánea).
            </li>
            <li style={{ marginBottom: "0.45rem" }}>
              La infusión se calcula por superposición; el estado estacionario
              (Css) = tasa/CL sólo se alcanza tras varias vidas medias — con
              propofol/remifentanilo la Cp sube mucho más lento que ese Css.
            </li>
            <li>
              Schnider (propofol) y modelos alométricos (Eleveld) existen y a
              menudo se prefieren clínicamente; aquí usamos Marsh por simplicidad
              y trazabilidad. No tomes la cifra como un objetivo de TCI.
            </li>
          </ul>
        </div>
      </div>

      {/* Limpiar */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
        >
          limpiar campos
        </button>
      </div>

      {/* ==================== REFERENCIAS ==================== */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> REFERENCIAS
        </div>
        <div
          className="panel-body mono"
          style={{
            color: "var(--text-2)",
            fontSize: "0.6rem",
            lineHeight: 1.8,
            display: "grid",
            gap: "0.3rem",
          }}
        >
          <div>
            1. Shafer SL, Varvel JR. Pharmacokinetics, pharmacodynamics, and
            rational opioid selection. Anesthesiology. 1991;74(1):53-63.
          </div>
          <div>
            2. Minto CF, Schnider TW, et al. Influence of age and gender on the
            pharmacokinetics and pharmacodynamics of remifentanil.
            Anesthesiology. 1997;86(1):10-33.
          </div>
          <div>
            3. Marsh B, White M, Morton N, Kenny GN. Pharmacokinetic model driven
            infusion of propofol in children. Br J Anaesth. 1991;67(1):41-48.
          </div>
          <div>
            4. Schnider TW, et al. The influence of method of administration and
            covariates on the pharmacokinetics of propofol. Anesthesiology.
            1998;88(5):1170-82.
          </div>
          <div>
            5. Greenblatt DJ, et al. Effect of age, gender, and obesity on
            midazolam kinetics. Anesthesiology. 1984;61(1):27-35.
          </div>
          <div>
            6. Bailey JM, Shafer SL. A simple analytical solution to the
            three-compartment pharmacokinetic model. IEEE Trans Biomed Eng.
            1991;38(6):522-5.
          </div>
          <div>
            7. Miller RD (ed). Miller&apos;s Anesthesia. Cap. farmacocinética
            de anestésicos intravenosos.
          </div>
        </div>
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
        {"// Cp estimada de parámetros poblacionales — el paciente no leyó el paper"}
        <br />
        {"// no es TCI, no es Ce, no es dosis: es una brújula, no un GPS"}
        <br />
        {"// titula por clínica y monitorización; la responsabilidad clínica es del profesional"}
      </p>
    </div>
  );
}

// ------------------------------------------------------------
// Fila de resultado de Cp
// ------------------------------------------------------------
function CpRow({
  title,
  cp,
  sub,
  accent,
}: {
  title: string;
  cp: number;
  sub?: string;
  accent?: boolean;
}) {
  const f = formatCp(cp);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "0.5rem",
        }}
      >
        <span
          className="mono"
          style={{ color: "var(--text-1)", fontSize: "0.8rem" }}
        >
          {title}
        </span>
        <span style={{ flex: 1 }} />
        <span
          className="mono"
          style={{
            color: "var(--accent)",
            fontWeight: 700,
            fontSize: accent ? "1.05rem" : "0.95rem",
            whiteSpace: "nowrap",
          }}
        >
          {f.value}{" "}
          <span style={{ fontSize: "0.7rem", color: "var(--text-2)", fontWeight: 400 }}>
            {f.unit}
          </span>
        </span>
      </div>
      {sub ? (
        <div
          className="mono"
          style={{
            color: "var(--text-3)",
            fontSize: "0.55rem",
            marginTop: "0.15rem",
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------
// Fila de parámetro PK
// ------------------------------------------------------------
function PkRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: "0.5rem",
      }}
    >
      <span
        className="mono"
        style={{ color: "var(--text-2)", fontSize: "0.7rem" }}
      >
        {label}
      </span>
      <span
        className="mono"
        style={{ color: "var(--cyan)", fontSize: "0.72rem", fontWeight: 600 }}
      >
        {value}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Elige la unidad legible del eje de concentración según el máximo de la
// trayectoria (µg/mL para hipnóticos; ng/mL para opioides/dexmedetomidina).
// Devuelve el factor por el que multiplicar los valores en µg/mL.
// ------------------------------------------------------------
interface CpUnitScale {
  factor: number; // multiplicar valores en µg/mL por esto
  unit: string; // etiqueta de unidad
}
function cpUnitScale(samples: TrajSample[]): CpUnitScale {
  let peak = 0;
  for (const s of samples) {
    if (s.cp > peak) peak = s.cp;
    if (s.ce > peak) peak = s.ce;
  }
  // < 0.5 µg/mL → mostrar en ng/mL (×1000)
  if (peak > 0 && peak < 0.5) return { factor: 1000, unit: "ng/mL" };
  return { factor: 1, unit: "µg/mL" };
}

// ------------------------------------------------------------
// CpCeChart — gráfica SVG inline (sin librerías; CSP-safe) de Cp y —si el
// modelo tiene ke0— Ce frente al tiempo. Ejes con marcas, leyenda, colores
// del tema (Cp var(--accent), Ce var(--cyan)). Patrón adaptado de TciChart
// (src/app/tci/TciClient.tsx); duplicado a propósito para no acoplar esta
// calculadora al módulo TCI.
// ------------------------------------------------------------
function CpCeChart({
  samples,
  showCe,
  cpUnitScale: scale,
}: {
  samples: TrajSample[];
  showCe: boolean;
  cpUnitScale: CpUnitScale;
}) {
  const W = 680;
  const H = 300;
  const padL = 52;
  const padR = 16;
  const padT = 14;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  if (samples.length < 2) return null;

  const f = scale.factor;
  const tMax = samples[samples.length - 1]!.tMin || 1;
  let cMax = 0;
  for (const s of samples) {
    const cp = s.cp * f;
    if (cp > cMax) cMax = cp;
    if (showCe) {
      const ce = s.ce * f;
      if (ce > cMax) cMax = ce;
    }
  }
  cMax = cMax > 0 ? cMax * 1.08 : 1; // margen superior

  const x = (t: number) => padL + (t / tMax) * plotW;
  const yC = (c: number) => padT + plotH - (c / cMax) * plotH;

  const path = (pts: [number, number][]) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const cpPts = samples.map((s) => [x(s.tMin), yC(s.cp * f)] as [number, number]);
  const cePts = showCe
    ? samples.map((s) => [x(s.tMin), yC(s.ce * f)] as [number, number])
    : [];

  const xTicks = 5;
  const yTicks = 4;
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) => (tMax * i) / xTicks);
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (cMax * i) / yTicks);
  const yDecimals = cMax < 1 ? 3 : cMax < 5 ? 2 : cMax < 20 ? 1 : 0;

  return (
    <div style={{ minWidth: 420, overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Gráfica de concentración plasmática (Cp) y de sitio efecto (Ce) frente al tiempo"
        style={{ display: "block", maxWidth: "100%" }}
      >
        {/* Rejilla + marcas Y (concentración) */}
        {yTickVals.map((v, i) => (
          <g key={`y${i}`}>
            <line
              x1={padL}
              y1={yC(v)}
              x2={padL + plotW}
              y2={yC(v)}
              stroke="var(--border)"
              strokeWidth={0.5}
              opacity={0.6}
            />
            <text
              x={padL - 6}
              y={yC(v) + 3}
              textAnchor="end"
              fontSize={9}
              fill="var(--text-3)"
              fontFamily="var(--font-mono, monospace)"
            >
              {v.toFixed(yDecimals)}
            </text>
          </g>
        ))}
        {/* Etiqueta del eje Y (unidad) */}
        <text
          x={padL - 6}
          y={padT - 3}
          textAnchor="end"
          fontSize={8}
          fill="var(--text-3)"
          fontFamily="var(--font-mono, monospace)"
          opacity={0.8}
        >
          {scale.unit}
        </text>

        {/* Marcas X (tiempo) */}
        {xTickVals.map((v, i) => (
          <g key={`x${i}`}>
            <line
              x1={x(v)}
              y1={padT + plotH}
              x2={x(v)}
              y2={padT + plotH + 4}
              stroke="var(--text-3)"
              strokeWidth={0.5}
            />
            <text
              x={x(v)}
              y={padT + plotH + 15}
              textAnchor="middle"
              fontSize={9}
              fill="var(--text-3)"
              fontFamily="var(--font-mono, monospace)"
            >
              {v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Curva Cp */}
        <path d={path(cpPts)} fill="none" stroke="var(--accent)" strokeWidth={1.75} />
        {/* Curva Ce */}
        {showCe ? (
          <path d={path(cePts)} fill="none" stroke="var(--cyan)" strokeWidth={1.75} />
        ) : null}

        {/* Ejes */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + plotH}
          stroke="var(--text-3)"
          strokeWidth={0.75}
        />
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke="var(--text-3)"
          strokeWidth={0.75}
        />
      </svg>

      {/* Leyenda */}
      <div
        className="mono"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.9rem",
          marginTop: "0.4rem",
          fontSize: "0.56rem",
          color: "var(--text-3)",
        }}
      >
        <Legend color="var(--accent)" label={`Cp (plasma, ${scale.unit})`} />
        {showCe ? (
          <Legend color="var(--cyan)" label={`Ce (sitio efecto, ${scale.unit})`} />
        ) : null}
        <span style={{ marginLeft: "auto", opacity: 0.7 }}>t (min) →</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
      <span
        style={{
          display: "inline-block",
          width: 16,
          height: 0,
          borderTop: `2px solid ${color}`,
        }}
      />
      <span>{label}</span>
    </span>
  );
}
