"use client";

// ============================================================
// ROTEM / TEG — Interpretación viscoelástica
// Port de RotemTegView.swift (853 líneas). Umbrales y árboles de
// decisión copiados exactamente del Swift. NO modificar cifras ni
// textos clínicos sin verificar contra la app iOS y la literatura.
// ============================================================

import { useMemo, useState } from "react";

// ── Modelo de hallazgos ─────────────────────────────────────
// port de RotemTegView.swift:21-68 (struct ViscoFinding + enum Severity)

type Severity = "normal" | "alert" | "action" | "urgent";

interface ViscoFinding {
  title: string;
  severity: Severity;
  value: string;
  interpretation: string;
  management: string;
}

// Severity.sortOrder — port de RotemTegView.swift:59-66
const SEVERITY_SORT: Record<Severity, number> = {
  urgent: 4,
  action: 3,
  alert: 2,
  normal: 1,
};

// Severity.label — port de RotemTegView.swift:50-57
const SEVERITY_LABEL: Record<Severity, string> = {
  normal: "Normal",
  alert: "Alerta",
  action: "Acción",
  urgent: "Urgente",
};

// Severity.color — port de RotemTegView.swift:32-39
// Swift: normal=.green, alert=.yellow, action=.orange, urgent=.red
// Web: normal=--accent (verde), alert=--amber (amarillo),
//      action=#fb923c (naranja), urgent=--red. Se mantienen los 4
//      niveles distinguibles como en iOS.
const SEVERITY_COLOR: Record<Severity, string> = {
  normal: "var(--accent)",
  alert: "var(--amber)",
  action: "#fb923c",
  urgent: "var(--red)",
};

// Severity.icon (glifos ASCII equivalentes a los SF Symbols de iOS)
// port de RotemTegView.swift:41-48
const SEVERITY_ICON: Record<Severity, string> = {
  normal: "✓",
  alert: "ⓘ",
  action: "△",
  urgent: "◉",
};

// ── Helpers ─────────────────────────────────────────────────

// RotemTegData.parseDouble — port de RotemTegView.swift:105-109
function parseDouble(s: string): number | null {
  const raw = s.trim();
  if (raw.length === 0) return null;
  const v = Number(raw.replace(/,/g, "."));
  return Number.isFinite(v) ? v : null;
}

// RotemTegData.fmt — port de RotemTegView.swift:537-539
function fmt(v: number): string {
  return v.toFixed(1);
}

// Swift Int(v): trunca hacia cero
function intStr(v: number): string {
  return String(Math.trunc(v));
}

// ── Estado de inputs ────────────────────────────────────────
// Espejo de RotemTegData (@Published) — port de RotemTegView.swift:72-121

interface RotemInputs {
  ctExtem: string;
  cftExtem: string;
  alphaExtem: string;
  a5Extem: string;
  a10Extem: string;
  mcfExtem: string;
  li30Extem: string;
  mlExtem: string;
  ctIntem: string;
  cftIntem: string;
  a10Intem: string;
  mcfIntem: string;
  ctHeptem: string;
  a10Heptem: string;
  a5Fibtem: string;
  a10Fibtem: string;
  mcfFibtem: string;
  a10Aptem: string;
  li30Aptem: string;
}

interface TegInputs {
  rTeg: string;
  kTeg: string;
  alphaTeg: string;
  maTeg: string;
  ly30Teg: string;
  eplTeg: string;
  maFf: string;
  rCkh: string;
  maCkh: string;
}

const EMPTY_ROTEM: RotemInputs = {
  ctExtem: "",
  cftExtem: "",
  alphaExtem: "",
  a5Extem: "",
  a10Extem: "",
  mcfExtem: "",
  li30Extem: "",
  mlExtem: "",
  ctIntem: "",
  cftIntem: "",
  a10Intem: "",
  mcfIntem: "",
  ctHeptem: "",
  a10Heptem: "",
  a5Fibtem: "",
  a10Fibtem: "",
  mcfFibtem: "",
  a10Aptem: "",
  li30Aptem: "",
};

const EMPTY_TEG: TegInputs = {
  rTeg: "",
  kTeg: "",
  alphaTeg: "",
  maTeg: "",
  ly30Teg: "",
  eplTeg: "",
  maFf: "",
  rCkh: "",
  maCkh: "",
};

// ============================================================
// Análisis ROTEM — port de RotemTegView.swift:125-350
// ============================================================

