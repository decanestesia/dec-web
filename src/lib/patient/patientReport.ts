// ============================================================
// patientReport — abre una ventana imprimible (→ "Guardar como PDF")
// con la HOJA DE VALORACIÓN PREANESTÉSICA del paciente activo:
// demografía, antropometría derivada, scores de riesgo (ASA, RCRI,
// STOP-BANG, Apfel, CrCl, MABL), comorbilidades, vía aérea, ayuno,
// alergias/medicación/notas y un panel de referencia calculada
// (fluidos 4-2-1, Vt por IBW, dosis de emergencia por peso).
// Sin dependencias externas. Los datos son del médico y quedan en su equipo.
// ============================================================

import {
  type Patient,
  type Comorbidities,
  deriveWeights,
  rcriScore,
  stopBang,
  apfel,
  cockcroftGault,
  mabl,
  kdigoStage,
} from "./PatientContext";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
function n(v: number | null | undefined, d = 0): string {
  return v == null || Number.isNaN(v) ? "—" : v.toFixed(d);
}

const ASA_LABEL: Record<number, string> = {
  1: "ASA I — sano",
  2: "ASA II — enf. sistémica leve",
  3: "ASA III — enf. sistémica grave",
  4: "ASA IV — amenaza vital constante",
  5: "ASA V — moribundo",
  6: "ASA VI — muerte encefálica (donante)",
};

const MALLAMPATI_LABEL: Record<number, string> = {
  1: "Clase I — paladar blando, úvula, pilares",
  2: "Clase II — paladar blando, úvula",
  3: "Clase III — paladar blando, base de úvula",
  4: "Clase IV — solo paladar duro",
};

const SURGERY_RISK_LABEL: Record<string, string> = {
  low: "Bajo",
  intermediate: "Intermedio",
  high: "Alto (intraperitoneal / intratorácica / vascular suprainguinal)",
};

const STOPBANG_LABEL: Record<string, string> = {
  low: "bajo (0-2)",
  intermediate: "intermedio (3-4)",
  high: "alto (5-8)",
};

const COMORBIDITY_LABEL: Record<keyof Comorbidities, string> = {
  htn: "Hipertensión arterial",
  ischemicHeart: "Cardiopatía isquémica",
  chf: "Insuficiencia cardíaca congestiva",
  cerebrovascular: "Enfermedad cerebrovascular (ACV/AIT)",
  insulinDm: "Diabetes en tratamiento con insulina",
  copd: "EPOC",
  osa: "Apnea obstructiva del sueño",
  smoker: "Fumador activo",
};

