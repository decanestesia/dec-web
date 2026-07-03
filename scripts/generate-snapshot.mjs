#!/usr/bin/env node
/**
 * generate-snapshot.mjs — Snapshot offline-first COMPLETO de DEC.
 *
 * Descarga TODA la base clínica de Supabase (catálogo + todo el detalle) y
 * produce un único archivo autosuficiente que sirve a las dos plataformas:
 *
 *   - public/drugs-full.json   → fallback SSR web (Supabase caído/pausado)
 *                                 y fuente para el bundle iOS (offline-first).
 *   - backups/backup-latest.json + backup-YYYYMMDD.json  → el snapshot ES el backup.
 *
 * El objeto raíz es un DrugCatalog válido (mismos campos que public/drugs.json)
 * MÁS un mapa `detail` con las filas crudas de cada tabla de detalle, agrupadas
 * por drug_id. Esas filas crudas las decodifican igual el `DrugDetail` de web
 * (src/lib/drugs.ts) y el `DrugDetailBundle` de iOS (DrugDatabase.swift).
 *
 * Uso:  node scripts/generate-snapshot.mjs
 *
 * // el snapshot es el contrato de que un quirófano sin señal no es un quirófano sin datos
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC_OUT = join(ROOT, "public", "drugs-full.json");
const BACKUP_DIR = join(ROOT, "backups");

const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
// anon key pública (RLS protege): la misma que usa el cliente web/iOS.
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

// ── Descarga paginada de una tabla completa (Range de 1000 en 1000) ──────────
async function fetchAll(table, params = {}) {
  const all = [];
  let offset = 0;
  const limit = 1000;
  for (;;) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${offset}-${offset + limit - 1}`,
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

// Agrupa filas por drug_id, opcionalmente quitando `drug_id` del objeto emitido.
function groupBy(rows, key = "drug_id", { strip = true } = {}) {
  const out = {};
  for (const r of rows) {
    const k = r[key];
    if (k == null) continue;
    let val = r;
    if (strip) {
      val = { ...r };
      delete val[key];
    }
    (out[k] = out[k] || []).push(val);
  }
  return out;
}

const t0 = Date.now();
console.log("DEC · generando snapshot completo…\n");

// ── Metadata (versión canónica del catálogo) ─────────────────────────────────
const [meta] = await fetchAll("catalog_metadata", { select: "version,last_updated,drug_count", id: "eq.1" });
if (!meta) throw new Error("catalog_metadata id=1 no encontrado");
console.log(`  meta        v${meta.version} · ${meta.last_updated} · ${meta.drug_count} fármacos declarados`);

// ── Base ─────────────────────────────────────────────────────────────────────
const cats = await fetchAll("drug_categories", { select: "id,name,icon,sort_order", order: "sort_order.asc" });
const catsById = Object.fromEntries(cats.map((c) => [c.id, c]));
console.log(`  categorías  ${cats.length}`);

const maps = await fetchAll("drug_category_map", { select: "drug_id,category_id,is_primary" });
const primaryCat = {};
for (const m of maps) if (m.is_primary && primaryCat[m.drug_id] == null) primaryCat[m.drug_id] = m.category_id;

const drugs = await fetchAll("drugs", {
  select: "id,name,generic_name,description,mechanism_of_action,is_published",
  is_published: "eq.true",
  order: "name.asc",
});
console.log(`  fármacos    ${drugs.length} publicados`);

const infusions = await fetchAll("drug_infusion", {
  select:
    "drug_id,label,dose_min,dose_max,dose_unit,standard_dilution_ml,ampule_amount,ampule_unit,ampule_volume_ml,ampule_presentation,sort_order",
  order: "sort_order.asc",
});
const infByDrug = groupBy(infusions);

// ── Detalle (todas las tablas, en bloque) ────────────────────────────────────
console.log("  detalle…");
const [
  pharmacology,
  adverse,
  warnings,
  pregnancy,
  brands,
  molecular,
  interactions,
  dosing,
  presentations,
  administration,
] = await Promise.all([
  fetchAll("drug_pharmacology", { select: "drug_id,property,value,details,sort_order", order: "sort_order.asc" }),
  fetchAll("drug_adverse_effects", { select: "drug_id,effect,frequency,severity,organ_system,is_black_box" }),
  fetchAll("drug_warnings", { select: "drug_id,type,description,is_contraindication,is_black_box" }),
  fetchAll("drug_pregnancy", { select: "drug_id,fda_old_category,fda_narrative,lactation_safe,lactation_notes" }),
  fetchAll("drug_brand_names", { select: "drug_id,brand_name,manufacturer,country,is_available" }),
  fetchAll("drug_molecular", {
    select: "drug_id,formula,molecular_weight,smiles,inchi,inchi_key,logp,pka,pka_type,solubility,protein_binding",
  }),
  fetchAll("drug_interactions", {
    select: "drug_id,interacts_with_id,interacts_with_name,severity,mechanism,clinical_effect,management",
  }),
  fetchAll("drug_dosing", {
    select:
      "drug_id,population,indication,route,dose_min,dose_max,dose_unit,frequency,max_daily_dose,max_daily_unit,notes,sort_order",
    order: "sort_order.asc",
  }),
  fetchAll("drug_presentations", {
    select: "drug_id,form,strength,strength_value,strength_unit,volume,volume_ml,route,packaging",
    order: "route.asc",
  }),
  fetchAll("drug_administration", {
    select:
      "drug_id,route,instructions,reconstitution,dilution,compatibility,incompatibility,stability,max_rate,rate_unit,filter_required,light_sensitive,notes",
  }),
]);

// interactions conserva drug_id (el DrugInteraction de web lo incluye).
const pharmBy = groupBy(pharmacology);
const aeBy = groupBy(adverse);
const warnBy = groupBy(warnings);
const pregBy = groupBy(pregnancy);
const brandsBy = groupBy(brands);
const molBy = groupBy(molecular);
const interBy = groupBy(interactions, "drug_id", { strip: false });
const dosingBy = groupBy(dosing);
const presBy = groupBy(presentations);
const admBy = groupBy(administration);

console.log(
  `    pk:${pharmacology.length} ae:${adverse.length} warn:${warnings.length} preg:${pregnancy.length} ` +
    `brands:${brands.length} mol:${molecular.length} inter:${interactions.length} dosing:${dosing.length} ` +
    `pres:${presentations.length} adm:${administration.length}`
);

// ── Ensamblado ───────────────────────────────────────────────────────────────
const drugsOut = [];
const detail = {};
let skipped = 0;

for (const d of drugs) {
  const cat = catsById[primaryCat[d.id]];
  if (!cat) {
    skipped++;
    continue;
  }
  const inf = (infByDrug[d.id] || []).map((i) => ({
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

  const drugOut = {
    id: d.id,
    name: d.name,
    generic_name: d.generic_name || d.name,
    description: d.description || "",
    mechanism_of_action: d.mechanism_of_action || "",
    category: cat.name,
    category_icon: cat.icon || "💊",
    category_sort: cat.sort_order || 99,
  };
  if (inf.length) drugOut.infusion = inf;
  drugsOut.push(drugOut);

  // Detalle: forma idéntica al DrugDetail de web y al DrugDetailBundle de iOS.
  detail[d.id] = {
    pharmacology: pharmBy[d.id] || [],
    adverse_effects: aeBy[d.id] || [],
    warnings: warnBy[d.id] || [],
    pregnancy: (pregBy[d.id] || [])[0] ?? null,
    brands: brandsBy[d.id] || [],
    molecular: (molBy[d.id] || [])[0] ?? null,
    interactions: interBy[d.id] || [],
    dosing: dosingBy[d.id] || [],
    presentations: presBy[d.id] || [],
    administration: (admBy[d.id] || [])[0] ?? null,
  };
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
  version: meta.version,
  last_updated: meta.last_updated,
  generated_at: new Date().toISOString(),
  drug_count: drugsOut.length,
  category_count: categoriesOut.length,
  categories: categoriesOut,
  drugs: drugsOut,
  detail,
};

// ── Escritura: /public (deployado) + backups (gitignored) ────────────────────
const json = JSON.stringify(snapshot);
const bytes = Buffer.byteLength(json);
const mb = (bytes / 1024 / 1024).toFixed(2);

writeFileSync(PUBLIC_OUT, json);

mkdirSync(BACKUP_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
writeFileSync(join(BACKUP_DIR, "backup-latest.json"), json);
writeFileSync(join(BACKUP_DIR, `backup-${stamp}.json`), json);

if (skipped) console.log(`  ⚠️  ${skipped} fármacos sin categoría primaria (omitidos del catálogo)`);
console.log(
  `\n✓ snapshot v${snapshot.version}: ${snapshot.drug_count} fármacos · ` +
    `${snapshot.category_count} categorías · ${Object.keys(detail).length} con detalle · ${mb} MB`
);
console.log(`  → public/drugs-full.json`);
console.log(`  → backups/backup-latest.json + backup-${stamp}.json`);
console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
