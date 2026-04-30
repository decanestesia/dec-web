// ============================================================
// DEC drugs data layer — hybrid (snapshot + Supabase fetch)
// v16.3 — añade datos de interacciones farmacológicas
// ============================================================

// ---------- Snapshot types (drugs.json, ~240 KB) ----------

export interface DrugInfusionEntry {
  label: string;
  dose_min: number;
  dose_max: number;
  dose_unit: string;
  standard_dilution_ml: number | null;
  ampule_amount: number | null;
  ampule_unit: string | null;
  ampule_volume_ml: number | null;
  ampule_presentation: string;
}

export interface Drug {
  id: string;
  name: string;
  generic_name: string;
  description: string;
  mechanism_of_action: string;
  category: string;
  category_icon: string;
  category_sort: number;
  infusion?: DrugInfusionEntry[];
}

export interface CategorySummary {
  name: string;
  icon: string;
  sort_order: number;
  drug_count: number;
}

export interface DrugCatalog {
  version: number;
  last_updated: string;
  drug_count: number;
  category_count: number;
  categories: CategorySummary[];
  drugs: Drug[];
}

// ---------- Slug & search helpers ----------

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function findDrugBySlug(drugs: Drug[], slug: string): Drug | undefined {
  return drugs.find((d) => slugify(d.name) === slug);
}

export function searchDrugs(drugs: Drug[], query: string): Drug[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const norm = (s: string) =>
    s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const nq = norm(q);
  return drugs.filter(
    (d) =>
      norm(d.name).includes(nq) ||
      norm(d.generic_name).includes(nq) ||
      norm(d.description).includes(nq) ||
      norm(d.category).includes(nq)
  );
}

export function getDrugsInCategory(drugs: Drug[], category: string): Drug[] {
  return drugs
    .filter((d) => d.category === category)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getCategories(drugs: Drug[]): string[] {
  const seen = new Set<string>();
  const ordered: { name: string; sort: number }[] = [];
  for (const d of drugs) {
    if (!seen.has(d.category)) {
      seen.add(d.category);
      ordered.push({ name: d.category, sort: d.category_sort });
    }
  }
  ordered.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "es"));
  return ordered.map((o) => o.name);
}

// ---------- Snapshot loading ----------

let _cached: DrugCatalog | null = null;

export function loadCatalogSync(): DrugCatalog {
  if (_cached) return _cached;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("../../public/drugs.json") as DrugCatalog;
  _cached = data;
  return data;
}

export async function loadCatalog(): Promise<DrugCatalog> {
  if (_cached) return _cached;
  const res = await fetch("/drugs.json");
  if (!res.ok) throw new Error("Failed to load catalog");
  const data = (await res.json()) as DrugCatalog;
  _cached = data;
  return data;
}

// ---------- Supabase fetch ----------

const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

async function sb<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Supabase ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

export interface PharmacologyEntry {
  property: string;
  value: string;
  details: string | null;
  sort_order: number;
}

export interface AdverseEffect {
  effect: string;
  frequency: string | null;
  severity: "mild" | "moderate" | "severe" | "life-threatening" | null;
  organ_system: string | null;
  is_black_box: boolean;
}

export interface Warning {
  type: "warning" | "precaution" | "contraindication" | "black_box";
  description: string;
  is_contraindication: boolean;
  is_black_box: boolean;
}

export interface Pregnancy {
  fda_old_category: string | null;
  fda_narrative: string | null;
  lactation_safe: boolean | null;
  lactation_notes: string | null;
}

export interface BrandName {
  brand_name: string;
  manufacturer: string | null;
  country: string | null;
  is_available: boolean | null;
}

export interface MolecularData {
  formula: string | null;
  molecular_weight: number | null;
  smiles: string | null;
  inchi: string | null;
  inchi_key: string | null;
  logp: number | null;
  pka: number | null;
  pka_type: string | null;
  solubility: string | null;
  protein_binding: string | null;
}

// NEW v16.3: Drug interactions
export type InteractionSeverity =
  | "contraindicated"
  | "major"
  | "moderate"
  | "minor";

export interface DrugInteraction {
  id?: string;
  drug_id: string;
  interacts_with_id: string | null;
  interacts_with_name: string;
  severity: InteractionSeverity;
  mechanism: string | null;
  clinical_effect: string | null;
  management: string | null;
}

export interface DrugDetail {
  pharmacology: PharmacologyEntry[];
  adverse_effects: AdverseEffect[];
  warnings: Warning[];
  pregnancy: Pregnancy | null;
  brands: BrandName[];
  molecular: MolecularData | null;
  interactions: DrugInteraction[]; // NEW v16.3
}

export async function fetchDrugDetail(drugId: string): Promise<DrugDetail> {
  const [pharm, ae, warn, preg, brands, molecular, interactions] = await Promise.all([
    sb<PharmacologyEntry[]>(
      `drug_pharmacology?drug_id=eq.${drugId}&select=property,value,details,sort_order&order=sort_order.asc`
    ),
    sb<AdverseEffect[]>(
      `drug_adverse_effects?drug_id=eq.${drugId}&select=effect,frequency,severity,organ_system,is_black_box`
    ),
    sb<Warning[]>(
      `drug_warnings?drug_id=eq.${drugId}&select=type,description,is_contraindication,is_black_box`
    ),
    sb<Pregnancy[]>(
      `drug_pregnancy?drug_id=eq.${drugId}&select=fda_old_category,fda_narrative,lactation_safe,lactation_notes&limit=1`
    ),
    sb<BrandName[]>(
      `drug_brand_names?drug_id=eq.${drugId}&select=brand_name,manufacturer,country,is_available`
    ),
    sb<MolecularData[]>(
      `drug_molecular?drug_id=eq.${drugId}&select=formula,molecular_weight,smiles,inchi,inchi_key,logp,pka,pka_type,solubility,protein_binding&limit=1`
    ),
    sb<DrugInteraction[]>(
      `drug_interactions?drug_id=eq.${drugId}&select=drug_id,interacts_with_id,interacts_with_name,severity,mechanism,clinical_effect,management`
    ),
  ]);
  return {
    pharmacology: pharm,
    adverse_effects: ae,
    warnings: warn,
    pregnancy: preg[0] ?? null,
    brands,
    molecular: molecular[0] ?? null,
    interactions,
  };
}

