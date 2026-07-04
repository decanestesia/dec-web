#!/usr/bin/env node
/**
 * insert-staged-drugs.mjs — Inserta fármacos NUEVOS en Supabase con is_published=false.
 *
 * Lee los JSON generados (scratchpad/gen-batch-*.json), cada uno un array de
 * objetos-fármaco con detalle completo, y los inserta STAGED (no visibles en la
 * app hasta que el usuario los publique). Dedup contra los fármacos existentes.
 *
 * Uso:  node scripts/insert-staged-drugs.mjs <dir-con-los-json>
 * // datos generados por IA — staged para revisión humana antes de publicar
 */
import { readFileSync, readdirSync } from "node:fs";

const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
const KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

const DIR = process.argv[2];
if (!DIR) {
  console.error("Uso: node scripts/insert-staged-drugs.mjs <dir-con-gen-batch-*.json>");
  process.exit(1);
}

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function sb(method, path, body, prefer) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: prefer ? { ...H, Prefer: prefer } : H,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const txt = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${txt.slice(0, 300)}`);
  return txt ? JSON.parse(txt) : null;
}

// 1) categorías name→id  y  2) nombres existentes (dedup)
const cats = await sb("GET", "drug_categories?select=id,name");
const catId = Object.fromEntries(cats.map((c) => [c.name.toLowerCase().trim(), c.id]));
const existing = await sb("GET", "drugs?select=name&limit=2000");
const existingNames = new Set(existing.map((d) => d.name.toLowerCase().trim()));

// 3) leer los lotes
const files = readdirSync(DIR).filter((f) => /^gen4-batch-\d+\.json$/.test(f)).sort();
const drugs = [];
for (const f of files) {
  try {
    const arr = JSON.parse(readFileSync(`${DIR}/${f}`, "utf8"));
    if (Array.isArray(arr)) drugs.push(...arr);
    else console.warn(`⚠️  ${f} no es un array; omitido`);
  } catch (e) {
    console.warn(`⚠️  ${f} JSON inválido: ${e.message}`);
  }
}
console.log(`Leídos ${drugs.length} fármacos de ${files.length} lotes.\n`);

const withDrug = (rows, id) => (rows || []).map((r) => ({ ...r, drug_id: id }));

let inserted = 0, skipped = 0, failed = 0;
for (const d of drugs) {
  const key = (d.name || "").toLowerCase().trim();
  if (!key) { failed++; continue; }
  if (existingNames.has(key)) { console.log(`⏭️  ya existe: ${d.name}`); skipped++; continue; }
  const cid = catId[(d.category || "").toLowerCase().trim()];
  if (!cid) { console.log(`⚠️  categoría no encontrada "${d.category}" (${d.name}) — omitido`); failed++; continue; }

  try {
    const [drug] = await sb("POST", "drugs", {
      name: d.name,
      generic_name: d.generic_name ?? d.name,
      description: d.description ?? "",
      mechanism_of_action: d.mechanism_of_action ?? "",
      is_published: false, // STAGED
    }, "return=representation");
    const id = drug.id;
    existingNames.add(key);

    await sb("POST", "drug_category_map", { drug_id: id, category_id: cid, is_primary: true });

    const arr = async (table, rows) => {
      const withId = withDrug(rows, id);
      if (withId.length) await sb("POST", table, withId);
    };
    await arr("drug_pharmacology", d.pharmacology);
    await arr("drug_dosing", d.dosing);
    await arr("drug_adverse_effects", d.adverse_effects);
    await arr("drug_warnings", d.warnings);
    await arr("drug_brand_names", d.brands);
    await arr("drug_presentations", d.presentations);
    if (d.pregnancy) await sb("POST", "drug_pregnancy", { ...d.pregnancy, drug_id: id });
    if (d.molecular) await sb("POST", "drug_molecular", { ...d.molecular, drug_id: id });
    if (d.administration) await sb("POST", "drug_administration", { ...d.administration, drug_id: id });

    inserted++;
    console.log(`✓ ${d.name}  [${d.category}]`);
  } catch (e) {
    failed++;
    console.log(`✗ ${d.name}: ${e.message}`);
  }
}

console.log(`\n── Insertados: ${inserted} · omitidos (ya existían): ${skipped} · fallidos: ${failed}`);
console.log("Todos con is_published=false (staged). Revisa y publica desde Supabase cuando estés conforme.");
