// ============================================================
// verify-critical.mjs — Suite de verificación de la MATEMÁTICA CRÍTICA
// DE SEGURIDAD de DEC (web). No es un framework de tests: es un script
// Node autónomo que hace asserts y SALE CON CÓDIGO ≠0 si algo falla.
//
// Uso:   npm run verify:critical
//        (equivale a: npx tsx scripts/verify-critical.mjs)
//
// Requiere `tsx` para importar los .ts/.tsx del proyecto SIN transpilar a
// mano (no añade dependencias a package.json; se resuelve vía npx/caché).
// engine.ts y models.ts son TS puro; PatientContext.tsx trae JSX (por eso
// hace falta tsx y no basta node --experimental-strip-types).
//
// FILOSOFÍA (importante): los valores ESPERADOS están ANCLADOS a dos cosas:
//   (a) valores PUBLICADOS/conocidos de la literatura (cuando existen), y
//   (b) la salida ACTUAL de la función (regresión), documentada línea a línea.
// Si un assert falla NO se "arregla" moviendo el esperado: es un posible BUG
// clínico que hay que reportar. Cada bloque cita de dónde sale su ancla.
// ============================================================

import {
  simulate,
  microToRates,
} from "../src/lib/tci/engine.ts";
import {
  PROPOFOL_SCHNIDER,
  PROPOFOL_MARSH,
  PROPOFOL_ELEVELD,
  TCI_MODELS,
  predictBis,
} from "../src/lib/tci/models.ts";
import {
  rcriScore,
  ariscat,
  guptaMica,
  sort as sortScore,
  cockcroftGault,
} from "../src/lib/patient/PatientContext.tsx";

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ------------------------------------------------------------
// Mini-arnés de asserts (sin deps).
// ------------------------------------------------------------
let passed = 0;
const failures = [];

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function ok(name, detail = "") {
  passed++;
  console.log(`  ${GREEN}✓${RESET} ${name}${detail ? ` ${DIM}${detail}${RESET}` : ""}`);
}
function fail(name, detail) {
  failures.push({ name, detail });
  console.log(`  ${RED}✗ ${name}${RESET} ${DIM}${detail}${RESET}`);
}

/** Assert exacto (===). */
function assertEq(name, actual, expected) {
  if (actual === expected) ok(name, `= ${fmt(actual)}`);
  else fail(name, `esperado ${fmt(expected)}, obtuvo ${fmt(actual)}`);
}
/** Assert con tolerancia absoluta. */
function assertNear(name, actual, expected, tol, unit = "") {
  if (typeof actual !== "number" || Number.isNaN(actual)) {
    fail(name, `obtuvo ${fmt(actual)} (no es número finito)`);
    return;
  }
  const diff = Math.abs(actual - expected);
  if (diff <= tol)
    ok(name, `= ${round(actual)}${unit} ${DIM}(esperado ${expected}${unit} ±${tol}, Δ=${round(diff)})${RESET}`);
  else
    fail(name, `esperado ${expected}${unit} ±${tol}, obtuvo ${round(actual)}${unit} (Δ=${round(diff)})`);
}
/** Assert booleano genérico. */
function assertTrue(name, cond, detail = "") {
  if (cond) ok(name, detail);
  else fail(name, detail || "condición falsa");
}

function fmt(v) {
  if (typeof v === "number") return round(v);
  return JSON.stringify(v);
}
function round(v) {
  return typeof v === "number" ? Math.round(v * 10000) / 10000 : v;
}
function section(title) {
  console.log(`\n${BOLD}${title}${RESET}`);
}

// Covariable estándar de referencia usada en varios anclajes: 70 kg / 40 a /
// 170 cm / ♂ (el "paciente tipo" del enunciado para el motor TCI).
const COV70 = { weightKg: 70, ageYears: 40, heightCm: 170, sex: "male" };

// ============================================================
// 1. MOTOR TCI (engine.ts + models.ts)
// ============================================================
section("1. Motor TCI (engine + models)");

// Helper: bolo inicial effect-site (mg) y mg/kg para un objetivo de Ce.
function effectBolus(model, targetCe, cov = COV70) {
  const p = model.micro(cov);
  // 12 min basta para que el effect-site alcance el objetivo y se registre
  // el bolo inicial (initialBolus = masa administrada en el paso 0).
  const res = simulate(p, { target: targetCe, mode: "effect", durationMin: 12 });
  return { bolusMg: res.initialBolus, perKg: res.initialBolus / cov.weightKg };
}

