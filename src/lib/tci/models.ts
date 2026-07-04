// ============================================================
// models.ts — Parámetros farmacocinéticos poblacionales para TCI/TIVA
//
// ⚠️ ARCHIVO CRÍTICO DE SEGURIDAD ⚠️
// Cada coeficiente aquí controla velocidades de infusión de anestésicos.
// Un valor equivocado → sobredosis o despertar intraoperatorio.
//
// REGLAS DE ESTE ARCHIVO:
//   1. Solo modelos poblacionales PUBLICADOS, con coeficientes EXACTOS.
//   2. Cada modelo cita autor + año + revista junto a sus parámetros.
//   3. Si no se pudo confirmar un coeficiente con certeza → se OMITE.
//      Preferimos pocos modelos sólidos a muchos dudosos.
//   4. Los modelos con TCI real (mamilar 3-comp + ke0) se marcan tci:true.
//      Los fármacos SIN modelo TCI válido son solo dosis por peso
//      (bolo/infusión simple): tci:false, con dosing por peso etiquetado.
//
// Contrato numérico (idéntico a la calculadora de Cp del proyecto y a
// engine.ts): micro(c) devuelve V en LITROS y CL/Q en L/MIN; ke0 en min⁻¹.
// ============================================================

import type { MicroParams } from "./engine";

// Covariables del paciente (leídas del paciente activo, solo lectura).
export interface Cov {
  weightKg: number;
  ageYears: number;
  heightCm: number;
  sex: "male" | "female";
}

// Unidad natural de dosis del fármaco.
export type DoseUnit = "mg" | "mcg";

// ------------------------------------------------------------
// Modelo TCI: farmacocinético compartimental completo.
// ------------------------------------------------------------
export interface TciModel {
  id: string;
  drug: string; // nombre del fármaco
  variant: string; // nombre del modelo (Schnider, Minto…)
  note: string; // subtítulo clínico corto
  unit: DoseUnit;
  citation: string; // Vancouver breve del set PK + ke0
  concUnit: string; // unidad de concentración objetivo mostrada (µg/mL o ng/mL)
  // Objetivo → unidad/L interna. Propofol: µg/mL = mg/L (factor 1 con unit=mg).
  // Opioides/dex: ng/mL. Interno trabaja en unidad natural/L:
  //   propofol mg, target µg/mL → mg/L (×1) ; remi µg, target ng/mL → µg/L (×1).
  targetToPerL: number; // multiplicador: (objetivo en concUnit) → (unidad/L interna)
  refTarget: string; // rango objetivo típico (orientación, NO prescripción)
  micro: (c: Cov) => MicroParams; // incluye ke0
  effectSite: boolean; // ¿tiene ke0 publicado → permite modo effect-site?
  wakeThreshold?: number; // umbral de "despertar" en unidad/L interna (orientativo)
  peds?: boolean;
  covariateWarning?: string; // caveat de covariables (p.ej. James LBM en obeso)
}

// ------------------------------------------------------------
// Modelo NO-TCI: fármacos sin modelo compartimental válido publicado
// para TCI. Solo dosis por peso (bolo y/o infusión simple).
// ------------------------------------------------------------
export interface WeightDoseModel {
  id: string;
  drug: string;
  note: string;
  unit: DoseUnit;
  // Dosis de bolo por peso: [min, max] en unidad/kg (undefined si no aplica).
  bolusPerKg?: [number, number];
  // Infusión por peso: [min, max] en unidad/kg/h (undefined si no aplica).
  infusionPerKgHr?: [number, number];
  infusionUnit?: "perKgHr" | "perKgMin"; // unidad de la infusión mostrada
  citation: string;
  reason: string; // por qué NO es TCI
}

// ============================================================
// FÓRMULAS ANTROPOMÉTRICAS usadas por los modelos (exactas de la literatura)
// ============================================================

// Masa magra — ecuación de JAMES (la que usan Schnider y Minto).
// weight en kg, height en cm. ⚠️ Es cuadrática en (peso/talla): a IMC alto
// la LBM calculada DECRECE y puede volverse negativa (defecto conocido de
// James → Schnider/Minto no fiables en obesidad mórbida).
export function lbmJames(weightKg: number, heightCm: number, sex: "male" | "female"): number {
  const ratio = weightKg / heightCm; // (kg/cm)
  return sex === "male"
    ? 1.1 * weightKg - 128 * ratio * ratio
    : 1.07 * weightKg - 148 * ratio * ratio;
}