// Fetch interactions between two specific drugs (for the interaction checker)
export async function fetchInteractionBetween(
  drugAId: string,
  drugBId: string
): Promise<DrugInteraction[]> {
  return sb<DrugInteraction[]>(
    `drug_interactions?drug_id=eq.${drugAId}&interacts_with_id=eq.${drugBId}` +
      `&select=drug_id,interacts_with_id,interacts_with_name,severity,mechanism,clinical_effect,management`
  );
}

// ---------- Severity / sort helpers ----------

export const SEVERITY_ORDER: Record<string, number> = {
  "life-threatening": 0,
  severe: 1,
  moderate: 2,
  mild: 3,
};

export function sortAdverseEffects(effects: AdverseEffect[]): AdverseEffect[] {
  return [...effects].sort((a, b) => {
    const sa = a.severity ? SEVERITY_ORDER[a.severity] ?? 4 : 4;
    const sb = b.severity ? SEVERITY_ORDER[b.severity] ?? 4 : 4;
    if (sa !== sb) return sa - sb;
    if (a.is_black_box !== b.is_black_box) return a.is_black_box ? -1 : 1;
    return a.effect.localeCompare(b.effect, "es");
  });
}

export function sortWarnings(warnings: Warning[]): Warning[] {
  const order: Record<string, number> = {
    black_box: 0,
    contraindication: 1,
    warning: 2,
    precaution: 3,
  };
  return [...warnings].sort((a, b) => {
    const oa = order[a.type] ?? 4;
    const ob = order[b.type] ?? 4;
    return oa - ob;
  });
}

// NEW v16.3: Sort interactions by severity (most dangerous first)
export const INTERACTION_SEVERITY_ORDER: Record<InteractionSeverity, number> = {
  contraindicated: 0,
  major: 1,
  moderate: 2,
  minor: 3,
};

export function sortInteractions(items: DrugInteraction[]): DrugInteraction[] {
  return [...items].sort((a, b) => {
    const oa = INTERACTION_SEVERITY_ORDER[a.severity] ?? 99;
    const ob = INTERACTION_SEVERITY_ORDER[b.severity] ?? 99;
    if (oa !== ob) return oa - ob;
    return a.interacts_with_name.localeCompare(b.interacts_with_name, "es");
  });
}

export const SEVERITY_COLOR: Record<string, string> = {
  "life-threatening": "var(--red)",
  severe: "var(--amber)",
  moderate: "var(--accent)",
  mild: "var(--text-2)",
};

// NEW v16.3: Color and label helpers for interaction severity
export const INTERACTION_SEVERITY_COLOR: Record<InteractionSeverity, string> = {
  contraindicated: "var(--red)",
  major: "var(--amber)",
  moderate: "var(--cyan, var(--accent))",
  minor: "var(--text-3)",
};

export const INTERACTION_SEVERITY_LABEL: Record<InteractionSeverity, string> = {
  contraindicated: "CONTRAINDICADO",
  major: "MAYOR",
  moderate: "MODERADA",
  minor: "MENOR",
};

export const INTERACTION_SEVERITY_BADGE: Record<InteractionSeverity, string> = {
  contraindicated: "✕ NO",
  major: "⚠ MAJOR",
  moderate: "● MOD",
  minor: "○ min",
};

// ---------- Molecular helpers ----------

export function parseFormulaToTokens(
  formula: string
): Array<{ text: string; sub: boolean }> {
  const tokens: Array<{ text: string; sub: boolean }> = [];
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  while ((match = regex.exec(formula)) !== null) {
    if (match[1]) tokens.push({ text: match[1], sub: false });
    if (match[2]) tokens.push({ text: match[2], sub: true });
  }
  if (tokens.length === 0) return [{ text: formula, sub: false }];
  return tokens;
}

export function interpretLogP(logp: number): {
  label: string;
  description: string;
} {
  if (logp < -1) {
    return {
      label: "Hidrofílico",
      description: "Pobre paso por membranas; biodisponibilidad oral baja",
    };
  }
  if (logp < 1) {
    return {
      label: "Polar moderado",
      description: "Distribución acuosa; absorción intestinal variable",
    };
  }
  if (logp < 3) {
    return {
      label: "Lipofílico balanceado",
      description: "Buena absorción y distribución tisular",
    };
  }
  if (logp < 5) {
    return {
      label: "Lipofílico",
      description: "Alta penetración tisular; SNC accesible",
    };
  }
  return {
    label: "Muy lipofílico",
    description: "Acumulación en tejido adiposo; metabolismo hepático extenso",
  };
}

export function pubchemUrl(inchiKey: string): string {
  return `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(inchiKey)}`;
}

export function hasMolecularData(m: MolecularData | null): boolean {
  if (!m) return false;
  return !!(
    m.formula ||
    m.molecular_weight ||
    m.smiles ||
    m.logp !== null ||
    m.pka !== null ||
    m.solubility ||
    m.protein_binding
  );
}