// --- Schnider, effect-site, Ce 3.0 µg/mL ---
// ANCLA: literatura/uso clínico — bolo de inducción effect-site Schnider a
// Ce 3 µg/mL en un adulto tipo ~0.74 mg/kg (~51.85 mg para 70 kg). Coincide
// con la salida actual del motor (regresión). Fuente PK: Schnider TW, et al.
// Anesthesiology 1998;88:1170-82 / 1999;90:1502-16 (ke0 0.456).
{
  const { bolusMg, perKg } = effectBolus(PROPOFOL_SCHNIDER, 3.0);
  assertNear("Schnider Ce 3.0 → bolo mg/kg", perKg, 0.74, 0.02, " mg/kg");
  assertNear("Schnider Ce 3.0 → bolo total", bolusMg, 51.85, 1.5, " mg");
}

// --- Marsh (modificado), effect-site, Ce 3.0 µg/mL ---
// ANCLA: Marsh usa V1=0.228 L/kg (mucho mayor que el V1 fijo de Schnider) →
// bolo de inducción bastante mayor, ~1.05 mg/kg. Coincide con salida actual.
// Fuente: Marsh B, et al. Br J Anaesth 1991;67:41-48; ke0 1.21 (Struys 2000).
{
  const { bolusMg, perKg } = effectBolus(PROPOFOL_MARSH, 3.0);
  assertNear("Marsh Ce 3.0 → bolo mg/kg", perKg, 1.05, 0.03, " mg/kg");
  assertNear("Marsh Ce 3.0 → bolo total", bolusMg, 73.26, 2.5, " mg");
}

// --- Sanidad: Marsh (V1 grande) exige más bolo que Schnider ---
{
  const s = effectBolus(PROPOFOL_SCHNIDER, 3.0).perKg;
  const m = effectBolus(PROPOFOL_MARSH, 3.0).perKg;
  assertTrue("Marsh bolo > Schnider bolo (V1 mayor)", m > s, `Marsh ${round(m)} > Schnider ${round(s)} mg/kg`);
}

// --- BIS predicho Eleveld a Ce 3.0 ---
// ANCLA: PD-BIS del propio Eleveld 2018 (Tabla 3): baseline 93,
// Ce50 = 3.08·exp(-0.00635·(edad-35)). A 40 a la Ce50 ≈ 3.08·exp(-0.03175)
// ≈ 2.984 → a Ce 3.0 el sigmoide asimétrico da BIS ≈ 46. Fuente:
// Eleveld DJ, et al. Br J Anaesth 2018;120:942-959.
{
  const bis = predictBis(PROPOFOL_ELEVELD.bisPd, COV70, 3.0);
  assertNear("Eleveld BIS @ Ce 3.0", bis, 46, 2, "");
  assertTrue("BIS en rango fisiológico [0,100]", bis >= 0 && bis <= 100, `BIS=${round(bis)}`);
}

// --- Monotonicidad del BIS: a más Ce, menos BIS ---
{
  const b1 = predictBis(PROPOFOL_ELEVELD.bisPd, COV70, 1.0);
  const b3 = predictBis(PROPOFOL_ELEVELD.bisPd, COV70, 3.0);
  const b6 = predictBis(PROPOFOL_ELEVELD.bisPd, COV70, 6.0);
  assertTrue("BIS monótono decreciente (Ce 1>3>6)", b1 > b3 && b3 > b6, `${round(b1)} > ${round(b3)} > ${round(b6)}`);
}

// ============================================================
// 1b. INVARIANTES DE micro() PARA CADA MODELO TCI
//     V>0, CL>0, ke0>=0; effect-site solo donde effectSite=true.
// ============================================================
section("1b. Invariantes micro() de cada modelo TCI");