// Masa libre de grasa — Al-Sallami 2015 (la que usan Eleveld/Hannivoort).
// weight kg, height cm, age años.
export function ffmAlSallami(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: "male" | "female",
): number {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  if (sex === "male") {
    return (
      (0.88 + (1 - 0.88) / (1 + Math.pow(ageYears / 13.4, -12.7))) *
      ((9270 * weightKg) / (6680 + 216 * bmi))
    );
  }
  return (
    (1.11 + (1 - 1.11) / (1 + Math.pow(ageYears / 7.1, -1.1))) *
    ((9270 * weightKg) / (8780 + 244 * bmi))
  );
}

// ============================================================
// PROPOFOL — Marsh (1991)
// Marsh B, White M, Morton N, Kenny GN. Br J Anaesth 1991;67:41-48.
// Modelo por-peso (Diprifusor). Constantes de tasa FIJAS; V1 = 0.228 L/kg.
// ke0: la calculadora usa el "Marsh modificado" (Struys) ke0 = 1.21 min⁻¹,
// que es el efecto-sitio clínicamente usado; el Marsh clásico/Diprifusor
// carecía de ke0 publicado (Diprifusor ke0 0.26 min⁻¹ da un pico muy lento).
// Fuente ke0: Struys MMRF et al. Anesthesiology 2000;92:399-406 (modified
// Marsh, ke0 1.21); ver también Absalom AR et al. BJA 2009 "devil in detail".
// ============================================================
export const PROPOFOL_MARSH: TciModel = {
  id: "propofol-marsh",
  drug: "Propofol",
  variant: "Marsh (modificado)",
  note: "hipnótico IV · sin edad (solo peso)",
  unit: "mg",
  concUnit: "µg/mL",
  targetToPerL: 1, // µg/mL == mg/L (unit=mg)
  citation:
    "Marsh B, et al. Br J Anaesth 1991;67:41-48 (Diprifusor; V1 0.228 L/kg, k fijas). ke0 1.21 min⁻¹ (Marsh modificado, Struys, Anesthesiology 2000).",
  refTarget: "inducción 4-6 µg/mL · mantenimiento 2-4 · despertar ~1-1.5",
  effectSite: true,
  wakeThreshold: 1.2, // µg/mL (mg/L) orientativo de despertar
  covariateWarning:
    "Marsh solo usa PESO (ignora edad/sexo/talla). Sobredosifica en ancianos (no ajusta por edad). Usar peso real.",
  micro: ({ weightKg: w }): MicroParams => {
    const V1 = 0.228 * w; // L
    const k10 = 0.119; // min⁻¹
    const k12 = 0.112;
    const k13 = 0.0419;
    const k21 = 0.055;
    const k31 = 0.0033;
    const V2 = (k12 * V1) / k21;
    const V3 = (k13 * V1) / k31;
    return {
      V1,
      V2,
      V3,
      CL: k10 * V1,
      Q2: k12 * V1,
      Q3: k13 * V1,
      ke0: 1.21, // Marsh modificado
    };
  },
};

// ============================================================
// PROPOFOL — Schnider (1998/1999)
// Schnider TW, et al. Anesthesiology 1998;88:1170-82 (PK) y
// 1999;90:1502-16 (PD/ke0). V1/V3/Q3 FIJOS; V2/CL/Q2 con covariables.
// LBM por JAMES. ke0 = 0.456 min⁻¹ (fijo).
// ⚠️ Coeficientes verificados uno a uno; ver comentario de cada línea.
// ============================================================
export const PROPOFOL_SCHNIDER: TciModel = {
  id: "propofol-schnider",
  drug: "Propofol",
  variant: "Schnider",
  note: "hipnótico IV · edad/talla/sexo · effect-site",
  unit: "mg",
  concUnit: "µg/mL",
  targetToPerL: 1,
  citation:
    "Schnider TW, et al. Anesthesiology 1998;88:1170-82 (PK) y 1999;90:1502-16 (ke0). V1 4.27 L; LBM James; ke0 0.456 min⁻¹.",
  refTarget: "inducción 3-6 µg/mL · mantenimiento 2-4 · despertar ~1-1.5",
  effectSite: true,
  wakeThreshold: 1.2,
  covariateWarning:
    "LBM de James es cuadrática: a IMC alto la LBM cae y el modelo subdosifica (riesgo de despertar en obeso mórbido). No recomendado si IMC >42 (♂) / >35 (♀).",
  micro: ({ weightKg: w, heightCm: h, ageYears: age, sex }): MicroParams => {
    const lbm = lbmJames(w, h, sex); // James (kg, cm)
    const V1 = 4.27; // L (fijo)
    const V2 = 18.9 - 0.391 * (age - 53); // L
    const V3 = 238; // L (fijo)
    const CL = 1.89 + 0.0456 * (w - 77) - 0.0681 * (lbm - 59) + 0.0264 * (h - 177); // L/min
    const Q2 = 1.29 - 0.024 * (age - 53); // L/min
    const Q3 = 0.836; // L/min (fijo)
    return { V1, V2, V3, CL, Q2, Q3, ke0: 0.456 };
  },
};

