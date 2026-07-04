// ============================================================
// patientReport — abre una ventana imprimible (→ "Guardar como PDF")
// con la hoja del paciente: demografía, pesos derivados y un panel de
// valores calculados de referencia (fluidos, Vt, dosis de emergencia por peso).
// Sin dependencias externas. Los datos son del médico y quedan en su equipo.
// ============================================================

import { type Patient, deriveWeights } from "./PatientContext";

function esc(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}
function n(v: number | null | undefined, d = 0): string {
  return v == null || Number.isNaN(v) ? "—" : v.toFixed(d);
}

export function openPatientReport(p: Patient): void {
  const der = deriveWeights(p);
  const w = p.weightKg ?? 0;
  const ibw = der.ideal;

  // Mantenimiento 4-2-1 (mL/h)
  const maint =
    w > 0 ? (w <= 10 ? 4 * w : w <= 20 ? 40 + 2 * (w - 10) : 60 + (w - 20)) : null;
  // Vt sobre peso ideal
  const vt6 = ibw ? ibw * 6 : null;
  const vt8 = ibw ? ibw * 8 : null;

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

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>Hoja de paciente — DEC</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, system-ui, sans-serif; color: #111; margin: 32px; font-size: 13px; }
  h1 { font-size: 18px; margin: 0 0 2px; }
  .sub { color: #666; font-size: 11px; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #0e9272; border-bottom: 1px solid #ddd; padding-bottom: 3px; margin: 18px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 3px 0; vertical-align: top; }
  td.k { color: #555; width: 60%; }
  td.v { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
  .foot { margin-top: 24px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 8px; }
  @media print { body { margin: 12mm; } .noprint { display: none; } }
</style></head><body>
<h1>DEC — Hoja de paciente</h1>
<div class="sub">${esc(p.label || "Paciente")}${p.mrn ? " · exp. " + esc(p.mrn) : ""} · generado ${esc(stamp)}</div>
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
  </div>
  <div>
    <h2>Referencia calculada</h2>
    <table>
      ${row("Mantenimiento 4-2-1", maint != null ? n(maint, 0) + " mL/h" : "—")}
      ${row("Volumen tidal 6 mL/kg (IBW)", vt6 != null ? n(vt6, 0) + " mL" : "—")}
      ${row("Volumen tidal 8 mL/kg (IBW)", vt8 != null ? n(vt8, 0) + " mL" : "—")}
    </table>
    <h2>Dosis de emergencia por peso</h2>
    <table>
      ${emergencies.map(([k, v]) => row(k, v)).join("")}
    </table>
  </div>
</div>
<div class="foot">Herramienta de apoyo clínico (DEC — decanestesia.com). Verifica cada dosis, concentración y vía contra el protocolo local y el inserto. Los datos del paciente son de uso exclusivo del médico y no salen de este dispositivo.</div>
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
