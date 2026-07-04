"use client";

// Port de ElectrolytesView.swift (Calculator / iOS)
// Electrolitos y gases: ácido-base, anión gap (y corregido por albúmina),
// delta gap (Δ/Δ), déficit de agua libre, corrección de Na, déficit de otros
// electrolitos, compensación esperada. Cada fórmula, umbral e interpretación
// se tradujo literalmente del Swift. NO redondear distinto, NO inventar casos.

import { useMemo, useState } from "react";
import { usePatient } from "@/lib/patient/PatientContext";

// MARK: - Severidad
// port de ElectrolytesView.swift:131-169
type Severity = "normal" | "mild" | "moderate" | "severe" | "critical";

const SEVERITY_LABEL: Record<Severity, string> = {
  // port de ElectrolytesView.swift:151-159
  normal: "Normal",
  mild: "Leve",
  moderate: "Moderada",
  severe: "Grave",
  critical: "Crítica",
};

// Mapeo de colores Swift (normal=green, mild=yellow, moderate=orange,
// severe=red, critical=purple) → paleta CSS DEC.
const SEVERITY_COLOR: Record<Severity, string> = {
  normal: "var(--accent)", // green
  mild: "var(--amber)", // yellow
  moderate: "#f97316", // orange
  severe: "var(--red)", // red
  critical: "#a855f7", // purple
};

const SEVERITY_SORT: Record<Severity, number> = {
  // port de ElectrolytesView.swift:160-168
  critical: 5,
  severe: 4,
  moderate: 3,
  mild: 2,
  normal: 1,
};

interface Finding {
  title: string;
  severity: Severity;
  value: string;
  interpretation: string;
  management: string;
}