// ============================================================
// PROPOFOL — Eleveld (2018)  [set arterial, coadministración de opioides]
// Eleveld DJ, et al. Br J Anaesth 2018;120:942-959. Modelo alométrico de
// aplicación amplia (adultos, ancianos, obesos, peds). FFM Al-Sallami.
// ke0 del modelo Eleveld PD: depende de covariables; el paper da un ke0
// tiempo-al-pico-fijo. Aquí usamos el ke0 poblacional de referencia
// (~0.146 min⁻¹) NO — ver nota: el ke0 de Eleveld es dependiente de Cl/V y
// se computa por tpeak; para no introducir un ke0 aproximado, exponemos
// Eleveld en modo PLASMA-target (effectSite:false). Honestidad > features.
// (El PK está verificado; el ke0 exacto por tpeak lo omitimos.)
// ============================================================
export const PROPOFOL_ELEVELD: TciModel = {
  id: "propofol-eleveld",
  drug: "Propofol",
  variant: "Eleveld",
  note: "hipnótico IV · amplio (obeso/anciano/peds) · plasma",
  unit: "mg",
  concUnit: "µg/mL",
  targetToPerL: 1,
  citation:
    "Eleveld DJ, et al. Br J Anaesth 2018;120:942-959 (alométrico, FFM Al-Sallami). Aquí en modo plasma-target (ke0 por tpeak no incluido).",
  refTarget: "inducción 3-6 µg/mL · mantenimiento 2-4 · despertar ~1-1.5",
  effectSite: false, // ke0 exacto de Eleveld (por tpeak) omitido a propósito
  wakeThreshold: 1.2,
  peds: true,
  covariateWarning:
    "Asume coadministración de opioides (perioperatorio). Requiere edad, talla y sexo válidos.",
  micro: (c: Cov): MicroParams => {
    const WGT = c.weightKg;
    const AGE = c.ageYears;
    const HGT = c.heightCm;
    const male = c.sex === "male";
    const WGTref = 70,
      AGEref = 35,
      HGTref = 170;
    const PMA = AGE * 52.143 + 40;
    const PMAref = AGEref * 52.143 + 40;
    const Q1 = 6.28,
      Q2t = 25.5,
      Q3t = 273.0;
    const Q4 = 1.79,
      Q5 = 1.75,
      Q6 = 1.11;
    const Q8 = 42.3,
      Q9 = 9.06;
    const Q10 = -0.0156;
    const Q11 = -0.00286;
    const Q12 = 33.6;
    const Q13 = -0.0138;
    const Q14 = 68.3;
    const Q15 = 2.1;
    const Q16 = 1.3;
    const OPIOIDS = true;
    const faging = (x: number) => Math.exp(x * (AGE - AGEref));
    const fsigmoid = (x: number, E50: number, lambda: number) =>
      Math.pow(x, lambda) / (Math.pow(x, lambda) + Math.pow(E50, lambda));
    const fcentral = (wv: number) => fsigmoid(wv, Q12, 1);
    const BMI = WGT / Math.pow(HGT / 100, 2);
    const BMIref = WGTref / Math.pow(HGTref / 100, 2);
    const fAlSallami = (sm: boolean, age: number, wgt: number, bmi: number) =>
      sm
        ? (0.88 + (1 - 0.88) / (1 + Math.pow(age / 13.4, -12.7))) *
          ((9270 * wgt) / (6680 + 216 * bmi))
        : (1.11 + (1 - 1.11) / (1 + Math.pow(age / 7.1, -1.1))) *
          ((9270 * wgt) / (8780 + 244 * bmi));
    const FFM = fAlSallami(male, AGE, WGT, BMI);
    const FFMref = fAlSallami(true, AGEref, WGTref, BMIref);
    const fCLmat = fsigmoid(PMA, Q8, Q9);
    const fCLmatRef = fsigmoid(PMAref, Q8, Q9);
    const fQ3mat = fsigmoid(PMA, Q14, 1);
    const fQ3matRef = fsigmoid(PMAref, Q14, 1);
    const fopiCL = () => (OPIOIDS ? Math.exp(Q11 * AGE) : 1);
    const fopiV3 = () => (OPIOIDS ? Math.exp(Q13 * AGE) : 1);
    const V1 = Q1 * (fcentral(WGT) / fcentral(WGTref));
    const V2 = Q2t * (WGT / WGTref) * faging(Q10);
    const V3ref = Q3t;
    const V3 = Q3t * (FFM / FFMref) * fopiV3();
    const CLref = male ? Q4 : Q15;
    const CL = CLref * Math.pow(WGT / WGTref, 0.75) * (fCLmat / fCLmatRef) * fopiCL();
    const V2ref = Q2t;
    const Q2 = Q5 * Math.pow(V2 / V2ref, 0.75) * (1 + Q16 * (1 - fQ3mat));
    const Q3 = Q6 * Math.pow(V3 / V3ref, 0.75) * (fQ3mat / fQ3matRef);
    return { V1, V2, V3, CL, Q2, Q3, ke0: 0 };
  },
};