// analyzeCtExtem — port de RotemTegView.swift:173-208
function analyzeCtExtem(v: number): ViscoFinding {
  if (v > 100) {
    return {
      title: "CT-EXTEM marcadamente prolongado",
      severity: "urgent",
      value: `${intStr(v)} seg (VN 38-79)`,
      interpretation:
        "Déficit severo de factores de la vía extrínseca. Coagulopatía dilucional, sangrado masivo, hepatopatía, efecto de warfarina.",
      management:
        "PFC 15-20 mL/kg O CCP 25-50 UI/kg. Vit K 10 mg IV si efecto warfarina.",
    };
  }
  if (v > 80) {
    return {
      title: "CT-EXTEM prolongado",
      severity: "action",
      value: `${intStr(v)} seg (VN 38-79)`,
      interpretation: "Déficit moderado de factores de la coagulación.",
      management:
        "PFC 10-15 mL/kg. Considerar CCP si sangrado activo (10-20 UI/kg).",
    };
  }
  if (v >= 38) {
    return {
      title: "CT-EXTEM normal",
      severity: "normal",
      value: `${intStr(v)} seg`,
      interpretation: "Vía extrínseca y común sin alteración.",
      management: "—",
    };
  }
  return {
    title: "CT-EXTEM acortado",
    severity: "alert",
    value: `${intStr(v)} seg (VN 38-79)`,
    interpretation:
      "Hipercoagulabilidad / activación temprana de la coagulación.",
    management: "Evaluar tromboprofilaxis. Vigilar trombosis.",
  };
}

// analyzeCtIntem — port de RotemTegView.swift:210-238
function analyzeCtIntem(v: number, heptem: number | null): ViscoFinding {
  if (heptem !== null) {
    const hep = heptem;
    const diff = v - hep;
    const ratio = hep > 0 ? v / hep : 0;
    if (diff > 30 || ratio > 1.25) {
      return {
        title: "Efecto heparina detectado",
        severity: "action",
        value: `INTEM ${intStr(v)} / HEPTEM ${intStr(hep)} seg`,
        interpretation:
          "CT-INTEM prolongado que se corrige con HEPTEM. Confirma efecto de heparina residual.",
        management:
          "Protamina IV: 1 mg por cada 100 U de heparina en las últimas 2-3h.",
      };
    }
    return {
      title: "CT-INTEM prolongado sin heparina",
      severity: "action",
      value: `INTEM ${intStr(v)} / HEPTEM ${intStr(hep)} seg`,
      interpretation:
        "Déficit de factores de la vía intrínseca. Considerar hemofilia, déficit FXII, DOACs.",
      management:
        "PFC 10-15 mL/kg. Consultar hematología si sospecha de inhibidor.",
    };
  }
  return {
    title: "CT-INTEM prolongado",
    severity: "alert",
    value: `${intStr(v)} seg (VN 100-240)`,
    interpretation:
      "Posible efecto heparina O déficit de factores intrínsecos.",
    management: "Solicitar HEPTEM para diferenciar.",
  };
}

// analyzeA10Extem — port de RotemTegView.swift:240-293
function analyzeA10Extem(aex: number, fib: number | null): ViscoFinding {
  if (aex < 30) {
    if (fib !== null && fib < 7) {
      return {
        title: "Hipofibrinogenemia con coágulo débil",
        severity: "urgent",
        value: `A10-EXTEM ${fmt(aex)} / FIBTEM ${fmt(fib)} mm`,
        interpretation:
          "Déficit grave de fibrinógeno como causa del coágulo débil.",
        management:
          "Concentrado de fibrinógeno 25-50 mg/kg (3-4 g en adulto). Alt: crioprecipitado 1 U/10 kg.",
      };
    }
    if (fib !== null && fib >= 7) {
      return {
        title: "Trombocitopenia/disfunción plaquetaria",
        severity: "urgent",
        value: `A10-EXTEM ${fmt(aex)} / FIBTEM ${fmt(fib)} mm`,
        interpretation:
          "Coágulo débil con fibrinógeno conservado. Déficit plaquetario.",
        management:
          "Plaquetas 1 U/10 kg. Desmopresina 0.3 µg/kg IV si uremia/antiagregantes.",
      };
    }
    return {
      title: "A10-EXTEM marcadamente bajo",
      severity: "urgent",
      value: `${fmt(aex)} mm (VN 43-65)`,
      interpretation:
        "Coágulo muy débil. Solicitar FIBTEM para diferenciar.",
      management: "Si sangrado: fibrinógeno empírico 25-50 mg/kg + plaquetas.",
    };
  }
  if (aex < 40) {
    return {
      title: "A10-EXTEM bajo",
      severity: "action",
      value: `${fmt(aex)} mm (VN 43-65)`,
      interpretation: "Coágulo de firmeza subóptima.",
      management:
        "Si FIBTEM <10: fibrinógeno 25 mg/kg. Si FIBTEM >10: plaquetas 1 U/10 kg.",
    };
  }
  if (aex < 43) {
    return {
      title: "A10-EXTEM límite",
      severity: "alert",
      value: `${fmt(aex)} mm (VN 43-65)`,
      interpretation: "Firmeza del coágulo en límite inferior.",
      management: "Vigilar evolución. Tratamiento solo si sangrado clínico.",
    };
  }
  return {
    title: "A10-EXTEM normal",
    severity: "normal",
    value: `${fmt(aex)} mm`,
    interpretation: "Firmeza del coágulo adecuada.",
    management: "—",
  };
}