// MARK: - Parsing
// port de ElectrolytesView.swift:54-58
function parseDouble(text: string): number | null {
  const raw = text.trim();
  if (!raw) return null;
  const n = Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

// Helpers de formato equivalentes a String(format:) de Swift.
const f0 = (n: number) => n.toFixed(0); // %.0f
const f1 = (n: number) => n.toFixed(1); // %.1f
const f2 = (n: number) => n.toFixed(2); // %.2f

interface Inputs {
  weight: number | null;
  TBW: number | null;
  na: number | null;
  k: number | null;
  cl: number | null;
  hco3: number | null;
  gluc: number | null;
  bun: number | null;
  caTotal: number | null;
  caIon: number | null;
  mg: number | null;
  phosph: number | null;
  alb: number | null;
  pH: number | null;
  pco2: number | null;
  po2: number | null;
  fio2: number | null;
  naCorrected: number | null;
  caCorrected: number | null;
  anionGap: number | null;
  anionGapCorrected: number | null;
  deltaRatio: number | null;
  osmolarity: number | null;
  pfRatio: number | null;
}

// MARK: - Management strings (funciones que dependen de peso / TBW)

function managementHypoNa(v: number, TBW: number | null): string {
  // port de ElectrolytesView.swift:238-244
  if (TBW == null) {
    return "Calcular déficit de Na (TBW × [140 − Na]). Reponer máx. 8-10 mEq/L/24h. Síntomas graves: SSH 3% 100 mL en 10 min, repetir hasta mejorar.";
  }
  const deficit = TBW * (140 - v);
  return `Déficit aprox. ${f0(deficit)} mEq de Na. Reponer máx. 8-10 mEq/L/24h (riesgo de mielinolisis pontina). Síntomas graves: SSH 3% 100 mL IV en 10 min, repetir hasta mejorar.`;
}

function managementHyperNa(v: number, TBW: number | null): string {
  // port de ElectrolytesView.swift:246-252
  if (TBW == null) {
    return "Calcular déficit de agua libre (TBW × [Na/140 − 1]). Reponer en 48-72h. NO descender Na >10 mEq/L/24h.";
  }
  const waterDef = TBW * (v / 140 - 1);
  return `Déficit de agua libre aprox. ${f1(waterDef)} L. Reponer en 48-72h con D5W o agua VO. NO descender Na >10 mEq/L/24h (riesgo de edema cerebral).`;
}

function managementHypoK(v: number, _weight: number | null): string {
  // port de ElectrolytesView.swift:315-322
  // Regla aceptada: por cada ~0.3 mEq/L por debajo de 4.0 mEq/L ≈ 100 mEq de
  // déficit corporal total (orientativo; la corrección se guía por niveles seriados).
  // NO usa peso: la fórmula previa (0.3·peso·[3.5−K]) subestimaba el déficit ~15-40x.
  let deficit = "";
  if (v < 4.0) {
    const mEqDeficit = ((4.0 - v) / 0.3) * 100;
    deficit = `Déficit corporal total estimado ~${f0(mEqDeficit)} mEq (orientativo; guiar reposición por niveles seriados). `;
  }
  return (
    deficit +
    "Reposición IV: máx 10 mEq/h periférica, hasta 20 mEq/h por CVC con monitor cardíaco. VO: 40-60 mEq c/4-6h. Corregir SIEMPRE Mg asociado (sin Mg, no se corrige K)."
  );
}

function managementAlb(v: number, weight: number | null): string {
  // port de ElectrolytesView.swift:521-528
  if (weight == null) {
    return "Albúmina humana 20% 50-100 mL. Tratar causa subyacente. Optimización nutricional.";
  }
  const deficit = (3.5 - v) * 0.8 * weight;
  const vials = Math.ceil(deficit / 10);
  return `Déficit aprox. ${f0(deficit)} g de albúmina (~${vials} viales de 10g/50mL al 20%). Tratar causa subyacente.`;
}

// MARK: - Análisis Sodio
// port de ElectrolytesView.swift:174-236
function sodiumFinding(inp: Inputs): Finding | null {
  const value = inp.naCorrected ?? inp.na;
  if (value == null) return null;
  const v = value;

  const displayValue =
    inp.naCorrected != null
      ? `${f1(v)} mEq/L (corregido)`
      : `${f1(v)} mEq/L`;

  if (v < 120) {
    return {
      title: "Hiponatremia grave",
      severity: "critical",
      value: displayValue,
      interpretation:
        "Riesgo de edema cerebral, convulsiones, coma. Requiere intervención inmediata. Si es aguda y sintomática, considerar SSH 3%.",
      management: managementHypoNa(v, inp.TBW),
    };
  }
  if (v < 125) {
    return {
      title: "Hiponatremia moderada-grave",
      severity: "severe",
      value: displayValue,
      interpretation:
        "Síntomas neurológicos probables (cefalea, confusión, náuseas). Evaluar causa: hipovolémica, euvolémica (SIADH), hipervolémica.",
      management: managementHypoNa(v, inp.TBW),
    };
  }
  if (v < 130) {
    return {
      title: "Hiponatremia moderada",
      severity: "moderate",
      value: displayValue,
      interpretation:
        "Generalmente asintomática o síntomas leves. Determinar volemia y osmolaridad urinaria para enfocar diagnóstico.",
      management: managementHypoNa(v, inp.TBW),
    };
  }
  if (v < 135) {
    return {
      title: "Hiponatremia leve",
      severity: "mild",
      value: displayValue,
      interpretation:
        "Hallazgo común. Causas frecuentes: diuréticos, SIADH leve, hiperglucemia, polidipsia.",
      management:
        "Restricción hídrica leve (1-1.5 L/d). Tratar causa subyacente. Reposición lenta si es crónica.",
    };
  }
  if (v > 160) {
    return {
      title: "Hipernatremia grave",
      severity: "critical",
      value: displayValue,
      interpretation:
        "Deshidratación celular severa, alteración del estado mental, convulsiones. Mortalidad significativa.",
      management: managementHyperNa(v, inp.TBW),
    };
  }
  if (v > 150) {
    return {
      title: "Hipernatremia moderada",
      severity: "severe",
      value: displayValue,
      interpretation:
        "Sed intensa, irritabilidad, mucosas secas. Causa frecuente: pérdida de agua libre (DI, pérdidas GI/renales sin reposición).",
      management: managementHyperNa(v, inp.TBW),
    };
  }
  if (v > 145) {
    return {
      title: "Hipernatremia leve",
      severity: "mild",
      value: displayValue,
      interpretation:
        "Generalmente por déficit de agua libre. Evaluar diuresis, osmolaridad urinaria, acceso a agua.",
      management: managementHyperNa(v, inp.TBW),
    };
  }
  return {
    title: "Sodio normal",
    severity: "normal",
    value: displayValue,
    interpretation: "Dentro del rango fisiológico (135-145 mEq/L).",
    management: "—",
  };
}

// MARK: - Análisis Potasio
// port de ElectrolytesView.swift:256-313
function potassiumFinding(inp: Inputs): Finding | null {
  const v = inp.k;
  if (v == null) return null;

  if (v < 2.5) {
    return {
      title: "Hipokalemia grave",
      severity: "critical",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Riesgo de arritmias graves, parálisis muscular, rabdomiólisis. Cambios ECG: ondas U, depresión ST, T aplanada/invertida, prolongación QT.",
      management: managementHypoK(v, inp.weight),
    };
  }
  if (v < 3.0) {
    return {
      title: "Hipokalemia moderada",
      severity: "severe",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Debilidad muscular, calambres, íleo, arritmias en cardiopatía o digitálicos. Considerar hipomagnesemia asociada.",
      management: managementHypoK(v, inp.weight),
    };
  }
  if (v < 3.5) {
    return {
      title: "Hipokalemia leve",
      severity: "mild",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Frecuentemente asintomática. Causas: diuréticos, pérdidas GI, alcalosis, agonistas β2.",
      management: managementHypoK(v, inp.weight),
    };
  }
  if (v > 6.5) {
    return {
      title: "Hiperkalemia grave / emergencia",
      severity: "critical",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Riesgo de paro cardíaco. Cambios ECG: T picudas, ensanchamiento QRS, pérdida onda P, ritmo sinusoidal.",
      management:
        "EMERGENCIA: 1) Gluconato Ca 1g IV (estabilizar membrana). 2) Insulina 10U + D50 25g. 3) Salbutamol nebulizado. 4) NaHCO3 si acidosis. 5) Furosemida + suero. 6) Resinas (kayexalato/patiromer). 7) Diálisis si refractario.",
    };
  }
  if (v > 6.0) {
    return {
      title: "Hiperkalemia grave",
      severity: "severe",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Riesgo arrítmico significativo. Realizar ECG urgente.",
      management:
        "Insulina 10U + D50 25g IV. Salbutamol nebulizado. Furosemida si volemia adecuada. Resinas. Considerar diálisis.",
    };
  }
  if (v > 5.5) {
    return {
      title: "Hiperkalemia moderada",
      severity: "moderate",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Vigilar ECG. Causas: IRC, IECA/ARA-II, ahorradores de K, acidosis, hemólisis (descartar pseudohiperkalemia).",
      management:
        "Suspender K exógeno y fármacos que lo retienen. Resinas. Vigilar evolución y ECG.",
    };
  }
  if (v > 5.0) {
    return {
      title: "Hiperkalemia leve",
      severity: "mild",
      value: `${f1(v)} mEq/L`,
      interpretation:
        "Revisar fármacos, función renal y muestra (descartar hemólisis).",
      management:
        "Suspender suplementos de K. Revisar IECA/ARA-II/espironolactona. Repetir control.",
    };
  }
  return {
    title: "Potasio normal",
    severity: "normal",
    value: `${f1(v)} mEq/L`,
    interpretation: "Dentro del rango fisiológico (3.5-5.0 mEq/L).",
    management: "—",
  };
}

// MARK: - Análisis Calcio
// port de ElectrolytesView.swift:326-392
function calciumFinding(inp: Inputs): Finding | null {
  const useIonized = inp.caIon != null;
  let value: number | null;
  let label: string;

  if (inp.caIon != null) {
    value = inp.caIon;
    label = `Ca ionizado: ${f2(inp.caIon)} mmol/L`;
  } else if (inp.caCorrected != null) {
    value = inp.caCorrected;
    label = `Ca corregido: ${f2(inp.caCorrected)} mg/dL`;
  } else if (inp.caTotal != null) {
    value = inp.caTotal;
    label = `Ca total: ${f2(inp.caTotal)} mg/dL`;
  } else {
    return null;
  }

  if (value == null) return null;
  const v = value;

  const isLow = useIonized ? v < 1.15 : v < 8.5;
  const isHigh = useIonized ? v > 1.35 : v > 10.5;
  const isSevereLow = useIonized ? v < 0.9 : v < 7.0;
  const isSevereHigh = useIonized ? v > 1.6 : v > 13.0;
  const isCritHigh = useIonized ? v > 1.8 : v > 14.0;

  if (isCritHigh) {
    return {
      title: "Hipercalcemia crítica",
      severity: "critical",
      value: label,
      interpretation:
        "Riesgo de crisis hipercalcémica, arritmias, coma. Causas: malignidad, hiperparatiroidismo primario.",
      management:
        "EMERGENCIA: SSN 0.9% 200-300 mL/h + furosemida tras euvolemia. Calcitonina 4 UI/kg SC c/12h. Bifosfonato (zoledronato 4 mg IV o pamidronato 60-90 mg IV). Considerar denosumab. Diálisis si refractario.",
    };
  }
  if (isSevereHigh) {
    return {
      title: "Hipercalcemia grave",
      severity: "severe",
      value: label,
      interpretation:
        "Síntomas: poliuria, deshidratación, alteración mental, arritmias. Suspender fármacos calcificantes y vit D.",
      management:
        "Hidratación con SSN 200 mL/h. Furosemida solo tras corregir volemia. Bifosfonatos IV. Calcitonina como medida temprana.",
    };
  }
  if (isHigh) {
    return {
      title: "Hipercalcemia leve-moderada",
      severity: "moderate",
      value: label,
      interpretation:
        "Investigar causa: hiperparatiroidismo, malignidad, sarcoidosis, intoxicación por vit D, inmovilización prolongada.",
      management:
        "Hidratación con SSN. Suspender fármacos hipercalcemiantes. Tratamiento etiológico.",
    };
  }
  if (isSevereLow) {
    return {
      title: "Hipocalcemia grave",
      severity: "severe",
      value: label,
      interpretation:
        "Riesgo de tetania, laringoespasmo, convulsiones, prolongación QT, arritmias. Signos de Chvostek y Trousseau positivos.",
      management:
        "Gluconato de Ca 10% 1-2 g IV en 10 min, seguido de infusión de mantenimiento (0.5-1.5 mg/kg/h Ca elemental). Corregir Mg asociado. Vit D si hipoparatiroidismo.",
    };
  }
  if (isLow) {
    return {
      title: "Hipocalcemia leve-moderada",
      severity: "mild",
      value: label,
      interpretation:
        "Causas: hipoalbuminemia, hipoparatiroidismo, déficit de vit D, IRC, hiperfosfatemia, transfusión masiva.",
      management:
        "Si sintomática: gluconato de Ca IV. Si asintomática: Ca VO 1-3 g/d + vit D. Investigar y tratar causa.",
    };
  }
  return {
    title: "Calcio normal",
    severity: "normal",
    value: label,
    interpretation: "Dentro del rango fisiológico.",
    management: "—",
  };
}

// MARK: - Análisis Magnesio
// port de ElectrolytesView.swift:396-439
function magnesiumFinding(inp: Inputs): Finding | null {
  const v = inp.mg;
  if (v == null) return null;

  if (v < 1.0) {
    return {
      title: "Hipomagnesemia grave",
      severity: "severe",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Riesgo de torsades, convulsiones, debilidad. Asociada frecuentemente a hipokalemia e hipocalcemia refractarias.",
      management:
        "MgSO4 2 g IV en 5-10 min, seguido de infusión 1-2 g/h. Corregir Mg ANTES de intentar corregir K o Ca.",
    };
  }
  if (v < 1.3) {
    return {
      title: "Hipomagnesemia moderada",
      severity: "moderate",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Causas: pérdidas GI/renales, diuréticos, IBPs crónicos, alcoholismo, malnutrición.",
      management:
        "MgSO4 1-2 g IV en 1h, repetir según niveles. VO si tolera: óxido o cloruro de Mg.",
    };
  }
  if (v < 1.7) {
    return {
      title: "Hipomagnesemia leve",
      severity: "mild",
      value: `${f2(v)} mg/dL`,
      interpretation: "Frecuente y subdiagnosticada. Investigar causa.",
      management:
        "Reposición VO. MgSO4 IV si sintomática o asociada a otras alteraciones.",
    };
  }
  if (v > 4.0) {
    return {
      title: "Hipermagnesemia grave",
      severity: "severe",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Riesgo de bloqueo neuromuscular, paro respiratorio, hipotensión, BAV. Habitual en IRC con suplementación.",
      management:
        "Suspender fuente de Mg. Gluconato de Ca 1 g IV (antagoniza efectos). Furosemida + SSN. Diálisis si IRC severa.",
    };
  }
  if (v > 2.4) {
    return {
      title: "Hipermagnesemia leve-moderada",
      severity: "moderate",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Causas: IRC, sobredosis de antiácidos/laxantes con Mg, eclampsia tratada con MgSO4.",
      management:
        "Suspender fuentes exógenas. Si sintomática: gluconato de Ca + diuresis forzada.",
    };
  }
  return {
    title: "Magnesio normal",
    severity: "normal",
    value: `${f2(v)} mg/dL`,
    interpretation: "Dentro del rango fisiológico (1.7-2.4 mg/dL).",
    management: "—",
  };
}

// MARK: - Análisis Fósforo
// port de ElectrolytesView.swift:443-486
function phosphorusFinding(inp: Inputs): Finding | null {
  const v = inp.phosph;
  if (v == null) return null;

  if (v < 1.0) {
    return {
      title: "Hipofosfatemia grave",
      severity: "severe",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Riesgo de debilidad muscular incluyendo diafragma, rabdomiólisis, hemólisis, falla cardíaca, encefalopatía.",
      management:
        "Fosfato de K o Na IV: 0.16-0.32 mmol/kg en 4-6h. Vigilar Ca (riesgo precipitación) y K.",
    };
  }
  if (v < 1.5) {
    return {
      title: "Hipofosfatemia moderada",
      severity: "moderate",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Causas: realimentación, CAD en tratamiento, alcalosis respiratoria, alcoholismo, sepsis.",
      management:
        "Fosfato VO o IV según severidad. Profilaxis con tiamina si síndrome de realimentación.",
    };
  }
  if (v < 2.5) {
    return {
      title: "Hipofosfatemia leve",
      severity: "mild",
      value: `${f2(v)} mg/dL`,
      interpretation: "Frecuentemente asintomática.",
      management: "Suplementación VO. Investigar causa subyacente.",
    };
  }
  if (v > 7.0) {
    return {
      title: "Hiperfosfatemia grave",
      severity: "severe",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Riesgo de hipocalcemia secundaria, tetania, calcificaciones metastásicas. Causa: IRC, lisis tumoral, rabdomiólisis.",
      management:
        "Quelantes de fosfato (sevelamer, carbonato/acetato de Ca). Restricción dietaria. Diálisis si IRC severa.",
    };
  }
  if (v > 4.5) {
    return {
      title: "Hiperfosfatemia",
      severity: "moderate",
      value: `${f2(v)} mg/dL`,
      interpretation:
        "Investigar función renal, hipoparatiroidismo, lisis tumoral.",
      management:
        "Quelantes de fosfato con las comidas. Restricción dietaria. Tratar causa.",
    };
  }
  return {
    title: "Fósforo normal",
    severity: "normal",
    value: `${f2(v)} mg/dL`,
    interpretation: "Dentro del rango fisiológico (2.5-4.5 mg/dL).",
    management: "—",
  };
}

// MARK: - Análisis Albúmina
// port de ElectrolytesView.swift:490-519
function albuminFinding(inp: Inputs): Finding | null {
  const v = inp.alb;
  if (v == null) return null;

  if (v < 2.0) {
    return {
      title: "Hipoalbuminemia grave",
      severity: "severe",
      value: `${f2(v)} g/dL`,
      interpretation:
        "Edema, ascitis, mayor morbimortalidad perioperatoria. Considerar pérdidas (síndrome nefrótico, enteropatía pierde-proteínas), falla hepática, sepsis.",
      management: managementAlb(v, inp.weight),
    };
  }
  if (v < 2.5) {
    return {
      title: "Hipoalbuminemia moderada",
      severity: "moderate",
      value: `${f2(v)} g/dL`,
      interpretation:
        "Generalmente refleja enfermedad subyacente. Considerar paracentesis evacuadora con reposición de albúmina.",
      management: managementAlb(v, inp.weight),
    };
  }
  if (v < 3.5) {
    return {
      title: "Hipoalbuminemia leve",
      severity: "mild",
      value: `${f2(v)} g/dL`,
      interpretation:
        "Hallazgo común. Investigar causa: malnutrición, inflamación crónica, hepatopatía.",
      management:
        "Optimización nutricional. Tratar causa subyacente. Reposición con albúmina solo en indicaciones específicas.",
    };
  }
  return {
    title: "Albúmina normal",
    severity: "normal",
    value: `${f2(v)} g/dL`,
    interpretation: "Dentro del rango fisiológico (3.5-5.0 g/dL).",
    management: "—",
  };
}

// MARK: - Análisis Glucosa
// port de ElectrolytesView.swift:532-582
function glucoseFinding(inp: Inputs): Finding | null {
  const v = inp.gluc;
  if (v == null) return null;

  if (v < 50) {
    return {
      title: "Hipoglucemia grave",
      severity: "critical",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Alteración del estado mental, convulsiones, coma. Riesgo neurológico inmediato.",
      management:
        "D50W 25 g IV (50 mL) en bolo. Repetir si persiste. Glucagón 1 mg IM si no hay vía. Iniciar D10W para mantener glucemia.",
    };
  }
  if (v < 70) {
    return {
      title: "Hipoglucemia",
      severity: "severe",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Síntomas adrenérgicos (sudoración, temblor, palpitaciones) y neuroglucopénicos.",
      management:
        "Si consciente: 15-20 g de glucosa VO. Si no tolera VO: D50W 25 g IV o D10W 100-200 mL. Reevaluar c/15 min.",
    };
  }
  if (v > 600) {
    return {
      title: "Hiperglucemia crítica",
      severity: "critical",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Riesgo de estado hiperosmolar hiperglucémico (EHH). Verificar osmolaridad, cetonas, pH.",
      management:
        "Hidratación IV agresiva (SSN 0.9% 1-1.5 L/h x 1-2h). Insulina IV en infusión 0.1 U/kg/h. Reposición de K. Buscar causa precipitante.",
    };
  }
  if (v > 400) {
    return {
      title: "Hiperglucemia grave",
      severity: "severe",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Sospechar CAD si pH <7.3 y/o HCO3<15. Sospechar EHH si osmolaridad >320.",
      management:
        "Hidratación IV. Insulina IV en infusión. Vigilar K. Investigar precipitante (sepsis, IAM, mala adherencia).",
    };
  }
  if (v > 250) {
    return {
      title: "Hiperglucemia",
      severity: "moderate",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Mal control glucémico. Vigilar evolución y descartar descompensación aguda.",
      management:
        "Ajuste de insulina basal/bolo. Insulina IV si paciente crítico. Objetivo en UCI: 140-180 mg/dL.",
    };
  }
  if (v > 180) {
    return {
      title: "Hiperglucemia leve",
      severity: "mild",
      value: `${f0(v)} mg/dL`,
      interpretation:
        "Control subóptimo. En paciente crítico, ya excede el objetivo recomendado.",
      management:
        "Ajustar tratamiento. En UCI: protocolo de insulina IV para mantener 140-180 mg/dL.",
    };
  }
  return {
    title: "Glucosa normal",
    severity: "normal",
    value: `${f0(v)} mg/dL`,
    interpretation: "Dentro del rango (70-180 mg/dL aceptable en UCI).",
    management: "—",
  };
}

// MARK: - Análisis ácido-base
// port de ElectrolytesView.swift:586-698
function acidBaseFindings(inp: Inputs): Finding[] {
  const { pH, pco2, hco3 } = inp;
  if (pH == null || pco2 == null || hco3 == null) return [];
  const results: Finding[] = [];

  const acidemia = pH < 7.35;
  const alkalemia = pH > 7.45;
  const metAc = hco3 < 22;
  const metAl = hco3 > 26;
  const respAc = pco2 > 45;
  const respAl = pco2 < 35;

  if (metAc) {
    const agToUse = inp.anionGapCorrected ?? inp.anionGap;
    const agHigh = (agToUse ?? 12) > 12;
    const sev: Severity = hco3 < 10 ? "critical" : hco3 < 15 ? "severe" : "moderate";

    let interp: string;
    let mgmt: string;

    if (agHigh) {
      let drInfo: string;
      const dr = inp.deltaRatio;
      if (dr != null) {
        if (dr < 1) {
          drInfo = ` Δ/Δ ${f2(dr)}: acidosis hiperclorémica asociada.`;
        } else if (dr <= 2) {
          drInfo = ` Δ/Δ ${f2(dr)}: acidosis con AG elevado pura.`;
        } else {
          drInfo = ` Δ/Δ ${f2(dr)}: alcalosis metabólica asociada.`;
        }
      } else {
        drInfo = "";
      }

      interp = `Acidosis metabólica con AG elevado.${drInfo} Causas (MUDPILES): metanol, uremia, CAD, paraldehído, isoniazida/hierro, lactato, etilenglicol, salicilatos.`;
      mgmt =
        "Tratar causa. NaHCO3 solo si pH <7.1 o hiperkalemia. Lactato → optimizar perfusión. CAD → insulina + hidratación + K.";
    } else {
      interp =
        "Acidosis metabólica con AG normal (hiperclorémica). Causas: diarrea, ATR, fístula pancreática, ureterostomía, IECA/ahorradores K, dilucional.";
      mgmt =
        "Identificar y tratar pérdidas de bicarbonato. Reposición con bicarbonato si severa o sintomática.";
    }

    let deficit = "";
    if (inp.weight != null) {
      const def = 0.4 * inp.weight * (24 - hco3);
      deficit = ` Déficit estimado HCO3: ${f0(def)} mEq (administrar mitad inicial).`;
    }

    const agStr = agToUse != null ? f1(agToUse) : "—";
    results.push({
      title: `Acidosis metabólica ${
        sev === "critical" ? "crítica" : sev === "severe" ? "grave" : "moderada"
      }`,
      severity: sev,
      value: `pH ${f2(pH)}, HCO3 ${f1(hco3)}, AG ${agStr}`,
      interpretation: interp,
      management: mgmt + deficit,
    });

    const wMin = 1.5 * hco3 + 6;
    const wMax = 1.5 * hco3 + 10;
    if (pco2 < wMin) {
      results.push({
        title: "Alcalosis respiratoria asociada",
        severity: "moderate",
        value: `pCO2 ${f1(pco2)} (esperado ${f0(wMin)}-${f0(wMax)})`,
        interpretation:
          "Hiperventilación más allá de la compensación esperada. Trastorno mixto.",
        management:
          "Buscar causa: dolor, ansiedad, sepsis, embolia pulmonar, lesión SNC.",
      });
    } else if (pco2 > wMax) {
      results.push({
        title: "Acidosis respiratoria asociada",
        severity: "severe",
        value: `pCO2 ${f1(pco2)} (esperado ${f0(wMin)}-${f0(wMax)})`,
        interpretation:
          "Compensación inadecuada con retención de CO2. Trastorno mixto severo.",
        management:
          "Optimizar ventilación. Considerar VMNI o intubación si fatiga respiratoria.",
      });
    }
  }

  if (metAl) {
    const sev: Severity = hco3 > 40 ? "severe" : hco3 > 32 ? "moderate" : "mild";
    results.push({
      title: `Alcalosis metabólica ${SEVERITY_LABEL[sev].toLowerCase()}`,
      severity: sev,
      value: `pH ${f2(pH)}, HCO3 ${f1(hco3)}`,
      interpretation:
        "Causas: vómitos, SNG, diuréticos (responde a Cl), hipocloremia. Si Cl urinario alto: hiperaldosteronismo, exceso mineralocorticoide.",
      management:
        "Reposición con SSN si hipovolémica (Cl urinario <20). Suspender diuréticos. KCl si hipokalemia. Acetazolamida si refractaria.",
    });
  }

  if (respAc && !metAc) {
    const sev: Severity = pco2 > 70 ? "severe" : pco2 > 55 ? "moderate" : "mild";
    results.push({
      title: `Acidosis respiratoria ${SEVERITY_LABEL[sev].toLowerCase()}`,
      severity: sev,
      value: `pH ${f2(pH)}, pCO2 ${f1(pco2)}`,
      interpretation:
        "Hipoventilación alveolar. Causas: depresión SNC (opioides, sedantes), enfermedad neuromuscular, EPOC, obstrucción vía aérea.",
      management:
        "Soporte ventilatorio (VMNI o IOT). Reversión de opioides/sedantes si es la causa. Broncodilatadores en EPOC.",
    });
  }

  if (respAl && !metAl) {
    const sev: Severity = pco2 < 25 ? "severe" : pco2 < 30 ? "moderate" : "mild";
    results.push({
      title: `Alcalosis respiratoria ${SEVERITY_LABEL[sev].toLowerCase()}`,
      severity: sev,
      value: `pH ${f2(pH)}, pCO2 ${f1(pco2)}`,
      interpretation:
        "Hiperventilación. Causas: ansiedad, dolor, hipoxia, sepsis, embolia pulmonar, lesión SNC, embarazo, salicilatos.",
      management:
        "Tratar causa. Si por ansiedad: re-respiración, ansiolisis. Descartar TEP en alcalosis sin causa evidente.",
    });
  }

  if (!acidemia && !alkalemia && !metAc && !metAl && !respAc && !respAl) {
    results.push({
      title: "Equilibrio ácido-base normal",
      severity: "normal",
      value: `pH ${f2(pH)}, pCO2 ${f1(pco2)}, HCO3 ${f1(hco3)}`,
      interpretation: "Sin alteraciones del equilibrio ácido-base.",
      management: "—",
    });
  }

  return results;
}

// MARK: - Oxigenación
// port de ElectrolytesView.swift:702-718
function oxygenationFinding(inp: Inputs): Finding | null {
  const pf = inp.pfRatio;
  if (pf == null) return null;
  let sev: Severity;
  let title: string;
  let interp: string;
  let mgmt: string;

  if (pf >= 400) {
    sev = "normal";
    title = "Oxigenación normal";
    interp = "PaO2/FiO2 ≥ 400.";
    mgmt = "—";
  } else if (pf >= 300) {
    sev = "mild";
    title = "Hipoxemia leve";
    interp = "PaO2/FiO2 300-399.";
    mgmt = "Suplementar O2 según necesidad. Buscar causa.";
  } else if (pf >= 200) {
    sev = "moderate";
    title = "SDRA leve (Berlín)";
    interp = "PaO2/FiO2 200-299 con PEEP ≥5 cmH2O.";
    mgmt =
      "Cánula alto flujo, VMNI o VMI con estrategia protectora (Vt 6 mL/kg, Pplat <30, PEEP titulada).";
  } else if (pf >= 100) {
    sev = "severe";
    title = "SDRA moderado";
    interp = "PaO2/FiO2 100-199.";
    mgmt =
      "VMI con estrategia protectora. Considerar prono temprano si PaO2/FiO2 <150. Bloqueo neuromuscular en primeras 48h.";
  } else {
    sev = "critical";
    title = "SDRA grave";
    interp = "PaO2/FiO2 <100.";
    mgmt =
      "VMI protectora + prono + bloqueo neuromuscular. Considerar reclutamiento, óxido nítrico inhalado, ECMO.";
  }

  return {
    title,
    severity: sev,
    value: `PaO2/FiO2: ${f0(pf)}`,
    interpretation: interp,
    management: mgmt,
  };
}

// MARK: - Osmolaridad
// port de ElectrolytesView.swift:722-750
function osmolarityFinding(inp: Inputs): Finding | null {
  const osm = inp.osmolarity;
  if (osm == null) return null;
  if (osm < 275) {
    return {
      title: "Hipoosmolaridad",
      severity: "moderate",
      value: `${f0(osm)} mOsm/L`,
      interpretation:
        "Generalmente refleja hiponatremia hipotónica. Riesgo de edema cerebral si descenso rápido.",
      management: "Restricción hídrica. Tratar causa. Reponer Na lentamente.",
    };
  }
  if (osm > 320) {
    return {
      title: "Hiperosmolaridad grave",
      severity: "severe",
      value: `${f0(osm)} mOsm/L`,
      interpretation:
        "Sospechar EHH (osm >320 + gluc >600), hipernatremia grave o intoxicación (etanol, metanol, etilenglicol → calcular gap osmolar).",
      management:
        "Hidratación con SSN inicialmente, luego hipotónica. Insulina si hiperglucemia. Antídoto específico si intoxicación.",
    };
  }
  if (osm > 295) {
    return {
      title: "Hiperosmolaridad",
      severity: "moderate",
      value: `${f0(osm)} mOsm/L`,
      interpretation:
        "Causas: hipernatremia, hiperglucemia, uremia, intoxicaciones.",
      management: "Tratar causa subyacente. Hidratación según volemia.",
    };
  }
  return {
    title: "Osmolaridad normal",
    severity: "normal",
    value: `${f0(osm)} mOsm/L`,
    interpretation: "Dentro del rango (285-295 mOsm/L).",
    management: "—",
  };
}

// MARK: - Cálculos derivados
// port de ElectrolytesView.swift:60-119
function buildInputs(v: {
  weight: number | null;
  isMale: boolean;
  naText: string;
  kText: string;
  clText: string;
  hco3Text: string;
  glucText: string;
  bunText: string;
  caTotalText: string;
  caIonText: string;
  mgText: string;
  phosphText: string;
  albText: string;
  pHText: string;
  pco2Text: string;
  po2Text: string;
  fio2Text: string;
}): Inputs {
  // El peso viene del PACIENTE ACTIVO (barra superior compartida), no de un
  // input local. port de ElectrolytesView.swift:60-61 (allí venía de patientStore).
  const weight = v.weight;
  const TBW = weight != null ? weight * (v.isMale ? 0.6 : 0.5) : null;

  const na = parseDouble(v.naText);
  const k = parseDouble(v.kText);
  const cl = parseDouble(v.clText);
  const hco3 = parseDouble(v.hco3Text);
  const gluc = parseDouble(v.glucText);
  const bun = parseDouble(v.bunText);
  const caTotal = parseDouble(v.caTotalText);
  const caIon = parseDouble(v.caIonText);
  const mg = parseDouble(v.mgText);
  const phosph = parseDouble(v.phosphText);
  const alb = parseDouble(v.albText);
  const pH = parseDouble(v.pHText);
  const pco2 = parseDouble(v.pco2Text);
  const po2 = parseDouble(v.po2Text);
  const fio2 = parseDouble(v.fio2Text);

  // naCorrected — port de ElectrolytesView.swift:81-85
  let naCorrected: number | null = null;
  if (na != null && gluc != null && gluc > 100) {
    const factor = gluc > 400 ? 2.4 : 1.6;
    naCorrected = na + (factor * (gluc - 100)) / 100;
  }

  // caCorrected — port de ElectrolytesView.swift:87-90
  let caCorrected: number | null = null;
  if (caTotal != null && alb != null) {
    caCorrected = caTotal + 0.8 * (4 - alb);
  }

  // anionGap — port de ElectrolytesView.swift:92-95
  let anionGap: number | null = null;
  if (na != null && cl != null && hco3 != null) {
    anionGap = na - (cl + hco3);
  }

  // anionGapCorrected — port de ElectrolytesView.swift:97-100
  let anionGapCorrected: number | null = null;
  if (anionGap != null && alb != null) {
    anionGapCorrected = anionGap + 2.5 * (4 - alb);
  }

  // deltaRatio — port de ElectrolytesView.swift:102-109
  let deltaRatio: number | null = null;
  {
    const agToUse = anionGapCorrected ?? anionGap;
    if (agToUse != null && agToUse > 12 && hco3 != null) {
      const dAG = agToUse - 12;
      const dBic = 24 - hco3;
      if (dBic !== 0) {
        deltaRatio = dAG / dBic;
      }
    }
  }

  // osmolarity — port de ElectrolytesView.swift:111-114
  let osmolarity: number | null = null;
  if (na != null) {
    osmolarity = 2 * na + (gluc ?? 0) / 18.0 + (bun ?? 0) / 2.8;
  }

  // pfRatio — port de ElectrolytesView.swift:116-119
  let pfRatio: number | null = null;
  if (po2 != null && fio2 != null && fio2 > 0) {
    pfRatio = po2 / fio2;
  }

  return {
    weight,
    TBW,
    na,
    k,
    cl,
    hco3,
    gluc,
    bun,
    caTotal,
    caIon,
    mg,
    phosph,
    alb,
    pH,
    pco2,
    po2,
    fio2,
    naCorrected,
    caCorrected,
    anionGap,
    anionGapCorrected,
    deltaRatio,
    osmolarity,
    pfRatio,
  };
}

// MARK: - Recolección
// port de ElectrolytesView.swift:754-770
function collectFindings(inp: Inputs): Finding[] {
  const f: Finding[] = [];
  const sodium = sodiumFinding(inp);
  if (sodium) f.push(sodium);
  const potassium = potassiumFinding(inp);
  if (potassium) f.push(potassium);
  const calcium = calciumFinding(inp);
  if (calcium) f.push(calcium);
  const magnesium = magnesiumFinding(inp);
  if (magnesium) f.push(magnesium);
  const phosphorus = phosphorusFinding(inp);
  if (phosphorus) f.push(phosphorus);
  const albumin = albuminFinding(inp);
  if (albumin) f.push(albumin);
  const glucose = glucoseFinding(inp);
  if (glucose) f.push(glucose);
  const osm = osmolarityFinding(inp);
  if (osm) f.push(osm);
  f.push(...acidBaseFindings(inp));
  const oxy = oxygenationFinding(inp);
  if (oxy) f.push(oxy);
  // sorted { severity.sortOrder > severity.sortOrder } — descendente por severidad
  return f
    .map((x, i) => ({ x, i }))
    .sort((a, b) => {
      const d = SEVERITY_SORT[b.x.severity] - SEVERITY_SORT[a.x.severity];
      return d !== 0 ? d : a.i - b.i; // sort estable como en Swift
    })
    .map((o) => o.x);
}

// MARK: - Campos de entrada (definición)

interface FieldDef {
  key:
    | "na"
    | "k"
    | "cl"
    | "hco3"
    | "gluc"
    | "bun"
    | "caTotal"
    | "caIon"
    | "mg"
    | "phosph"
    | "alb"
    | "pH"
    | "pco2"
    | "po2"
    | "fio2";
  label: string;
  placeholder: string;
}

// port de ElectrolytesView.swift:816-838
const ELECTROLYTE_FIELDS: FieldDef[] = [
  { key: "na", label: "Na+", placeholder: "135-145" },
  { key: "k", label: "K+", placeholder: "3.5-5.0" },
  { key: "cl", label: "Cl-", placeholder: "98-106" },
  { key: "hco3", label: "HCO3-", placeholder: "22-26" },
  { key: "gluc", label: "Glucosa", placeholder: "70-100" },
  { key: "bun", label: "BUN", placeholder: "7-20" },
];

const CAMGPALB_FIELDS: FieldDef[] = [
  { key: "caTotal", label: "Ca total", placeholder: "8.5-10.5" },
  { key: "caIon", label: "Ca ion.", placeholder: "1.15-1.35" },
  { key: "mg", label: "Mg", placeholder: "1.7-2.4" },
  { key: "phosph", label: "P", placeholder: "2.5-4.5" },
  { key: "alb", label: "Alb", placeholder: "3.5-5.0" },
];

const GAS_FIELDS: FieldDef[] = [
  { key: "pH", label: "pH", placeholder: "7.35-7.45" },
  { key: "pco2", label: "pCO2", placeholder: "35-45" },
  { key: "po2", label: "pO2", placeholder: "80-100" },
  { key: "fio2", label: "FiO2", placeholder: "0.21" },
];

// MARK: - Componentes de UI

function FieldRow({
  def,
  value,
  onChange,
}: {
  def: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem",
      }}
    >
      <label
        htmlFor={`fld-${def.key}`}
        className="mono"
        style={{ color: "var(--text-2)", fontSize: "0.7rem" }}
      >
        {def.label}
      </label>
      <input
        id={`fld-${def.key}`}
        type="text"
        inputMode="decimal"
        className="calc-input mono"
        placeholder={def.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ maxWidth: 130, textAlign: "right" }}
      />
    </div>
  );
}