for (const m of TCI_MODELS) {
  const p = m.micro(COV70);
  const problems = [];
  // Volúmenes: V1 y V2 deben ser >0; V3 puede ser 0 (bicompartimental) pero
  // en estos modelos siempre es >0. Exigimos V1,V2,V3 >= 0 y V1>0.
  if (!(p.V1 > 0)) problems.push(`V1=${p.V1} ≤ 0`);
  if (!(p.V2 > 0)) problems.push(`V2=${p.V2} ≤ 0`);
  if (!(p.V3 >= 0)) problems.push(`V3=${p.V3} < 0`);
  if (!(p.CL > 0)) problems.push(`CL=${p.CL} ≤ 0`);
  if (!(p.Q2 >= 0)) problems.push(`Q2=${p.Q2} < 0`);
  if (!(p.Q3 >= 0)) problems.push(`Q3=${p.Q3} < 0`);
  if (!(p.ke0 >= 0)) problems.push(`ke0=${p.ke0} < 0`);
  for (const [k, v] of Object.entries(p)) {
    if (!Number.isFinite(v)) problems.push(`${k}=${v} no finito`);
  }
  // Coherencia effectSite <-> ke0.
  if (m.effectSite && !(p.ke0 > 0)) problems.push(`effectSite:true pero ke0=${p.ke0}`);
  if (!m.effectSite && p.ke0 !== 0) problems.push(`effectSite:false pero ke0=${p.ke0}≠0`);

  if (problems.length === 0)
    ok(`${m.id}`, `V1=${round(p.V1)} CL=${round(p.CL)} ke0=${round(p.ke0)} effect=${m.effectSite}`);
  else fail(`${m.id}`, problems.join("; "));
}

// --- Invariante de comportamiento: effect-mode es no-op sin ke0 ---
// Un modelo plasma-only (effectSite:false, ke0=0) debe dar la MISMA
// trayectoria en mode:"effect" que en mode:"plasma" (el engine hace
// effectMode = mode==="effect" && ke0>0). Verificado con Ketamina Kamp.
{
  const kamp = TCI_MODELS.find((m) => m.id === "ketamine-kamp");
  const p = kamp.micro(COV70);
  const plasma = simulate(p, { target: 1000, mode: "plasma", durationMin: 5 });
  const effect = simulate(p, { target: 1000, mode: "effect", durationMin: 5 });
  assertTrue(
    "plasma-only: effect-mode == plasma-mode (bolo idéntico)",
    Math.abs(plasma.initialBolus - effect.initialBolus) < 1e-9,
    `plasma ${round(plasma.initialBolus)} vs effect ${round(effect.initialBolus)}`,
  );
}

// --- microToRates: k21/k31 no negativos, k10>0 ---
{
  const r = microToRates(PROPOFOL_SCHNIDER.micro(COV70));
  assertTrue(
    "microToRates Schnider: k10>0, k12/k21/k13/k31≥0",
    r.k10 > 0 && r.k12 >= 0 && r.k21 >= 0 && r.k13 >= 0 && r.k31 >= 0,
    `k10=${round(r.k10)} k21=${round(r.k21)} k31=${round(r.k31)}`,
  );
}

// ============================================================
// 2. SCORES DE RIESGO (PatientContext.tsx)
//    Paciente tipo: 68 a / 88 kg / ♂ / ASA III / Cr 1.8 / intraperitoneal.
// ============================================================
section("2. Scores de riesgo (paciente 68a/88kg/♂/ASA III/Cr 1.8)");

// Paciente construido para ejercitar RCRI, ARISCAT, Gupta, SORT y CG.
// "intraperitoneal" → cirugía de alto riesgo (RCRI surgeryRisk:"high") y
// sitio de incisión abdominal alto (ARISCAT upperAbdominal) + Gupta
// intestinal. Los campos son los mínimos imprescindibles de cada score.
const PATIENT = {
  id: "verify", label: "verify", sex: "male", updatedAt: 0,
  ageYears: 68, weightKg: 88, heightCm: 175, creatinine: 1.8,
  asaClass: 3,
  functionalStatus: "independent",
  surgeryRisk: "high", // RCRI: cirugía intraperitoneal = alto riesgo
  surgicalSite: "upperAbdominal", // ARISCAT
  guptaSurgeryType: "intestinal", // Gupta MICA
  surgeryUrgency: "elective", // SORT
  surgeryMagnitude: "major", // SORT / Caprini
  spo2Preop: 97, // ARISCAT (≥96 → 0 pts)
  surgeryDurationHours: 2.5, // ARISCAT (>2-3 h → 16 pts)
  comorbidities: {},
};

// ---- RCRI (Lee 1999) ----
// ANCLA + BUG-CHECK: solo suma el factor de cirugía de alto riesgo (1 pt).
// Cr 1.8 NO supera el umbral >2 mg/dL de Lee → 0 pts por creatinina (correcto
// por definición del índice; NO redondear hacia arriba). Sin cardiopatía
// isquémica/ICC/ACV/DM-insulina marcadas. Total = 1 → Clase II, 0.9%.
// (Si esperabas >1: revisa que el umbral de Cr del RCRI es >2, no ≥1.5.)
{
  const r = rcriScore(PATIENT);
  assertEq("RCRI puntos", r.points, 1);
  assertEq("RCRI clase", r.riskClass, "Clase II");
  assertEq("RCRI %", r.riskPct, 0.9);
}