// analyzeFibtemAlone — port de RotemTegView.swift:295-312
function analyzeFibtemAlone(v: number): ViscoFinding {
  if (v < 7) {
    return {
      title: "FIBTEM bajo (hipofibrinogenemia)",
      severity: "urgent",
      value: `A10 ${fmt(v)} mm (VN 7-24)`,
      interpretation:
        "Déficit de fibrinógeno funcional. Equivale a fibrinógeno <150 mg/dL.",
      management:
        "Concentrado de fibrinógeno 25-50 mg/kg O crioprecipitado 1 U/10 kg.",
    };
  }
  return {
    title: "FIBTEM normal",
    severity: "normal",
    value: `A10 ${fmt(v)} mm`,
    interpretation: "Fibrinógeno funcional adecuado.",
    management: "—",
  };
}

// analyzeCftExtem — port de RotemTegView.swift:314-331
function analyzeCftExtem(v: number): ViscoFinding {
  if (v > 200) {
    return {
      title: "CFT-EXTEM muy prolongado",
      severity: "action",
      value: `${intStr(v)} seg (VN 34-159)`,
      interpretation:
        "Formación lenta del coágulo por déficit de fibrinógeno y/o disfunción plaquetaria.",
      management: "Evaluar FIBTEM. Considerar fibrinógeno y/o plaquetas.",
    };
  }
  return {
    title: "CFT-EXTEM prolongado",
    severity: "alert",
    value: `${intStr(v)} seg (VN 34-159)`,
    interpretation: "Cinética de formación del coágulo enlentecida.",
    management: "Vigilar A10 y MCF.",
  };
}

// analyzeLi30 — port de RotemTegView.swift:333-350
function analyzeLi30(v: number, aptem: number | null): ViscoFinding {
  if (aptem !== null && aptem >= 85) {
    return {
      title: "Hiperfibrinolisis confirmada",
      severity: "urgent",
      value: `LI30-EXTEM ${fmt(v)}% / APTEM ${fmt(aptem)}%`,
      interpretation:
        "Lisis acelerada que se inhibe en APTEM. Hiperfibrinolisis primaria.",
      management:
        "Ácido tranexámico 1 g IV bolo (15-25 mg/kg) + 1 g en infusión 8 h. URGENTE.",
    };
  }
  return {
    title: "Hiperfibrinolisis (LI30 bajo)",
    severity: "urgent",
    value: `LI30-EXTEM ${fmt(v)}% (VN >=85)`,
    interpretation: "Lisis acelerada del coágulo.",
    management: "Ácido tranexámico 1 g IV bolo + 1 g en 8 h.",
  };
}

