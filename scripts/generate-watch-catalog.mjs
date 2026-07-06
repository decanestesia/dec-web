#!/usr/bin/env node
// generate-watch-catalog.mjs
// Genera "DEC Watch App/watch-catalog.json" desde public/drugs-full.json.
// Shape que espera WatchDrugSearchView.swift (struct WatchDrug):
//   { "n": nombre, "c": categoría, "d": resumen de dosis }
// El resumen `d` = "indicación · dosis · vía · frecuencia" de la primera fila de dosing,
// truncado a 90 caracteres (paridad con el catálogo previo, 893 → 1047 fármacos).
//
// Uso: node scripts/generate-watch-catalog.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const SRC = join(REPO, "public", "drugs-full.json");
const OUT = join(
  REPO,
  "..",
  "Xcode",
  "Calculator",
  "DEC Watch App",
  "watch-catalog.json"
);

const MAX_D = 90; // paridad con el catálogo previo

// Formatea número quitando ".0" sobrante (1.5 → "1.5", 1.0 → "1").
function num(x) {
  if (x === null || x === undefined) return "";
  const n = Number(x);
  if (Number.isNaN(n)) return String(x);
  return Number.isInteger(n) ? String(n) : String(n);
}

function doseStr(row) {
  const unit = row.dose_unit || "";
  const min = row.dose_min;
  const max = row.dose_max;
  if (min === null && max === null) return "";
  const a = num(min);
  const b = num(max);
  let val;
  if (min !== null && max !== null && a !== b) val = `${a}-${b}`;
  else val = a || b;
  if (!val) return "";
  return unit ? `${val} ${unit}` : val;
}

function summary(dosingRows) {
  if (!dosingRows || dosingRows.length === 0) return "";
  const sorted = [...dosingRows].sort(
    (x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0)
  );
  const row = sorted[0];
  const parts = [
    row.indication,
    doseStr(row),
    row.route,
    row.frequency,
  ].filter((p) => p && String(p).trim() !== "");
  return parts.join(" · ").slice(0, MAX_D);
}

const data = JSON.parse(readFileSync(SRC, "utf8"));
const detail = data.detail || {};
const drugs = data.drugs || [];

const out = drugs.map((dr) => ({
  n: dr.name || "",
  c: dr.category || "",
  d: summary(detail[dr.id]?.dosing),
}));

// Orden alfabético por nombre (locale es) para estabilidad.
out.sort((a, b) => a.n.localeCompare(b.n, "es"));

writeFileSync(OUT, JSON.stringify(out), "utf8");
console.log(`watch-catalog.json generado: ${out.length} fármacos`);
console.log(`  destino: ${OUT}`);
const withD = out.filter((x) => x.d).length;
console.log(`  con resumen de dosis: ${withD} / ${out.length}`);