function CalcResultRow({
  title,
  value,
  unit,
}: {
  title: string;
  value: string;
  unit: string;
}) {
  const display = `${value} ${unit}`.trim();
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span
        className="mono"
        style={{ color: "var(--text-2)", fontSize: "0.72rem" }}
      >
        {title}
      </span>
      <span
        className="mono"
        style={{ color: "var(--accent)", fontWeight: 700, fontSize: "0.8rem" }}
      >
        {display}
      </span>
    </div>
  );
}

// findingCard — port de ElectrolytesView.swift:930-958
function FindingCard({ f }: { f: Finding }) {
  const color = SEVERITY_COLOR[f.severity];
  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div
        className="panel-body"
        style={{ display: "grid", gap: "0.4rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--text-0)",
                fontSize: "0.82rem",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {f.title}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.62rem",
                marginTop: "0.15rem",
              }}
            >
              {f.value}
            </div>
          </div>
          <span
            className="mono"
            style={{
              flexShrink: 0,
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
              color,
              border: `1px solid ${color}`,
              padding: "0.1rem 0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            {SEVERITY_LABEL[f.severity]}
          </span>
        </div>
        <p
          style={{
            color: "var(--text-1)",
            fontSize: "0.72rem",
            lineHeight: 1.6,
          }}
        >
          {f.interpretation}
        </p>
        {f.management !== "—" && (
          <p
            style={{
              color: "var(--accent)",
              fontSize: "0.72rem",
              lineHeight: 1.6,
              paddingLeft: "0.6rem",
              borderLeft: "2px solid var(--accent-border)",
            }}
          >
            {f.management}
          </p>
        )}
      </div>
    </div>
  );
}

// MARK: - Página

const EMPTY = {
  naText: "",
  kText: "",
  clText: "",
  hco3Text: "",
  glucText: "",
  bunText: "",
  caTotalText: "",
  caIonText: "",
  mgText: "",
  phosphText: "",
  albText: "",
  pHText: "",
  pco2Text: "",
  po2Text: "",
  fio2Text: "",
};

type State = typeof EMPTY;

// Mapa key de campo → propiedad del state (texto).
const FIELD_TO_STATE: Record<FieldDef["key"], keyof State> = {
  na: "naText",
  k: "kText",
  cl: "clText",
  hco3: "hco3Text",
  gluc: "glucText",
  bun: "bunText",
  caTotal: "caTotalText",
  caIon: "caIonText",
  mg: "mgText",
  phosph: "phosphText",
  alb: "albText",
  pH: "pHText",
  pco2: "pco2Text",
  po2: "po2Text",
  fio2: "fio2Text",
};

export default function ElectrolitosPage() {
  const { active, setActive } = usePatient();
  const [s, setS] = useState<State>(EMPTY);

  // Peso y sexo salen del PACIENTE ACTIVO (barra superior) — reactivos y
  // bidireccionales. Editar aquí o en la barra se refleja en vivo en ambos.
  const isMale = active.sex === "male";

  const setField = (key: FieldDef["key"], value: string) => {
    setS((prev) => ({ ...prev, [FIELD_TO_STATE[key]]: value }));
  };

  const inp = useMemo(
    () => buildInputs({ ...s, weight: active.weightKg, isMale }),
    [s, active.weightKg, isMale]
  );

  const findings = useMemo(() => collectFindings(inp), [inp]);
  // port de ElectrolytesView.swift:769-770
  const abnormalFindings = findings.filter((x) => x.severity !== "normal");
  const normalFindings = findings.filter((x) => x.severity === "normal");

  // Sección "Cálculos" — port de ElectrolytesView.swift:840-864
  const showCalcs =
    inp.anionGap != null ||
    inp.naCorrected != null ||
    inp.caCorrected != null ||
    inp.osmolarity != null;

  const clearAll = () => setS(EMPTY);

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./electrolitos.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Electrolitos y gases
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
          Ingresa solo los valores disponibles. La app analiza cada parámetro y
          muestra alteraciones con indicaciones.
          <br />
          <span style={{ opacity: 0.6 }}>
            {/* humor negro */}
            {"// el laboratorio ya te odia — al menos que sirva de algo"}
          </span>
        </p>
      </div>

      {/* Paciente */}
      <div className="panel" style={{ marginBottom: "1rem" }}>
        <div className="panel-header">
          <span className="dot" /> PACIENTE
        </div>
        <div className="panel-body" style={{ display: "grid", gap: "0.75rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <label
              htmlFor="fld-weight"
              className="mono"
              style={{ color: "var(--text-2)", fontSize: "0.7rem" }}
            >
              Peso (kg)
            </label>
            <input
              id="fld-weight"
              type="text"
              inputMode="decimal"
              className="calc-input mono"
              placeholder="70"
              value={active.weightKg != null ? String(active.weightKg) : ""}
              onChange={(e) =>
                setActive({ weightKg: parseDouble(e.target.value) })
              }
              style={{ maxWidth: 130, textAlign: "right" }}
            />
          </div>
          {/* Sexo — port de ElectrolytesView.swift:809-813 (segmented M/F) */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <span
              className="mono"
              style={{ color: "var(--text-2)", fontSize: "0.7rem" }}
            >
              Sexo
            </span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {(
                [
                  ["male", "M"],
                  ["female", "F"],
                ] as const
              ).map(([sexValue, short]) => {
                const isActive = active.sex === sexValue;
                return (
                  <button
                    key={sexValue}
                    type="button"
                    onClick={() => setActive({ sex: sexValue })}
                    className="mono"
                    style={{
                      padding: "0.35rem 0.9rem",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      background: isActive ? "var(--accent)" : "var(--bg-1)",
                      color: isActive ? "#000" : "var(--text-2)",
                      border: "1px solid",
                      borderColor: isActive ? "var(--accent)" : "var(--border)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {short}
                  </button>
                );
              })}
            </div>
          </div>
          <p
            className="mono"
            style={{ color: "var(--text-3)", fontSize: "0.55rem", opacity: 0.7 }}
          >
            {/* TBW = peso × (0.6 M / 0.5 F) */}
            {"// TBW estimado: peso × 0.6 (M) / 0.5 (F)"}
            <br />
            {"// usa el paciente activo (barra superior) — editar aquí lo actualiza"}
          </p>
        </div>
      </div>

      {/* Inputs en tres paneles */}
      <div style={{ display: "grid", gap: "1rem", marginBottom: "1rem" }}>
        <div className="panel">
          <div className="panel-header">
            <span className="dot" /> ELECTROLITOS
          </div>
          <div
            className="panel-body"
            style={{ display: "grid", gap: "0.6rem" }}
          >
            {ELECTROLYTE_FIELDS.map((def) => (
              <FieldRow
                key={def.key}
                def={def}
                value={s[FIELD_TO_STATE[def.key]]}
                onChange={(v) => setField(def.key, v)}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="dot" /> CA · MG · P · ALB
          </div>
          <div
            className="panel-body"
            style={{ display: "grid", gap: "0.6rem" }}
          >
            {CAMGPALB_FIELDS.map((def) => (
              <FieldRow
                key={def.key}
                def={def}
                value={s[FIELD_TO_STATE[def.key]]}
                onChange={(v) => setField(def.key, v)}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="dot" /> GASES ARTERIALES
          </div>
          <div
            className="panel-body"
            style={{ display: "grid", gap: "0.6rem" }}
          >
            {GAS_FIELDS.map((def) => (
              <FieldRow
                key={def.key}
                def={def}
                value={s[FIELD_TO_STATE[def.key]]}
                onChange={(v) => setField(def.key, v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Cálculos derivados */}
      {showCalcs && (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <div className="panel-header">
            <span className="dot" /> CÁLCULOS
          </div>
          <div
            className="panel-body"
            style={{ display: "grid", gap: "0.5rem" }}
          >
            {inp.naCorrected != null && (
              <CalcResultRow
                title="Na+ corr."
                value={f1(inp.naCorrected)}
                unit="mEq/L"
              />
            )}
            {inp.caCorrected != null && (
              <CalcResultRow
                title="Ca corr."
                value={f2(inp.caCorrected)}
                unit="mg/dL"
              />
            )}
            {inp.anionGap != null && (
              <CalcResultRow
                title="Anion Gap"
                value={f1(inp.anionGap)}
                unit="mEq/L"
              />
            )}
            {inp.anionGapCorrected != null && (
              <CalcResultRow
                title="AG corr."
                value={f1(inp.anionGapCorrected)}
                unit="mEq/L"
              />
            )}
            {inp.deltaRatio != null && (
              <CalcResultRow title="Δ/Δ" value={f2(inp.deltaRatio)} unit="" />
            )}
            {inp.osmolarity != null && (
              <CalcResultRow
                title="Osm"
                value={f0(inp.osmolarity)}
                unit="mOsm/L"
              />
            )}
            {inp.TBW != null && (
              <CalcResultRow title="TBW" value={f1(inp.TBW)} unit="L" />
            )}
          </div>
        </div>
      )}

      {/* Alteraciones */}
      {abnormalFindings.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div
            className="mono"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--red)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            ⚠ Alteraciones ({abnormalFindings.length})
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {abnormalFindings.map((f, i) => (
              <FindingCard key={`${f.title}-${i}`} f={f} />
            ))}
          </div>
        </div>
      )}

      {/* Normales */}
      {normalFindings.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div
            className="mono"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: "var(--accent)",
              fontSize: "0.65rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            ✓ Normales ({normalFindings.length})
          </div>
          <div
            className="panel"
            style={{ display: "grid", gap: "1px", background: "var(--border)" }}
          >
            {normalFindings.map((f, i) => (
              <div
                key={`${f.title}-${i}`}
                style={{
                  background: "var(--bg-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.5rem",
                  padding: "0.5rem 0.75rem",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    color: "var(--text-1)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>✓</span>
                  {f.title}
                </span>
                <span
                  className="mono"
                  style={{ color: "var(--text-2)", fontSize: "0.62rem" }}
                >
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty hint — no mostrar resultados basura si faltan inputs */}
      {findings.length === 0 && (
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
          Ingresa al menos un valor para comenzar el análisis.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            {/* humor negro */}
            {"// sin datos no hay diagnóstico — ni bueno ni malo"}
          </span>
        </div>
      )}

      {/* Limpiar */}
      <button
        type="button"
        onClick={clearAll}
        className="btn btn-outline btn-sm"
        style={{ marginBottom: "1.5rem" }}
      >
        limpiar campos
      </button>

      {/* Disclaimer */}
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
        {"// rangos e interpretaciones de literatura aceptada · orientativos"}
        <br />
        {"// correlaciona con la clínica, la volemia y la tendencia del paciente"}
        <br />
        {"// si algo sale mal, la culpa no es del app"}
      </p>
    </div>
  );
}