// rotemFindings — port de RotemTegView.swift:125-171
function computeRotemFindings(d: RotemInputs): ViscoFinding[] {
  const findings: ViscoFinding[] = [];

  const ct_ex = parseDouble(d.ctExtem);
  const cft_ex = parseDouble(d.cftExtem);
  const a10_ex = parseDouble(d.a10Extem);
  const li30_ex = parseDouble(d.li30Extem);
  const ml_ex = parseDouble(d.mlExtem);
  const ct_in = parseDouble(d.ctIntem);
  const ct_hep = parseDouble(d.ctHeptem);
  const a10_fib = parseDouble(d.a10Fibtem);
  const li30_ap = parseDouble(d.li30Aptem);

  if (ct_ex !== null) {
    findings.push(analyzeCtExtem(ct_ex));
  }

  if (ct_in !== null && ct_in > 240) {
    findings.push(analyzeCtIntem(ct_in, ct_hep));
  }

  if (a10_ex !== null) {
    findings.push(analyzeA10Extem(a10_ex, a10_fib));
  } else if (a10_fib !== null) {
    findings.push(analyzeFibtemAlone(a10_fib));
  }

  if (cft_ex !== null && cft_ex > 159) {
    findings.push(analyzeCftExtem(cft_ex));
  }

  if (li30_ex !== null && li30_ex < 85) {
    findings.push(analyzeLi30(li30_ex, li30_ap));
  }

  if (ml_ex !== null && ml_ex >= 15) {
    findings.push({
      title: "ML elevado (lisis máxima)",
      severity: "urgent",
      value: `${fmt(ml_ex)}% (VN <15)`,
      interpretation:
        "Máxima lisis del coágulo elevada, indicativa de hiperfibrinolisis.",
      management: "Ácido tranexámico 1 g IV bolo + 1 g en 8 h.",
    });
  }

  // .sorted { $0.severity.sortOrder > $1.severity.sortOrder }
  return findings
    .slice()
    .sort((a, b) => SEVERITY_SORT[b.severity] - SEVERITY_SORT[a.severity]);
}

// ============================================================
// Análisis TEG — port de RotemTegView.swift:354-535
// ============================================================

// analyzeR — port de RotemTegView.swift:414-458
function analyzeR(v: number, rckh: number | null): ViscoFinding {
  if (v > 14) {
    if (rckh !== null && Math.abs(v - rckh) > 2) {
      return {
        title: "R prolongado por heparina",
        severity: "action",
        value: `R ${fmt(v)} / R-CKH ${fmt(rckh)} min`,
        interpretation:
          "R que se corrige con heparinasa. Efecto heparina residual.",
        management: "Protamina IV: 1 mg por cada 100 U de heparina.",
      };
    }
    return {
      title: "R marcadamente prolongado",
      severity: "urgent",
      value: `${fmt(v)} min (VN 2-8)`,
      interpretation:
        "Déficit severo de factores. Coagulopatía dilucional o sobredosis de anticoagulantes.",
      management: "PFC 15-20 mL/kg. Considerar CCP. Vit K si warfarina.",
    };
  }
  if (v > 8) {
    return {
      title: "R prolongado",
      severity: "action",
      value: `${fmt(v)} min (VN 2-8)`,
      interpretation: "Déficit moderado de factores.",
      management: "PFC 10-15 mL/kg. Considerar protamina si heparina.",
    };
  }
  if (v >= 2) {
    return {
      title: "R normal",
      severity: "normal",
      value: `${fmt(v)} min`,
      interpretation: "Iniciación de la coagulación normal.",
      management: "—",
    };
  }
  return {
    title: "R acortado",
    severity: "alert",
    value: `${fmt(v)} min (VN 2-8)`,
    interpretation: "Hipercoagulabilidad. Riesgo trombótico aumentado.",
    management: "Evaluar tromboprofilaxis.",
  };
}

// analyzeAlpha — port de RotemTegView.swift:460-480 (devuelve nil si normal)
function analyzeAlpha(v: number): ViscoFinding | null {
  if (v < 47) {
    return {
      title: "Ángulo α bajo",
      severity: "action",
      value: `${fmt(v)}° (VN 55-78)`,
      interpretation:
        "Hipofibrinogenemia. Polimerización de fibrinógeno reducida.",
      management:
        "Crioprecipitado 1 U/10 kg O fibrinógeno 25-50 mg/kg.",
    };
  }
  if (v < 55) {
    return {
      title: "Ángulo α límite",
      severity: "alert",
      value: `${fmt(v)}° (VN 55-78)`,
      interpretation: "Polimerización marginalmente disminuida.",
      management: "Vigilar. Tratar si sangrado clínico.",
    };
  }
  return null;
}