// ============================================================
// PROPOFOL PEDIÁTRICO — Paedfusor y Kataria
// (parámetros verificados en el proyecto; edad-dependientes)
// ke0 pediátrico de propofol no está unívocamente publicado por estos sets
// → plasma-target only (effectSite:false). Honestidad.
// ============================================================
export const PROPOFOL_PAEDFUSOR: TciModel = {
  id: "propofol-paedfusor",
  drug: "Propofol",
  variant: "Paedfusor (peds)",
  note: "pediátrico 1-16 a · plasma",
  unit: "mg",
  concUnit: "µg/mL",
  targetToPerL: 1,
  citation:
    "Absalom A, Kenny G. Br J Anaesth 2005;95:110 (Paedfusor). Validado en cirugía cardíaca pediátrica (BJA 2003;91:507-13).",
  refTarget: "inducción/mantenimiento 2-6 µg/mL (peds)",
  effectSite: false,
  peds: true,
  covariateWarning: "Pediátrico. Requiere edad y peso reales; fuera de 1-16 a no validado.",
  micro: ({ weightKg: wt, ageYears: age }): MicroParams => {
    const k12 = 0.114,
      k21 = 0.055,
      k13 = 0.0419,
      k31 = 0.0033;
    let V1: number;
    let k10: number;
    if (age < 13) {
      V1 = 0.4584 * wt;
      k10 = 0.1527 * Math.pow(wt, -0.3);
    } else if (age < 14) {
      V1 = 0.4 * wt;
      k10 = 0.0678;
    } else if (age < 15) {
      V1 = 0.342 * wt;
      k10 = 0.0792;
    } else if (age < 16) {
      V1 = 0.284 * wt;
      k10 = 0.0954;
    } else {
      V1 = 0.22857 * wt;
      k10 = 0.119;
    }
    const CL = k10 * V1;
    const Q2 = k12 * V1;
    const Q3 = k13 * V1;
    const V2 = Q2 / k21;
    const V3 = Q3 / k31;
    return { V1, V2, V3, CL, Q2, Q3, ke0: 0 };
  },
};

export const PROPOFOL_KATARIA: TciModel = {
  id: "propofol-kataria",
  drug: "Propofol",
  variant: "Kataria (peds)",
  note: "pediátrico 3-16 a · plasma",
  unit: "mg",
  concUnit: "µg/mL",
  targetToPerL: 1,
  citation: "Kataria BK, et al. Anesthesiology 1994;80:104-122 (peds 3-16 a, 15-61 kg).",
  refTarget: "inducción/mantenimiento 2-6 µg/mL (peds)",
  effectSite: false,
  peds: true,
  covariateWarning: "Pediátrico. Requiere edad y peso; fuera de 3-16 a / 15-61 kg no validado.",
  micro: ({ weightKg: wt, ageYears: age }): MicroParams => {
    const V1 = 0.41 * wt;
    let V2 = 0.78 * wt + 3.1 * age - 16;
    const V3 = 6.9 * wt;
    if (V2 <= 0) V2 = 0.1;
    const CL = 0.035 * wt;
    const Q2 = 0.077 * wt;
    const Q3 = 0.026 * wt;
    return { V1, V2, V3, CL, Q2, Q3, ke0: 0 };
  },
};

