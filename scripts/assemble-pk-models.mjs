#!/usr/bin/env node
/**
 * assemble-pk-models.mjs — Ensambla los modelos PK generados (pk-*.txt del
 * workflow) en un módulo TypeScript (pk-models-extended.ts) que exporta
 * EXTENDED_MODELS: DrugModel[]. Cada bloque MODEL → una entrada DrugModel.
 *
 * Uso: node scripts/assemble-pk-models.mjs <dir-con-pk-*.txt> <archivo-salida.ts>
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const [DIR, OUT] = process.argv.slice(2);
if (!DIR || !OUT) {
  console.error("Uso: node scripts/assemble-pk-models.mjs <dir> <out.ts>");
  process.exit(1);
}

// Nota clínica corta por id (subtítulo del selector).
function noteFor(id) {
  if (id.startsWith("propofol")) return "hipnótico IV";
  if (id.startsWith("remifentanil")) return "opioide ultracorto";
  if (/(dexmed|hannivoort|dyck|morse)/.test(id)) return "α2-agonista · sedación";
  if (/(ketamin|kamp)/.test(id)) return "disociativo";
  if (/(rocuron|kleijn)/.test(id)) return "BNM no despolarizante";
  return "modelo PK";
}

const files = readdirSync(DIR).filter((f) => /^pk-.*\.txt$/.test(f)).sort();
const models = [];

for (const f of files) {
  const txt = readFileSync(`${DIR}/${f}`, "utf8");
  // dividir en bloques MODEL...END
  const blocks = txt.split(/^=== MODEL /m).slice(1);
  for (const raw of blocks) {
    const header = raw.split("\n")[0]; // "id=X name=Y unit=Z peds=W ==="
    const m = header.match(/id=(\S+)\s+name=(.+?)\s+unit=(\S+)\s+peds=(\S+)/);
    if (!m) { console.warn(`  ⚠️ ${f}: header no parseado: ${header}`); continue; }
    const [, id, name, unit, pedsStr] = m;
    const peds = /true/i.test(pedsStr);

    const cit = (raw.match(/^CITATION:\s*(.+)$/m) || [])[1] || "";
    const refcp = (raw.match(/^REFCP:\s*(.+)$/m) || [])[1] || "";

    const bodyStart = raw.indexOf("MICRO_BODY:");
    const bodyEnd = raw.indexOf("=== END ===");
    if (bodyStart < 0 || bodyEnd < 0) { console.warn(`  ⚠️ ${f}/${id}: sin MICRO_BODY/END`); continue; }
    let body = raw.slice(bodyStart + "MICRO_BODY:".length, bodyEnd).trim();

    models.push({ id, name: name.trim(), unit: unit.trim(), peds, cit: cit.trim(), refcp: refcp.trim(), body });
    console.log(`  ✓ ${id} (${name.trim()})`);
  }
}

const entries = models.map((mo) => {
  return `  {
    id: ${JSON.stringify(mo.id)},
    name: ${JSON.stringify(mo.name)},
    note: ${JSON.stringify(noteFor(mo.id))},
    unit: ${JSON.stringify(mo.unit)} as "mcg" | "mg",
    citation: ${JSON.stringify(mo.cit)},
    refCp: ${JSON.stringify(mo.refcp)},
    peds: ${mo.peds},
    micro: (c: Cov): MicroParams => {
${mo.body.split("\n").map((l) => "      " + l).join("\n")}
    },
  }`;
}).join(",\n");

const out = `// @ts-nocheck
// ============================================================
// pk-models-extended.ts — AUTO-GENERADO por scripts/assemble-pk-models.mjs
// desde los modelos PK verificados del workflow. NO editar a mano;
// re-generar con: node scripts/assemble-pk-models.mjs <dir> <este archivo>
// Cada micro(c) devuelve V en L y CL/Q en L/min (contrato de Client.tsx).
// ============================================================
/* eslint-disable */
import type { Cov, MicroParams, DrugModel } from "./Client";

export const EXTENDED_MODELS: DrugModel[] = [
${entries},
];
`;

writeFileSync(OUT, out);
console.log(`\n✓ ${models.length} modelos → ${OUT}`);