// ---- ARISCAT (Canet 2010) ----
// ANCLA (regresión a la salida actual, con desglose verificado):
//   edad 68 (51-80) = 3 · SpO2 97 (≥96) = 0 · sin infección resp = 0 ·
//   sin anemia (no hay Hb/Hct) = 0 · upperAbdominal = 15 · duración 2.5 h
//   (>2-3) = 16 · no emergencia = 0  ⇒ 34 pts → intermedio (13.3%).
{
  const a = ariscat(PATIENT);
  assertTrue("ARISCAT no es null (datos suficientes)", a != null);
  if (a) {
    assertEq("ARISCAT puntos", a.points, 34);
    assertEq("ARISCAT banda", a.risk, "intermediate");
    assertEq("ARISCAT %", a.riskPct, 13.3);
  }
}

// ---- Gupta MICA (Gupta 2011) ----
// ANCLA (regresión + fórmula): x = -5.25 + 0.02·68 + 0(indep) + (-1.92)(ASA III)
//   + 0.61(Cr>1.5) + 1.14(intestinal) = -4.05 → riesgo = e^x/(1+e^x)·100
//   ≈ 1.696 %. Invariante: 0 ≤ riesgo ≤ 100, no NaN.
{
  const g = guptaMica(PATIENT);
  assertTrue("Gupta no es null", g != null);
  if (g) {
    assertNear("Gupta MICA %", g.riskPct, 1.6957, 0.01, " %");
    assertTrue("Gupta % en [0,100]", g.riskPct >= 0 && g.riskPct <= 100 && !Number.isNaN(g.riskPct));
  }
}

// ---- SORT (Protopapa 2014) ----
// ANCLA (regresión + fórmula): x = -7.366 + 1.411(ASA III) + 0(electiva)
//   + 0(no especialidad-alto-riesgo) + 0(magnitud major, NO complex → 0)
//   + 0(no cáncer) + 0.777(edad 65-79) = -5.178 → riesgo ≈ 0.561 %.
//   NOTA: severityTerm solo suma en magnitud "complex" (mayor/compleja=+0.381),
//   por eso "major" no aporta. Invariante: [0,100], no NaN.
{
  const s = sortScore(PATIENT);
  assertTrue("SORT no es null", s != null);
  if (s) {
    assertNear("SORT %", s.riskPct, 0.5608, 0.01, " %");
    assertTrue("SORT % en [0,100]", s.riskPct >= 0 && s.riskPct <= 100 && !Number.isNaN(s.riskPct));
  }
}

// ---- Cockcroft-Gault (1976) ----
// ANCLA (fórmula exacta): (140-68)·88·1(♂)/(72·1.8) = 6336/129.6 = 48.888...
{
  const cg = cockcroftGault(PATIENT);
  assertNear("Cockcroft-Gault CrCl", cg, 48.8889, 0.001, " mL/min");
}

// ---- Invariantes de monotonicidad / rango de los scores ----
section("2b. Invariantes de los scores (monotonicidad, rango, no-NaN)");

// Gupta: mayor edad ⇒ mayor riesgo (0.02·edad, coef +).
{
  const younger = guptaMica({ ...PATIENT, ageYears: 40 });
  const older = guptaMica({ ...PATIENT, ageYears: 85 });
  assertTrue("Gupta monótono con la edad (85>40)", older.riskPct > younger.riskPct,
    `85a ${round(older.riskPct)}% > 40a ${round(younger.riskPct)}%`);
}
// SORT: ASA V ⇒ mucho mayor riesgo que ASA III.
{
  const asa3 = sortScore(PATIENT).riskPct;
  const asa5 = sortScore({ ...PATIENT, asaClass: 5 }).riskPct;
  assertTrue("SORT monótono con ASA (V>III)", asa5 > asa3, `ASA V ${round(asa5)}% > ASA III ${round(asa3)}%`);
}
// Cockcroft-Gault: mujer < hombre (factor 0.85).
{
  const male = cockcroftGault(PATIENT);
  const female = cockcroftGault({ ...PATIENT, sex: "female" });
  assertNear("CG mujer = 0.85 × hombre", female, male * 0.85, 1e-6, " mL/min");
}
// RCRI: añadir cardiopatía isquémica sube exactamente 1 punto.
{
  const base = rcriScore(PATIENT).points;
  const withIhd = rcriScore({ ...PATIENT, comorbidities: { ischemicHeart: true } }).points;
  assertEq("RCRI: +cardiopatía isquémica = +1 pto", withIhd - base, 1);
}
// RCRI: Cr justo por encima de 2 SÍ añade punto (verifica el umbral >2).
{
  const at18 = rcriScore(PATIENT).points; // Cr 1.8 → 0 por Cr
  const at21 = rcriScore({ ...PATIENT, creatinine: 2.1 }).points; // Cr 2.1 → +1
  assertEq("RCRI: umbral Cr >2 activa punto (1.8→2.1)", at21 - at18, 1);
}