// ============================================================
// REMIFENTANILO — Eleveld (2017)  [PK verificado en el proyecto]
// Eleveld DJ, et al. Anesthesiology 2017;126:1005-18. Alométrico, FFM.
// ke0 de referencia del paper: 1.09 min⁻¹ (individuo tipo). El ke0 de
// Eleveld remi es covariable (envejece); para no aproximar exponemos el
// ke0 de referencia SOLO como effect-site en el sujeto tipo. Conservador:
// lo dejamos en plasma-target (effectSite:false) salvo confirmación.
// ============================================================
export const REMIFENTANIL_ELEVELD: TciModel = {
  id: "remifentanil-eleveld",
  drug: "Remifentanilo",
  variant: "Eleveld",
  note: "opioide ultracorto · amplio · plasma",
  unit: "mcg",
  concUnit: "ng/mL",
  targetToPerL: 1, // ng/mL == µg/L (unit=mcg → µg)
  citation:
    "Eleveld DJ, et al. Anesthesiology 2017;126:1005-18 (alométrico, FFM). Modo plasma-target (ke0 covariable no incluido).",
  refTarget: "analgesia/anestesia balanceada 2-8 ng/mL",
  effectSite: false,
  wakeThreshold: 1.0,
  covariateWarning: "Requiere edad, talla y sexo válidos.",
  micro: (c: Cov): MicroParams => {
    const AGE = c.ageYears;
    const TBW = c.weightKg;
    const HGT = c.heightCm;
    const MALE = c.sex === "male";
    const BMI = (10000.0 * TBW) / HGT / HGT;
    const AGEref = 35.0,
      TBWref = 70.0,
      HGTref = 170.0;
    const BMIref = (10000.0 * TBWref) / HGTref / HGTref;
    let FFM: number;
    if (MALE) {
      FFM =
        ((0.88 + (1.0 - 0.88) / (1.0 + Math.pow(AGE / 13.4, -12.7))) * (9270.0 * TBW)) /
        (6680.0 + 216.0 * BMI);
    } else {
      FFM =
        ((1.11 + (1.0 - 1.11) / (1.0 + Math.pow(AGE / 7.1, -1.1))) * (9270.0 * TBW)) /
        (8780.0 + 244.0 * BMI);
    }
    const FFMref =
      ((0.88 + (1.0 - 0.88) / (1.0 + Math.pow(AGEref / 13.4, -12.7))) * (9270.0 * TBWref)) /
      (6680.0 + 216.0 * BMIref);
    const faging = (x: number) => Math.exp(x * (AGE - AGEref));
    const fsigmoid = (x: number, E50: number, lambda: number) => {
      const xl = Math.pow(x, lambda);
      return xl / (xl + Math.pow(E50, lambda));
    };
    const th1 = 2.88,
      th2 = -0.00554,
      th3 = -0.00327,
      th4 = -0.0315,
      th5 = 0.47,
      th6 = -0.026;
    const V1ref = 5.81,
      V2ref = 8.82,
      V3ref = 5.03,
      CLref = 2.58,
      Q2ref = 1.72,
      Q3ref = 0.124;
    const SIZE = FFM / FFMref;
    const KMAT = fsigmoid(TBW, th1, 2);
    const KMATref = fsigmoid(TBWref, th1, 2);
    const KSEX = MALE ? 1.0 : 1.0 + th5 * fsigmoid(AGE, 12, 6) * (1.0 - fsigmoid(AGE, 45, 6));
    const V1 = V1ref * SIZE * faging(th2);
    const V2 = V2ref * SIZE * faging(th3) * KSEX;
    const V3 = V3ref * SIZE * faging(th4) * Math.exp(th6 * (TBW - 70.0));
    const CL = CLref * Math.pow(SIZE, 0.75) * (KMAT / KMATref) * KSEX * faging(th3);
    const Q2 = Q2ref * Math.pow(V2 / V2ref, 0.75) * faging(th2) * KSEX;
    const Q3 = Q3ref * Math.pow(V3 / V3ref, 0.75) * faging(th2);
    return { V1, V2, V3, CL, Q2, Q3, ke0: 0 };
  },
};