export function openPatientReport(p: Patient): void {
  const der = deriveWeights(p);
  const w = p.weightKg ?? 0;
  const ibw = der.ideal;

  // ---- Scores de riesgo (helpers puros del contexto) ----
  const rcri = rcriScore(p);
  const sb = stopBang(p);
  const apf = apfel(p);
  const crcl = cockcroftGault(p);
  const maxBl = mabl(p);

  const asaText = p.asaClass
    ? `${ASA_LABEL[p.asaClass] ?? "ASA " + p.asaClass}${p.asaEmergency ? " · E (emergencia)" : ""}`
    : "—";

  // Comorbilidades activas
  const activeComorbidities = (Object.keys(COMORBIDITY_LABEL) as (keyof Comorbidities)[])
    .filter((k) => p.comorbidities?.[k])
    .map((k) => COMORBIDITY_LABEL[k]);

  // ---- Mantenimiento 4-2-1 (mL/h) ----
  const maint =
    w > 0 ? (w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20)) : null;
  // Vt sobre peso ideal
  const vt6 = ibw ? ibw * 6 : null;
  const vt8 = ibw ? ibw * 8 : null;
  // Déficit por ayuno (mantenimiento × horas de ayuno)
  const fastingDeficit =
    maint != null && p.fastingHours != null && p.fastingHours > 0
      ? maint * p.fastingHours
      : null;

  const cap = (v: number, max: number | null) => (max != null ? Math.min(v, max) : v);
  const dose = (perKg: number, unit: string, max: number | null) =>
    w > 0 ? `${(+cap(perKg * w, max).toFixed(2))} ${unit}${max != null && perKg * w >= max ? " (máx)" : ""}` : "—";

  const emergencies: [string, string][] = [
    ["Adrenalina (paro)", dose(0.01, "mg", 1)],
    ["Atropina", dose(0.02, "mg", 1)],
    ["Amiodarona (paro)", dose(5, "mg", 300)],
    ["Succinilcolina (RSI)", dose(1.5, "mg", null)],
    ["Rocuronio (RSI)", dose(1.2, "mg", null)],
    ["Propofol (inducción)", dose(2, "mg", null)],
    ["Sugammadex (rescate)", dose(16, "mg", null)],
    ["Emulsión lipídica 20% (LAST)", dose(1.5, "mL", null)],
    ["Dantroleno (HM)", dose(2.5, "mg", null)],
  ];

  const now = new Date();
  const stamp = `${now.toLocaleDateString("es-DO")} ${now.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}`;

  const row = (k: string, v: string) => `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}</td></tr>`;
  // Fila de score con posible sub-etiqueta (clase/estadio) en la 3ª columna visual.
  const scoreRow = (k: string, v: string, tag?: string) =>
    `<tr><td class="k">${esc(k)}</td><td class="v">${esc(v)}${tag ? ` <span class="tag">${esc(tag)}</span>` : ""}</td></tr>`;

  const crclText = crcl != null ? `${crcl.toFixed(1)} mL/min` : "—";
  const crclTag = crcl != null ? kdigoStage(crcl) : undefined;
  const maxBlText = maxBl != null ? `${Math.round(maxBl)} mL` : "—";

  // Bloque libre (alergias/medicación/notas): omite el sub-bloque si está vacío.
  const freeText = (label: string, value: string | undefined) =>
    value && value.trim()
      ? `<div class="ft"><div class="ft-l">${esc(label)}</div><div class="ft-v">${esc(value)}</div></div>`
      : "";

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Valoración preanestésica — DEC</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; color: #16171c; margin: 26px; font-size: 12px; line-height: 1.5; }
  .brand { display: flex; align-items: baseline; gap: 8px; }
  .brand b { color: #0e9272; font-size: 20px; letter-spacing: 1px; }
  .prompt { color: #0e9272; font-size: 11px; }
  h1 { font-size: 15px; margin: 10px 0 2px; font-weight: 700; }
  .sub { color: #6b7280; font-size: 10.5px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  h2 { font-size: 10.5px; text-transform: uppercase; letter-spacing: 1.5px; color: #0e9272; border-bottom: 1.5px solid #10b981; padding-bottom: 3px; margin: 16px 0 6px; }
  h2::before { content: "// "; color: #9ca3af; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 3.5px 0; vertical-align: top; border-bottom: 1px dotted #e5e7eb; }
  td.k { color: #6b7280; width: 52%; }
  td.v { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; color: #111827; }
  .tag { display: inline-block; font-weight: 400; color: #6b7280; font-size: 9.5px; margin-left: 4px; }
  .scores { border: 1.5px solid #10b981; background: #f0fdf9; padding: 4px 12px 8px; margin: 6px 0 4px; }
  .scores h2 { margin-top: 8px; }
  .list { margin: 4px 0 0; padding: 0; list-style: none; }
  .list li { padding: 2.5px 0; border-bottom: 1px dotted #e5e7eb; color: #111827; }
  .list li::before { content: "▸ "; color: #0e9272; }
  .muted { color: #9ca3af; font-size: 9.5px; }
  .ft { margin-top: 8px; }
  .ft-l { color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; font-size: 9.5px; }
  .ft-v { color: #111827; white-space: pre-wrap; margin-top: 2px; }
  .foot { margin-top: 22px; color: #9ca3af; font-size: 9.5px; border-top: 1px solid #e5e7eb; padding-top: 8px; line-height: 1.6; }
  .foot b { color: #6b7280; }
  @media print { body { margin: 12mm; } .scores { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<div class="brand"><b>▸ DEC</b> <span class="prompt">$ cat /valoracion-preanestesica</span></div>
<h1>Hoja de valoración preanestésica</h1>
<div class="sub">${esc(p.label || "Paciente")}${p.mrn ? " · exp. " + esc(p.mrn) : ""} · generado ${esc(stamp)}</div>

<!-- ==================== SCORES DE RIESGO (bloque prominente) ==================== -->
<div class="scores">
  <h2>Scores de riesgo</h2>
  <table>
    ${scoreRow("ASA", asaText)}
    ${scoreRow("RCRI (Lee)", `${rcri.points} pts · evento ${rcri.riskPct}%`, rcri.riskClass)}
    ${scoreRow("STOP-BANG", `${sb.score} pts`, STOPBANG_LABEL[sb.risk] + " · parcial")}
    ${scoreRow("Apfel (NVPO ~24 h)", `${apf.score} pts · ~${apf.riskPct}%`)}
    ${scoreRow("Aclaramiento (Cockcroft-Gault)", crclText, crclTag)}
    ${scoreRow("MABL (Hct mín 21%)", maxBlText)}
  </table>
  <div class="muted" style="margin-top:6px">
    // RCRI: Lee 1999 · STOP-BANG: Chung 2008/2016 (parcial: sin cansancio ni cuello) · Apfel 1999 · CrCl: Cockcroft-Gault 1976 · MABL: Gross 1983
  </div>
</div>

<div class="grid">
  <div>
    <h2>Datos</h2>
    <table>
      ${row("Peso real", n(p.weightKg, 1) + " kg")}
      ${row("Talla", n(p.heightCm, 0) + " cm")}
      ${row("Edad", n(p.ageYears, 0) + " años")}
      ${row("Sexo", p.sex === "male" ? "Masculino" : "Femenino")}
    </table>
    <h2>Antropometría derivada</h2>
    <table>
      ${row("Peso ideal (IBW, Devine)", n(der.ideal, 1) + " kg")}
      ${row("Peso ajustado (ABW)", n(der.adjusted, 1) + " kg")}
      ${row("Masa magra (LBM, Boer)", n(der.lean, 1) + " kg")}
      ${row("IMC", n(der.bmi, 1) + " kg/m²")}
      ${row("Superficie corporal (Mosteller)", n(der.bsa, 2) + " m²")}
    </table>
    <h2>Laboratorio · ayuno</h2>
    <table>
      ${row("Hematocrito", p.hematocrit != null ? n(p.hematocrit, 0) + " %" : "—")}
      ${row("Creatinina", p.creatinine != null ? n(p.creatinine, 2) + " mg/dL" : "—")}
      ${row("Ayuno (NPO)", p.fastingHours != null ? n(p.fastingHours, 0) + " h" : "—")}
    </table>
    <h2>Vía aérea · cirugía</h2>
    <table>
      ${row("Mallampati", p.mallampati ? MALLAMPATI_LABEL[p.mallampati] : "—")}
      ${row("Riesgo quirúrgico", p.surgeryRisk ? SURGERY_RISK_LABEL[p.surgeryRisk] : "—")}
    </table>
  </div>
  <div>
    <h2>Comorbilidades</h2>
    ${
      activeComorbidities.length > 0
        ? `<ul class="list">${activeComorbidities.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`
        : `<div class="muted">— sin comorbilidades marcadas —</div>`
    }
    <h2>Alergias · medicación · notas</h2>
    ${freeText("Alergias", p.allergies) || `<div class="muted">— sin alergias registradas —</div>`}
    ${freeText("Medicación habitual", p.medications)}
    ${freeText("Notas", p.notes)}

    <h2>Referencia calculada</h2>
    <table>
      ${row("Mantenimiento 4-2-1", maint != null ? n(maint, 0) + " mL/h" : "—")}
      ${row("Déficit por ayuno", fastingDeficit != null ? n(fastingDeficit, 0) + " mL" : "—")}
      ${row("Volumen tidal 6 mL/kg (IBW)", vt6 != null ? n(vt6, 0) + " mL" : "—")}
      ${row("Volumen tidal 8 mL/kg (IBW)", vt8 != null ? n(vt8, 0) + " mL" : "—")}
    </table>
    <h2>Dosis de emergencia por peso</h2>
    <table>
      ${emergencies.map(([k, v]) => row(k, v)).join("")}
    </table>
  </div>
</div>
<div class="foot"><b>DEC · decanestesia.com</b> — herramienta de apoyo clínico. Scores y dosis de literatura aceptada; verifica cada dosis, concentración y vía contra el protocolo local y el inserto. La app calcula, el médico decide y firma. Los datos del paciente son de uso exclusivo del médico y no salen de este dispositivo — ni nosotros los queremos.</div>
<script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
</body></html>`;

  const win = window.open("", "_blank", "width=800,height=1000");
  if (!win) {
    alert("Permite las ventanas emergentes para generar el reporte PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