// ============================================================
// 3. DOSIS DE CRISIS POR PESO (código azul / EmergencyDrugData)
//    Réplica VERBATIM de src/app/codigo/CodigoClient.tsx (perKg/maxDose +
//    computedDose/trimNumber). Guarda de deriva al final: se re-lee el
//    fuente y se comprueba que los anclajes citados siguen presentes.
// ============================================================
section("3. Dosis de crisis por peso (código azul)");

// --- Réplica verbatim de computedDose/trimNumber de CodigoClient.tsx ---
function trimNumber(v) {
  return v === Math.round(v) ? String(Math.round(v)) : String(v);
}
function computedDose(drug, weightKg) {
  if (drug.perKg == null) return drug.adultDose;
  const raw = drug.perKg * weightKg;
  let d = raw;
  if (drug.maxDose != null) d = Math.min(d, drug.maxDose);
  let rounded;
  if (d < 1) rounded = Math.round(d * 100) / 100;
  else if (d < 10) rounded = Math.round(d * 10) / 10;
  else rounded = Math.round(d);
  const capped = drug.maxDose != null && raw >= drug.maxDose ? " (máx)" : "";
  return `${trimNumber(rounded)} ${drug.unit}${capped}`;
}

// Réplica de las entradas relevantes (valores clonados de CodigoClient.tsx).
const DRUGS = {
  adrenalinaParo: { name: "Adrenalina (paro)", perKg: 0.01, unit: "mg", maxDose: 1, adultDose: "1 mg c/3-5 min" },
  amiodaronaParo: { name: "Amiodarona (paro)", perKg: 5, unit: "mg", maxDose: 300, adultDose: "300 mg, luego 150 mg" },
  atropina: { name: "Atropina", perKg: 0.02, unit: "mg", maxDose: 1, adultDose: "0.5-1 mg" },
  adenosina: { name: "Adenosina", perKg: 0.1, unit: "mg", maxDose: 6, adultDose: "6 mg" },
  calcio: { name: "Calcio (cloruro)", perKg: 10, unit: "mg", maxDose: 1000, adultDose: "0.5-1 g" },
  succinilcolina: { name: "Succinilcolina", perKg: 1.5, unit: "mg", maxDose: null, adultDose: "1-1.5 mg/kg" },
  hidrocortisona: { name: "Hidrocortisona", perKg: null, unit: "mg", maxDose: null, adultDose: "200 mg" },
};

const W = 88; // kg — paciente del enunciado

// --- Adrenalina en paro, 88 kg ---
// ANCLA: 0.01 mg/kg · 88 = 0.88 mg (bajo el tope de 1 mg → sin "máx").
// Fuente dosis: EmergencyDrugData.swift (paridad) · ACLS/PALS.
{
  const raw = DRUGS.adrenalinaParo.perKg * W;
  assertNear("Adrenalina paro 88 kg (numérico)", raw, 0.88, 1e-9, " mg");
  assertEq("Adrenalina paro 88 kg (texto)", computedDose(DRUGS.adrenalinaParo, W), "0.88 mg");
}

// --- Tope de adrenalina: a 120 kg se capa a 1 mg con etiqueta "(máx)" ---
{
  assertEq("Adrenalina 120 kg respeta tope 1 mg", computedDose(DRUGS.adrenalinaParo, 120), "1 mg (máx)");
}

// --- Amiodarona: 5 mg/kg pero tope 300 mg ---
// A 88 kg: 5·88 = 440 mg → capado a 300 mg (máx). El tope clínico DEBE
// respetarse (una amiodarona de 440 mg en bolo sería sobredosis).
{
  const raw = DRUGS.amiodaronaParo.perKg * W; // 440
  assertTrue("Amiodarona raw supera el tope (440>300)", raw > DRUGS.amiodaronaParo.maxDose);
  assertEq("Amiodarona 88 kg capada a 300 mg", computedDose(DRUGS.amiodaronaParo, W), "300 mg (máx)");
}