// analyzeMA — port de RotemTegView.swift:482-535
function analyzeMA(v: number, maff: number | null): ViscoFinding {
  if (v < 45) {
    if (maff !== null && maff < 14) {
      return {
        title: "Hipofibrinogenemia con MA bajo",
        severity: "urgent",
        value: `MA ${fmt(v)} / MA-FF ${fmt(maff)} mm`,
        interpretation:
          "Déficit de fibrinógeno como causa del coágulo débil.",
        management:
          "Concentrado de fibrinógeno 25-50 mg/kg O crioprecipitado 1 U/10 kg.",
      };
    }
    if (maff !== null && maff >= 14) {
      return {
        title: "Disfunción plaquetaria con MA bajo",
        severity: "urgent",
        value: `MA ${fmt(v)} / MA-FF ${fmt(maff)} mm`,
        interpretation: "Déficit/disfunción plaquetaria.",
        management: "Plaquetas 1 U/10 kg. Desmopresina si uremia/antiagregantes.",
      };
    }
    return {
      title: "MA marcadamente bajo",
      severity: "urgent",
      value: `${fmt(v)} mm (VN 51-69)`,
      interpretation: "Coágulo muy débil. Solicitar MA-FF.",
      management: "Si sangrado: fibrinógeno + plaquetas.",
    };
  }
  if (v < 51) {
    return {
      title: "MA bajo",
      severity: "action",
      value: `${fmt(v)} mm (VN 51-69)`,
      interpretation: "Firmeza subóptima del coágulo.",
      management: "Solicitar MA-FF. Tratar componente deficitario.",
    };
  }
  if (v <= 69) {
    return {
      title: "MA normal",
      severity: "normal",
      value: `${fmt(v)} mm`,
      interpretation: "Firmeza adecuada.",
      management: "—",
    };
  }
  return {
    title: "MA elevado",
    severity: "alert",
    value: `${fmt(v)} mm (VN 51-69)`,
    interpretation: "Hipercoagulabilidad. Riesgo trombótico.",
    management: "Evaluar tromboprofilaxis.",
  };
}

// tegFindings — port de RotemTegView.swift:354-412
function computeTegFindings(d: TegInputs): ViscoFinding[] {
  const findings: ViscoFinding[] = [];

  const r = parseDouble(d.rTeg);
  const kV = parseDouble(d.kTeg);
  const alpha = parseDouble(d.alphaTeg);
  const ma = parseDouble(d.maTeg);
  const ly30 = parseDouble(d.ly30Teg);
  const epl = parseDouble(d.eplTeg);
  const maff = parseDouble(d.maFf);
  const rckh = parseDouble(d.rCkh);

  if (r !== null) {
    findings.push(analyzeR(r, rckh));
  }

  if (kV !== null && kV > 3) {
    findings.push({
      title: "K prolongado",
      severity: "action",
      value: `${fmt(kV)} min (VN 1-3)`,
      interpretation:
        "Cinética lenta del coágulo. Déficit de fibrinógeno o plaquetas.",
      management: "Crioprecipitado 1 U/10 kg O fibrinógeno 25-50 mg/kg.",
    });
  }

  if (alpha !== null) {
    const f = analyzeAlpha(alpha);
    if (f) {
      findings.push(f);
    }
  }

  if (ma !== null) {
    findings.push(analyzeMA(ma, maff));
  }

  if (ly30 !== null && ly30 > 8) {
    const sev: Severity = ly30 > 15 ? "urgent" : "action";
    findings.push({
      title: "Hiperfibrinolisis (LY30 elevado)",
      severity: sev,
      value: `${fmt(ly30)}% (VN 0-8)`,
      interpretation:
        "Lisis acelerada del coágulo. Frecuente en trauma, hepatopatía, obstetricia.",
      management: "Ácido tranexámico 1 g IV bolo + 1 g en infusión 8 h.",
    });
  }

  if (epl !== null && epl >= 15) {
    findings.push({
      title: "EPL elevado",
      severity: "action",
      value: `${fmt(epl)}% (VN <15)`,
      interpretation:
        "Lisis estimada elevada. Sugerente de hiperfibrinolisis.",
      management: "Considerar ácido tranexámico si sangrado activo.",
    });
  }

  // .sorted { $0.severity.sortOrder > $1.severity.sortOrder }
  return findings
    .slice()
    .sort((a, b) => SEVERITY_SORT[b.severity] - SEVERITY_SORT[a.severity]);
}

// ============================================================
// Definición de inputs por sección (labels + placeholders VN)
// port de RotemInputsView / TegInputsView — RotemTegView.swift:656-778
// ============================================================

interface FieldDef {
  label: string;
  placeholder: string;
  key: keyof RotemInputs | keyof TegInputs;
}

interface SectionDef {
  title: string;
  fields: FieldDef[];
}