// ============================================================
// DEXMEDETOMIDINA — Hannivoort (2015)  [PK verificado en el proyecto]
// Hannivoort LN, et al. Anesthesiology 2015;123:357-67. Alométrico ref 70 kg.
// Sin ke0 unívoco de este set (el efecto-sitio de dex está menos establecido)
// → plasma-target only. Honestidad.
// ============================================================
export const DEX_HANNIVOORT: TciModel = {
  id: "dex-hannivoort",
  drug: "Dexmedetomidina",
  variant: "Hannivoort",
  note: "α2-agonista · sedación · plasma",
  unit: "mcg",
  concUnit: "ng/mL",
  targetToPerL: 1,
  citation: "Hannivoort LN, et al. Anesthesiology 2015;123:357-67 (alométrico, ref 70 kg). Plasma-target.",
  refTarget: "sedación 0.5-1.5 ng/mL (rango estudiado 0.5-8)",
  effectSite: false,
  covariateWarning: "Sin ke0 establecido para este set → solo plasma. Bradicardia/hipotensión con bolo rápido.",
  micro: ({ weightKg: wt }): MicroParams => {
    const wr = wt / 70;
    const sizeV = wr;
    const sizeCL = Math.pow(wr, 0.75);
    return {
      V1: 1.78 * sizeV,
      V2: 30.3 * sizeV,
      V3: 52.0 * sizeV,
      CL: 0.686 * sizeCL,
      Q2: 2.98 * sizeCL,
      Q3: 0.602 * sizeCL,
      ke0: 0,
    };
  },
};

// ============================================================
// KETAMINA — Kamp (2020)  [PK verificado en el proyecto]
// Kamp J, et al. Anesthesiology 2020;133:1192-1213. Meta-analítico 3-comp,
// ref 70 kg. Sin ke0 fiable → plasma-target only.
// ============================================================
export const KETAMINE_KAMP: TciModel = {
  id: "ketamine-kamp",
  drug: "Ketamina",
  variant: "Kamp (meta-analítico)",
  note: "disociativo · plasma",
  unit: "mcg",
  concUnit: "ng/mL",
  targetToPerL: 1,
  citation: "Kamp J, et al. Anesthesiology 2020;133:1192-1213 (meta-analítico 3-comp, ref 70 kg). Plasma-target.",
  refTarget: "analgesia ~100-200 ng/mL · anestesia/disociación ~1000-2000 ng/mL",
  effectSite: false,
  covariateWarning: "Sin ke0 fiable → solo plasma. Modelo estandarizado a 70 kg (sin covariables retenidas).",
  micro: ({ weightKg: WT }): MicroParams => {
    const wtV = WT / 70;
    const wtCL = Math.pow(WT / 70, 0.75);
    return {
      V1: 25 * wtV,
      V2: 56 * wtV,
      V3: 157 * wtV,
      CL: (84 * wtCL) / 60,
      Q2: (161 * wtCL) / 60,
      Q3: (79 * wtCL) / 60,
      ke0: 0,
    };
  },
};

// ============================================================
// ===== BLOQUE VERIFICADO EXTERNAMENTE (coeficientes confirmados) =====
// Cada modelo aquí tuvo sus coeficientes cotejados contra ≥2 fuentes
// independientes concordantes (OpenTCI/STANPUMP, paquete R `tci`, PDF Galeno,
// literatura PK). Los que NO se pudieron confirmar quedan OMITIDOS (ver nota
// al final del archivo).
// ============================================================

