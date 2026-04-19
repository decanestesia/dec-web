// ============================================================
// Supabase client for DEC web
// ============================================================

const SUPABASE_URL = "https://smaazlgvonzcajjvbefk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtYWF6bGd2b256Y2FqanZiZWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDIyOTUsImV4cCI6MjA5MjA3ODI5NX0.LVVuXue2FljP0mvINWV84NbFaLNbgoXr8Lbg8oiiMK4";

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
};

export interface DbDrug {
  id: string;
  name: string;
  generic_name: string | null;
  description: string | null;
  mechanism_of_action: string | null;
  atc_code: string | null;
  cas_number: string | null;
  version: number;
  updated_at: string;
}

export interface DbInfusion {
  id: string;
  drug_id: string;
  label: string;
  dose_min: number;
  dose_max: number;
  dose_unit: string;
  standard_dilution_ml: number | null;
  ampule_amount: number | null;
  ampule_unit: string | null;
  ampule_volume_ml: number | null;
  ampule_presentation: string | null;
  sort_order: number;
}

export interface DbCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

export interface DbCategoryMap {
  drug_id: string;
  category_id: string;
  is_primary: boolean;
  drug_categories: DbCategory;
}

export interface DbDosing {
  id: string;
  drug_id: string;
  population: string;
  indication: string | null;
  route: string | null;
  dose_min: number | null;
  dose_max: number | null;
  dose_unit: string | null;
  frequency: string | null;
  max_daily_dose: number | null;
  max_daily_unit: string | null;
  notes: string | null;
}

export interface DbPharmacology {
  id: string;
  drug_id: string;
  property: string;
  value: string;
  details: string | null;
}

export interface DbAdverseEffect {
  id: string;
  drug_id: string;
  effect: string;
  frequency: string | null;
  severity: string;
  organ_system: string | null;
  is_black_box: boolean;
}

export interface DbWarning {
  id: string;
  drug_id: string;
  type: string;
  description: string;
  is_contraindication: boolean;
  is_black_box: boolean;
  population: string | null;
}

export interface DbPregnancy {
  id: string;
  drug_id: string;
  fda_old_category: string | null;
  fda_narrative: string | null;
  lactation_safe: boolean | null;
  lactation_notes: string | null;
  teratogenicity: string | null;
}

export interface DbBrandName {
  id: string;
  drug_id: string;
  brand_name: string;
  manufacturer: string | null;
  country: string | null;
  is_available: boolean;
}

export interface DbMolecular {
  id: string;
  drug_id: string;
  formula: string | null;
  molecular_weight: number | null;
  smiles: string | null;
  logp: number | null;
  pka: number | null;
  solubility: string | null;
  physical_state: string | null;
}

export interface CatalogMetadata {
  version: number;
  last_updated: string;
  drug_count: number;
}

// ── Fetch helpers ──

async function supabaseGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers,
      next: { revalidate: 300 }, // 5 min cache
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Public API ──

export async function fetchAllDrugs(): Promise<DbDrug[]> {
  return (await supabaseGet<DbDrug[]>("drugs?select=*&is_published=eq.true&order=name")) || [];
}

export async function fetchDrugByName(name: string): Promise<DbDrug | null> {
  const results = await supabaseGet<DbDrug[]>(
    `drugs?name=eq.${encodeURIComponent(name)}&limit=1`
  );
  return results?.[0] || null;
}

export async function fetchDrugById(id: string): Promise<DbDrug | null> {
  const results = await supabaseGet<DbDrug[]>(`drugs?id=eq.${id}&limit=1`);
  return results?.[0] || null;
}

export async function fetchCategories(): Promise<DbCategory[]> {
  return (await supabaseGet<DbCategory[]>("drug_categories?select=*&order=sort_order")) || [];
}

export async function fetchCategoryMap(): Promise<DbCategoryMap[]> {
  return (await supabaseGet<DbCategoryMap[]>(
    "drug_category_map?select=drug_id,category_id,is_primary,drug_categories(id,name,icon,sort_order)"
  )) || [];
}

export async function fetchInfusionsByDrugId(drugId: string): Promise<DbInfusion[]> {
  return (await supabaseGet<DbInfusion[]>(
    `drug_infusion?drug_id=eq.${drugId}&order=sort_order`
  )) || [];
}

export async function fetchAllInfusions(): Promise<DbInfusion[]> {
  return (await supabaseGet<DbInfusion[]>("drug_infusion?select=*&order=sort_order")) || [];
}

export async function fetchDosingByDrugId(drugId: string): Promise<DbDosing[]> {
  return (await supabaseGet<DbDosing[]>(
    `drug_dosing?drug_id=eq.${drugId}&order=sort_order`
  )) || [];
}

export async function fetchPharmacologyByDrugId(drugId: string): Promise<DbPharmacology[]> {
  return (await supabaseGet<DbPharmacology[]>(
    `drug_pharmacology?drug_id=eq.${drugId}&order=sort_order`
  )) || [];
}

export async function fetchAdverseEffectsByDrugId(drugId: string): Promise<DbAdverseEffect[]> {
  return (await supabaseGet<DbAdverseEffect[]>(
    `drug_adverse_effects?drug_id=eq.${drugId}&order=severity`
  )) || [];
}

export async function fetchWarningsByDrugId(drugId: string): Promise<DbWarning[]> {
  return (await supabaseGet<DbWarning[]>(
    `drug_warnings?drug_id=eq.${drugId}`
  )) || [];
}

export async function fetchPregnancyByDrugId(drugId: string): Promise<DbPregnancy | null> {
  const results = await supabaseGet<DbPregnancy[]>(
    `drug_pregnancy?drug_id=eq.${drugId}&limit=1`
  );
  return results?.[0] || null;
}

export async function fetchBrandNamesByDrugId(drugId: string): Promise<DbBrandName[]> {
  return (await supabaseGet<DbBrandName[]>(
    `drug_brand_names?drug_id=eq.${drugId}&order=country`
  )) || [];
}

export async function fetchMolecularByDrugId(drugId: string): Promise<DbMolecular | null> {
  const results = await supabaseGet<DbMolecular[]>(
    `drug_molecular?drug_id=eq.${drugId}&limit=1`
  );
  return results?.[0] || null;
}

export async function fetchCatalogMetadata(): Promise<CatalogMetadata | null> {
  const results = await supabaseGet<CatalogMetadata[]>("catalog_metadata?limit=1");
  return results?.[0] || null;
}

export async function searchDrugsDb(query: string): Promise<DbDrug[]> {
  const q = query.trim();
  if (!q) return [];
  return (await supabaseGet<DbDrug[]>(
    `drugs?or=(name.ilike.*${encodeURIComponent(q)}*,description.ilike.*${encodeURIComponent(q)}*)&is_published=eq.true&order=name&limit=50`
  )) || [];
}