// EXTEM / INTEM / HEPTEM / FIBTEM / APTEM — port RotemTegView.swift:670-712
const ROTEM_SECTIONS: SectionDef[] = [
  {
    title: "EXTEM",
    fields: [
      { label: "CT", placeholder: "38-79", key: "ctExtem" },
      { label: "CFT", placeholder: "34-159", key: "cftExtem" },
      { label: "Ángulo (°)", placeholder: "63-83", key: "alphaExtem" },
      { label: "A5", placeholder: ">=34", key: "a5Extem" },
      { label: "A10", placeholder: "43-65", key: "a10Extem" },
      { label: "MCF", placeholder: "50-72", key: "mcfExtem" },
      { label: "LI30", placeholder: ">=85", key: "li30Extem" },
      { label: "ML", placeholder: "<15", key: "mlExtem" },
    ],
  },
  {
    title: "INTEM",
    fields: [
      { label: "CT", placeholder: "100-240", key: "ctIntem" },
      { label: "CFT", placeholder: "30-110", key: "cftIntem" },
      { label: "A10", placeholder: "44-66", key: "a10Intem" },
      { label: "MCF", placeholder: "52-72", key: "mcfIntem" },
    ],
  },
  {
    title: "HEPTEM",
    fields: [
      { label: "CT", placeholder: "~INTEM", key: "ctHeptem" },
      { label: "A10", placeholder: "44-66", key: "a10Heptem" },
    ],
  },
  {
    title: "FIBTEM",
    fields: [
      { label: "A5", placeholder: ">=7", key: "a5Fibtem" },
      { label: "A10", placeholder: "7-24", key: "a10Fibtem" },
      { label: "MCF", placeholder: "9-25", key: "mcfFibtem" },
    ],
  },
  {
    title: "APTEM",
    fields: [
      { label: "A10", placeholder: "—", key: "a10Aptem" },
      { label: "LI30", placeholder: ">=85", key: "li30Aptem" },
    ],
  },
];

// TEG (CK) / CFF / CKH — port RotemTegView.swift:742-764
const TEG_SECTIONS: SectionDef[] = [
  {
    title: "TEG (CK)",
    fields: [
      { label: "R (min)", placeholder: "2-8", key: "rTeg" },
      { label: "K (min)", placeholder: "1-3", key: "kTeg" },
      { label: "Ángulo (°)", placeholder: "55-78", key: "alphaTeg" },
      { label: "MA", placeholder: "51-69", key: "maTeg" },
      { label: "LY30", placeholder: "0-8", key: "ly30Teg" },
      { label: "EPL", placeholder: "<15", key: "eplTeg" },
    ],
  },
  {
    title: "CFF",
    fields: [{ label: "MA-FF", placeholder: "14-32", key: "maFf" }],
  },
  {
    title: "CKH (heparinasa)",
    fields: [
      { label: "R-CKH", placeholder: "2-8", key: "rCkh" },
      { label: "MA-CKH", placeholder: "51-69", key: "maCkh" },
    ],
  },
];

type ViscoSystem = "rotem" | "teg";

// ============================================================
// Página
// ============================================================