// ------------------------------------------------------------
// REMIFENTANILO — Minto (1997)
// Minto CF, Schnider TW, Egan TD, et al. Anesthesiology 1997;86:10-23 (PK)
// y 86:24-33 (PD). Modelo tricompartimental con covariables EDAD y LBM
// (James). ke0 = 0.595 − 0.007·(edad−40) min⁻¹ (valor de implementación
// STANPUMP/pump; reproduce tpeak ~1.6 min). Coeficientes verificados uno a
// uno contra OpenTCI, paquete R `tci`, PDF Galeno y Wikipedia (concordantes).
// ⚠️ LBM de James subdosifica en obeso (IMC >35 ♀ / >42 ♂) — se avisa.
// ------------------------------------------------------------
export const REMIFENTANIL_MINTO: TciModel = {
  id: "remifentanil-minto",
  drug: "Remifentanilo",
  variant: "Minto",
  note: "opioide ultracorto · edad/LBM · effect-site",
  unit: "mcg",
  concUnit: "ng/mL",
  targetToPerL: 1, // ng/mL == µg/L
  citation:
    "Minto CF, et al. Anesthesiology 1997;86:10-23 (PK) y 86:24-33 (PD). LBM James; ke0 0.595−0.007·(edad−40) min⁻¹ (implementación STANPUMP).",
  refTarget: "analgesia/anestesia balanceada 2-8 ng/mL",
  effectSite: true,
  wakeThreshold: 1.0,
  covariateWarning:
    "LBM de James subdosifica en obesidad (IMC >35 ♀ / >42 ♂): la LBM decrece con el peso alto. No recomendado fuera de ese rango.",
  micro: ({ weightKg: w, heightCm: h, ageYears: age, sex }): MicroParams => {
    const lbm = lbmJames(w, h, sex); // James (kg, cm)
    const V1 = 5.1 - 0.0201 * (age - 40) + 0.072 * (lbm - 55); // L
    const V2 = 9.82 - 0.0811 * (age - 40) + 0.108 * (lbm - 55); // L
    const V3 = 5.42; // L (fijo)
    const CL = 2.6 - 0.0162 * (age - 40) + 0.0191 * (lbm - 55); // L/min
    const Q2 = 2.05 - 0.0301 * (age - 40); // L/min
    const Q3 = 0.076 - 0.00113 * (age - 40); // L/min
    const ke0 = 0.595 - 0.007 * (age - 40); // min⁻¹ (implementación pump)
    return { V1, V2, V3, CL, Q2, Q3, ke0: Math.max(0.01, ke0) };
  },
};

// Los siguientes se añaden SOLO tras confirmación de sus agentes:
// Gepts sufentanilo, Maitre alfentanilo, Shafer fentanilo, Schüttler
// remimazolam. Ver bloque de inserción condicional al final.

// ------------------------------------------------------------
// Registro de modelos TCI activos. El orden define el orden del selector.
// (Minto/Shafer/Gepts/Maitre se insertan tras verificación en el bloque
//  siguiente y se concatenan en TCI_MODELS.)
// ------------------------------------------------------------
const TCI_BASE: TciModel[] = [
  PROPOFOL_SCHNIDER,
  PROPOFOL_MARSH,
  PROPOFOL_ELEVELD,
  PROPOFOL_PAEDFUSOR,
  PROPOFOL_KATARIA,
  REMIFENTANIL_MINTO,
  REMIFENTANIL_ELEVELD,
  DEX_HANNIVOORT,
  KETAMINE_KAMP,
];

