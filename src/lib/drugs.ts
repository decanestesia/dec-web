// ============================================================
// DEC drugs data layer — hybrid (snapshot + Supabase fetch)
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

// ---------- Supabase fetch (rich detail data) ----------

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

export interface DrugDetail {
  pharmacology: PharmacologyEntry[];
  adverse_effects: AdverseEffect[];
  warnings: Warning[];
  pregnancy: Pregnancy | null;
  brands: BrandName[];
}

export async function fetchDrugDetail(drugId: string): Promise<DrugDetail> {
  const [pharm, ae, warn, preg, brands] = await Promise.all([
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
  ]);
  return {
    pharmacology: pharm,
    adverse_effects: ae,
    warnings: warn,
    pregnancy: preg[0] ?? null,
    brands,
  };
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

// Severity color map (uses CSS variables from globals.css)
export const SEVERITY_COLOR: Record<string, string> = {
  "life-threatening": "var(--red)",
  severe: "var(--amber)",
  moderate: "var(--accent)",
  mild: "var(--text-2)",
};