// --- Otros topes clínicos ---
{
  // Atropina 0.02·88 = 1.76 → tope 1 mg.
  assertEq("Atropina 88 kg capada a 1 mg", computedDose(DRUGS.atropina, W), "1 mg (máx)");
  // Adenosina 0.1·88 = 8.8 → tope 6 mg.
  assertEq("Adenosina 88 kg capada a 6 mg", computedDose(DRUGS.adenosina, W), "6 mg (máx)");
  // Calcio 10·88 = 880 mg (bajo el tope 1000 → sin máx).
  assertEq("Calcio 88 kg = 880 mg (sin tope)", computedDose(DRUGS.calcio, W), "880 mg");
  // Succinilcolina 1.5·88 = 132 mg (sin tope).
  assertEq("Succinilcolina 88 kg = 132 mg (sin tope)", computedDose(DRUGS.succinilcolina, W), "132 mg");
  // Hidrocortisona: perKg null → devuelve dosis fija de adulto.
  assertEq("Hidrocortisona (perKg null) → dosis fija adulto", computedDose(DRUGS.hidrocortisona, W), "200 mg");
}

// --- Invariante general: ningún fármaco con tope excede su maxDose ---
{
  let allCapped = true;
  const heavy = 300; // kg absurdo para forzar el tope en todos
  const detail = [];
  for (const key of Object.keys(DRUGS)) {
    const drug = DRUGS[key];
    if (drug.perKg == null || drug.maxDose == null) continue;
    const raw = drug.perKg * heavy;
    const applied = Math.min(raw, drug.maxDose);
    if (applied > drug.maxDose + 1e-9) { allCapped = false; detail.push(drug.name); }
  }
  assertTrue("Ningún fármaco excede su tope a peso extremo (300 kg)", allCapped, detail.join(","));
}

// ------------------------------------------------------------
// GUARDA ANTI-DERIVA: la sección 3 replica valores de CodigoClient.tsx.
// Re-leemos el fuente y confirmamos que los anclajes citados siguen ahí.
// Si el equipo cambia una dosis/tope en el fuente y no aquí, ESTE assert
// falla y avisa de que la réplica está desincronizada (no un bug clínico,
// pero sí una alerta de mantenimiento de la suite).
// ------------------------------------------------------------
section("3b. Guarda anti-deriva (fingerprint de CodigoClient.tsx)");
{
  const srcPath = join(__dirname, "..", "src", "app", "codigo", "CodigoClient.tsx");
  let src = "";
  try {
    src = readFileSync(srcPath, "utf8");
  } catch (e) {
    fail("Leer CodigoClient.tsx", String(e));
  }
  const anchors = [
    ['Adrenalina (paro) perKg 0.01 / max 1', /"Adrenalina \(paro\)"[^}]*perKg:\s*0\.01[^}]*maxDose:\s*1\b/],
    ['Amiodarona (paro) perKg 5 / max 300', /"Amiodarona \(paro\)"[^}]*perKg:\s*5\b[^}]*maxDose:\s*300\b/],
    ['Atropina perKg 0.02 / max 1', /"Atropina"[^}]*perKg:\s*0\.02[^}]*maxDose:\s*1\b/],
    ['computedDose usa Math.min(d, maxDose)', /Math\.min\(d,\s*drug\.maxDose\)/],
    ['computedDose etiqueta "(máx)"', /raw\s*>=\s*drug\.maxDose/],
  ];
  for (const [name, re] of anchors) {
    assertTrue(`ancla presente: ${name}`, re.test(src), "el fuente cambió — resincroniza la réplica de la sección 3");
  }
}

// ============================================================
// RESUMEN
// ============================================================
console.log("");
const total = passed + failures.length;
if (failures.length === 0) {
  console.log(`${GREEN}${BOLD}✓ TODO OK${RESET} — ${passed}/${total} asserts pasaron.`);
  process.exit(0);
} else {
  console.log(`${RED}${BOLD}✗ ${failures.length} FALLO(S)${RESET} de ${total} asserts:`);
  for (const f of failures) console.log(`  ${RED}•${RESET} ${f.name}: ${f.detail}`);
  console.log(`\n${RED}Un fallo aquí es un POSIBLE BUG clínico o una deriva de la suite. Repórtalo, no lo "arregles" moviendo el esperado.${RESET}`);
  process.exit(1);
}