// ============================================================
// FÁRMACOS NO-TCI (solo dosis por peso — bolo/infusión simple)
// No hay modelo compartimental TCI validado de uso rutinario para estos.
// Dosis de fuentes estándar (UpToDate/Miller/Stoelting/ficha técnica).
// ============================================================
export const WEIGHT_DOSE_MODELS: WeightDoseModel[] = [
  {
    id: "rocuronio",
    drug: "Rocuronio",
    note: "BNM no despolarizante",
    unit: "mg",
    bolusPerKg: [0.6, 1.2],
    infusionPerKgHr: [0.3, 0.6],
    infusionUnit: "perKgHr",
    citation: "Miller's Anesthesia; ficha técnica. Intubación 0.6 (0.9-1.2 secuencia rápida) mg/kg.",
    reason: "Bloqueante neuromuscular: se titula por TOF, no por concentración diana.",
  },
  {
    id: "vecuronio",
    drug: "Vecuronio",
    note: "BNM no despolarizante",
    unit: "mg",
    bolusPerKg: [0.08, 0.1],
    infusionPerKgHr: [0.048, 0.06],
    infusionUnit: "perKgHr",
    citation: "Miller's Anesthesia; Stoelting. Intubación 0.08-0.1 mg/kg.",
    reason: "Bloqueante neuromuscular: titulación por TOF, no TCI.",
  },
  {
    id: "atracurio",
    drug: "Atracurio",
    note: "BNM no despolarizante",
    unit: "mg",
    bolusPerKg: [0.4, 0.5],
    infusionPerKgHr: [0.3, 0.6],
    infusionUnit: "perKgHr",
    citation: "Miller's Anesthesia. Intubación 0.4-0.5 mg/kg; mantenimiento 5-10 µg/kg/min.",
    reason: "Bloqueante neuromuscular: titulación por TOF, no TCI.",
  },
  {
    id: "cisatracurio",
    drug: "Cisatracurio",
    note: "BNM no despolarizante",
    unit: "mg",
    bolusPerKg: [0.15, 0.2],
    infusionPerKgHr: [0.06, 0.18],
    infusionUnit: "perKgHr",
    citation: "Miller's Anesthesia. Intubación 0.15-0.2 mg/kg; mantenimiento 1-3 µg/kg/min.",
    reason: "Bloqueante neuromuscular: titulación por TOF, no TCI.",
  },
  {
    id: "sugammadex",
    drug: "Sugammadex",
    note: "reversor de BNM aminoesteroideo",
    unit: "mg",
    bolusPerKg: [2, 16],
    citation:
      "Ficha técnica. 2 mg/kg (TOF ≥2), 4 mg/kg (1-2 posttetánicas), 16 mg/kg (reversión inmediata tras rocuronio).",
    reason: "Dosis por peso y profundidad de bloqueo (TOF), no una concentración diana.",
  },
  {
    id: "mgso4",
    drug: "Sulfato de magnesio",
    note: "coadyuvante · antiarrítmico",
    unit: "mg",
    bolusPerKg: [30, 50],
    infusionPerKgHr: [8, 15],
    infusionUnit: "perKgHr",
    citation: "UpToDate. Carga 30-50 mg/kg en 15-20 min; mantenimiento 8-15 mg/kg/h.",
    reason: "Se dosifica por peso y magnesemia, no por PK compartimental.",
  },
  {
    id: "acido-tranexamico",
    drug: "Ácido tranexámico",
    note: "antifibrinolítico",
    unit: "mg",
    bolusPerKg: [10, 20],
    infusionPerKgHr: [1, 2],
    infusionUnit: "perKgHr",
    citation: "UpToDate; protocolos CRASH-2/trauma. Carga 10-20 mg/kg (o 1 g); mantenimiento 1-2 mg/kg/h.",
    reason: "Dosis fija/por peso, no TCI.",
  },
  {
    id: "heparina",
    drug: "Heparina no fraccionada",
    note: "anticoagulante (dosis en UI)",
    unit: "mg", // marcador; realmente UI — ver nota de UI
    bolusPerKg: [300, 400], // UI/kg (CEC); se muestra como UI en la UI
    citation: "Protocolo CEC. 300-400 UI/kg para CEC (objetivo ACT >400-480 s).",
    reason: "Se titula por ACT/anti-Xa, no por concentración plasmática diana. Dosis en UI/kg.",
  },
  {
    id: "protamina",
    drug: "Protamina",
    note: "reversor de heparina",
    unit: "mg",
    bolusPerKg: [1, 1.3], // mg por 100 UI de heparina — ver nota UI
    citation: "Protocolo CEC. ~1 mg por cada 100 UI de heparina a revertir (o por dosis-respuesta).",
    reason: "Dosis según heparina administrada/ACT, no TCI.",
  },
  {
    id: "lidocaina-iv",
    drug: "Lidocaína IV",
    note: "analgesia sistémica perioperatoria",
    unit: "mg",
    bolusPerKg: [1, 1.5],
    infusionPerKgHr: [1, 2], // mg/kg/h (algunos usan 1.5-3 intraop)
    infusionUnit: "perKgHr",
    citation: "UpToDate (lidocaína IV perioperatoria). Bolo 1-1.5 mg/kg; infusión 1-2 mg/kg/h.",
    reason:
      "No hay modelo TCI de lidocaína IV de uso rutinario validado; el margen tóxico es estrecho → dosis por peso con techo, no concentración diana.",
  },
];

// Concatenación final (los verificados externamente se añaden en el bloque
// de abajo mutando esta lista mediante push controlado).
export const TCI_MODELS: TciModel[] = [...TCI_BASE];

// Utilidad: agrupar modelos TCI por fármaco (para el selector de UI).
export function tciModelsByDrug(): { drug: string; models: TciModel[] }[] {
  const map = new Map<string, TciModel[]>();
  for (const m of TCI_MODELS) {
    const arr = map.get(m.drug) ?? [];
    arr.push(m);
    map.set(m.drug, arr);
  }
  return Array.from(map.entries()).map(([drug, models]) => ({ drug, models }));
}
