#!/usr/bin/env node
/**
 * Regenera public/drugs.json desde Supabase.
 * Uso: node scripts/regenerate-drugs-json.mjs
 *
 * Lee del proyecto Supabase usando la anon key (pública).
 * No requiere autenticación adicional.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dirname, "..", "public", "drugs.json");

const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

async function fetchAll(table, params = {}) {
  // Paginación: Supabase devuelve max 1000 por defecto
  const all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${offset}-${offset + limit - 1}`,
        Prefer: "count=exact",
      },
    });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const chunk = await res.json();
    all.push(...chunk);
    if (chunk.length < limit) break;
    offset += limit;
  }
  return all;
}

console.log("Descargando categorías...");
const cats = await fetchAll("drug_categories", {
  select: "id,name,icon,sort_order",
  order: "sort_order.asc",
});
const catsById = Object.fromEntries(cats.map((c) => [c.id, c]));
console.log(`  ${cats.length} categorías`);

console.log("Descargando mapeos...");
const maps = await fetchAll("drug_category_map", {
  select: "drug_id,category_id,is_primary",
});
const primary = Object.fromEntries(
  maps.filter((m) => m.is_primary).map((m) => [m.drug_id, m.category_id])
);
console.log(`  ${maps.length} mapeos`);

console.log("Descargando fármacos...");
const drugs = await fetchAll("drugs", {
  select: "id,name,generic_name,description,mechanism_of_action,is_published",
  is_published: "eq.true",
  order: "name.asc",
});
console.log(`  ${drugs.length} fármacos`);

console.log("Descargando datos de infusión...");
const infusions = await fetchAll("drug_infusion", {
  select:
    "drug_id,label,dose_min,dose_max,dose_unit,standard_dilution_ml,ampule_amount,ampule_unit,ampule_volume_ml,ampule_presentation,sort_order",
  order: "sort_order.asc",
});
const infByDrug = {};
for (const i of infusions) {
  (infByDrug[i.drug_id] = infByDrug[i.drug_id] || []).push(i);
}
console.log(
  `  ${infusions.length} entries para ${Object.keys(infByDrug).length} fármacos`
);

const drugsOut = [];
for (const d of drugs) {
  const cat = catsById[primary[d.id]];
  if (!cat) continue;
  const out = {
    id: d.id,
    name: d.name,
    generic_name: d.generic_name || d.name,
    description: d.description || "",
    mechanism_of_action: d.mechanism_of_action || "",
    category: cat.name,
    category_icon: cat.icon || "💊",
    category_sort: cat.sort_order || 99,
  };
  const inf = infByDrug[d.id];
  if (inf) {
    out.infusion = inf.map((i) => ({
      label: i.label,
      dose_min: i.dose_min,
      dose_max: i.dose_max,
      dose_unit: i.dose_unit,
      standard_dilution_ml: i.standard_dilution_ml,
      ampule_amount: i.ampule_amount,
      ampule_unit: i.ampule_unit,
      ampule_volume_ml: i.ampule_volume_ml,
      ampule_presentation: i.ampule_presentation || "",
    }));
  }
  drugsOut.push(out);
}

const categoriesOut = cats
  .map((c) => ({
    name: c.name,
    icon: c.icon || "💊",
    sort_order: c.sort_order || 99,
    drug_count: drugsOut.filter((d) => d.category === c.name).length,
  }))
  .filter((c) => c.drug_count > 0);

const snapshot = {
  version: 16,
  last_updated: new Date().toISOString().split("T")[0],
  drug_count: drugsOut.length,
  category_count: categoriesOut.length,
  categories: categoriesOut,
  drugs: drugsOut,
};

writeFileSync(OUT_PATH, JSON.stringify(snapshot));
console.log(
  `\n✓ ${OUT_PATH}: ${drugsOut.length} fármacos en ${categoriesOut.length} categorías`
);