export default function RotemTegPage() {
  const [system, setSystem] = useState<ViscoSystem>("rotem");
  const [rotem, setRotem] = useState<RotemInputs>(EMPTY_ROTEM);
  const [teg, setTeg] = useState<TegInputs>(EMPTY_TEG);

  const findings = useMemo<ViscoFinding[]>(
    () => (system === "rotem" ? computeRotemFindings(rotem) : computeTegFindings(teg)),
    [system, rotem, teg]
  );

  // abnormalFindings / normalFindings — port RotemTegView.swift:569-575
  const abnormalFindings = findings.filter((f) => f.severity !== "normal");
  const normalFindings = findings.filter((f) => f.severity === "normal");

  const sections = system === "rotem" ? ROTEM_SECTIONS : TEG_SECTIONS;

  const setField = (key: string, value: string) => {
    if (system === "rotem") {
      setRotem((prev) => ({ ...prev, [key]: value }));
    } else {
      setTeg((prev) => ({ ...prev, [key]: value }));
    }
  };

  const getField = (key: string): string => {
    if (system === "rotem") {
      return rotem[key as keyof RotemInputs] ?? "";
    }
    return teg[key as keyof TegInputs] ?? "";
  };

  const clearAll = () => {
    // clearAll — port RotemTegView.swift:111-121
    setRotem(EMPTY_ROTEM);
    setTeg(EMPTY_TEG);
  };

  const hasAnyInput =
    system === "rotem"
      ? Object.values(rotem).some((v) => v.trim().length > 0)
      : Object.values(teg).some((v) => v.trim().length > 0);

  return (
    <div
      className="wrap"
      style={{ paddingTop: "1.5rem", paddingBottom: "3rem", maxWidth: 760 }}
    >
      {/* Header */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div className="prompt mono blink" style={{ marginBottom: "0.5rem" }}>
          <b>$</b> ./rotem-teg.sh
        </div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700 }}>
          Interpretación viscoelástica
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
          ROTEM · TEG — umbrales y árboles de decisión para hemoderivados.
          <br />
          <span style={{ opacity: 0.6 }}>
            {/* humor negro — comentario médico-cínico */}
            // el coágulo no miente; el paciente, a veces
          </span>
        </p>
      </div>

      {/* System picker — port RotemTegView.swift:604-614 (Picker segmented) */}
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1rem",
          border: "1px solid var(--border)",
          background: "var(--bg-1)",
          padding: "0.25rem",
        }}
      >
        {(["rotem", "teg"] as ViscoSystem[]).map((s) => {
          const active = system === s;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setSystem(s)}
              className="mono"
              style={{
                flex: 1,
                padding: "0.4rem 0.5rem",
                fontSize: "0.7rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: active ? "var(--accent)" : "transparent",
                color: active ? "#000" : "var(--text-2)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s === "rotem" ? "ROTEM" : "TEG"}
            </button>
          );
        })}
      </div>

      {/* Info — port RotemTegView.swift:616-623 */}
      <p
        className="mono"
        style={{
          color: "var(--text-2)",
          fontSize: "0.65rem",
          lineHeight: 1.7,
          marginBottom: "1.25rem",
        }}
      >
        Ingresa solo los valores disponibles. La app analiza cada parámetro y
        muestra alteraciones con indicaciones.
      </p>

      {/* Inputs */}
      <div style={{ display: "grid", gap: "1rem", marginBottom: "1.5rem" }}>
        {sections.map((section) => (
          <div key={section.title} className="panel">
            <div className="panel-header">
              <span className="dot" /> {section.title}
            </div>
            <div
              className="panel-body"
              style={{ display: "grid", gap: "0.5rem" }}
            >
              {section.fields.map((f) => (
                <div
                  key={f.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <label
                    className="mono"
                    htmlFor={`f-${f.key}`}
                    style={{
                      color: "var(--text-1)",
                      fontSize: "0.72rem",
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    id={`f-${f.key}`}
                    type="text"
                    inputMode="decimal"
                    className="calc-input mono"
                    placeholder={f.placeholder}
                    value={getField(f.key)}
                    onChange={(e) => setField(f.key, e.target.value)}
                    style={{ textAlign: "right" }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Resultados */}
      {!hasAnyInput ? (
        <div
          className="mono"
          style={{
            padding: "1.5rem",
            textAlign: "center",
            color: "var(--text-3)",
            fontSize: "0.7rem",
            border: "1px dashed var(--border)",
            background: "var(--bg-1)",
            lineHeight: 1.8,
          }}
        >
          Ingresa al menos un valor para ver la interpretación.
          <br />
          <span style={{ opacity: 0.5, fontSize: "0.6rem" }}>
            // sin datos no hay coágulo que interpretar
          </span>
        </div>
      ) : (
        <>
          {/* Alteraciones — port RotemTegView.swift:625-637 */}
          {abnormalFindings.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <SectionHeader
                icon="△"
                label={`Alteraciones (${abnormalFindings.length})`}
                color="var(--amber)"
              />
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {abnormalFindings.map((f, i) => (
                  <FindingCard key={`${f.title}-${i}`} finding={f} />
                ))}
              </div>
            </div>
          )}

          {/* Normales — port RotemTegView.swift:639-651 */}
          {normalFindings.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <SectionHeader
                icon="✓"
                label={`Normales (${normalFindings.length})`}
                color="var(--accent)"
              />
              <div
                className="panel"
                style={{ display: "grid", gap: "1px", background: "var(--border)" }}
              >
                {normalFindings.map((f, i) => (
                  <FindingRowCompact key={`${f.title}-${i}`} finding={f} />
                ))}
              </div>
            </div>
          )}

          {abnormalFindings.length === 0 && normalFindings.length === 0 && (
            <div
              className="mono"
              style={{
                padding: "1.25rem",
                textAlign: "center",
                color: "var(--text-3)",
                fontSize: "0.7rem",
                border: "1px dashed var(--border)",
                background: "var(--bg-1)",
              }}
            >
              // los valores ingresados no cruzan ningún umbral de alerta
            </div>
          )}
        </>
      )}

      {/* Clear button — port RotemTegView.swift:591-596 */}
      {hasAnyInput && (
        <button
          type="button"
          onClick={clearAll}
          className="btn btn-outline btn-sm"
          style={{ marginTop: "0.5rem" }}
        >
          limpiar campos
        </button>
      )}

      {/* Disclaimer con humor negro */}
      <p
        className="mono"
        style={{
          color: "var(--text-3)",
          fontSize: "0.55rem",
          marginTop: "2rem",
          opacity: 0.55,
          textAlign: "center",
          lineHeight: 1.7,
        }}
      >
        // valores de referencia orientativos (ROTEM delta / TEG 6s) · verifica
        con tu analizador y protocolo local
        <br />
        // la máquina interpreta números; tú interpretas al paciente
      </p>
    </div>
  );
}

// ── Componentes de presentación ─────────────────────────────

function SectionHeader({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <div
      className="mono"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        color,
        fontSize: "0.65rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        marginBottom: "0.6rem",
        paddingBottom: "0.35rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span aria-hidden style={{ fontSize: "0.75rem" }}>
        {icon}
      </span>
      {label}
    </div>
  );
}

// ViscoFindingCard — port RotemTegView.swift:782-836
function FindingCard({ finding }: { finding: ViscoFinding }) {
  const color = SEVERITY_COLOR[finding.severity];
  return (
    <div
      className="panel"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="panel-body" style={{ display: "grid", gap: "0.4rem" }}>
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
          }}
        >
          <span
            aria-hidden
            style={{ color, fontSize: "0.85rem", lineHeight: 1.3 }}
          >
            {SEVERITY_ICON[finding.severity]}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "var(--text-0)",
                fontSize: "0.82rem",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {finding.title}
            </div>
            <div
              className="mono"
              style={{
                color: "var(--text-2)",
                fontSize: "0.62rem",
                marginTop: "0.1rem",
              }}
            >
              {finding.value}
            </div>
          </div>
          <span
            className="mono"
            style={{
              fontSize: "0.55rem",
              fontWeight: 700,
              letterSpacing: "0.06em",
              color,
              border: `1px solid ${color}`,
              padding: "0.1rem 0.4rem",
              whiteSpace: "nowrap",
            }}
          >
            {SEVERITY_LABEL[finding.severity]}
          </span>
        </div>

        {/* interpretation */}
        <p
          style={{
            color: "var(--text-1)",
            fontSize: "0.72rem",
            lineHeight: 1.6,
          }}
        >
          {finding.interpretation}
        </p>

        {/* management (Swift oculta si "—") — RotemTegView.swift:828-835 */}
        {finding.management !== "—" && (
          <div
            style={{
              paddingLeft: "0.6rem",
              borderLeft: "2px solid var(--accent)",
            }}
          >
            <div
              className="mono"
              style={{
                color: "var(--text-3)",
                fontSize: "0.55rem",
                letterSpacing: "0.1em",
                marginBottom: "0.2rem",
              }}
            >
              MANEJO
            </div>
            <p
              style={{
                color: "var(--accent)",
                fontSize: "0.72rem",
                lineHeight: 1.6,
              }}
            >
              {finding.management}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ViscoFindingRowCompact — port RotemTegView.swift:838-853
function FindingRowCompact({ finding }: { finding: ViscoFinding }) {
  const color = SEVERITY_COLOR[finding.severity];
  return (
    <div
      style={{
        background: "var(--bg-2)",
        padding: "0.55rem 0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      <span aria-hidden style={{ color, fontSize: "0.8rem" }}>
        {SEVERITY_ICON[finding.severity]}
      </span>
      <span
        style={{
          color: "var(--text-1)",
          fontSize: "0.75rem",
          fontWeight: 500,
        }}
      >
        {finding.title}
      </span>
      <span
        className="mono"
        style={{
          marginLeft: "auto",
          color: "var(--text-2)",
          fontSize: "0.62rem",
        }}
      >
        {finding.value}
      </span>
    </div>
  );
}
