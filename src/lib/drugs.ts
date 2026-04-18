// ============================================================
// Drug types and data loading
// ============================================================

export interface DrugDoseRange {
  label: string;
  min: number;
  max: number;
  unit: string;
}

export interface Drug {
  name: string;
  description: string;
  ampulePresentation: string;
  ampuleAmount: number;
  ampuleUnit: string;
  ampuleVolumeMl: number;
  standardDilutionMl: number;
  typicalDoseUnit: string;
  doseRanges: DrugDoseRange[];
  category: string;
}

export interface DrugCatalog {
  version: number;
  lastUpdated: string;
  drugs: Drug[];
}

// Category display order
const CATEGORY_ORDER = [
  "Vasopresores",
  "Inotrópicos",
  "Cronotrópicos / Antibradicárdicos",
  "Sedantes / Hipnóticos",
  "Opioides",
  "Relajantes musculares",
  "Reversores",
  "Anestésicos locales / Sistémicos",
  "Antiarrítmicos",
  "Vasodilatadores",
  "Antihipertensivos",
  "Prostaglandinas / HTP",
  "Anticoagulantes",
  "Trombolíticos",
  "Antifibrinolíticos",
  "Reposición / Reanimación",
  "Electrolitos",
  "Insulina",
  "Oxitócicos",
  "Broncodilatadores",
  "Diuréticos",
  "Gastroprotectores",
  "Antieméticos",
  "Antiepilépticos",
  "Corticosteroides",
  "Antibióticos",
  "Antifúngicos",
  "Antídotos / Reanimación",
];

// Category icons (emoji for web)
export const CATEGORY_ICONS: Record<string, string> = {
  "Vasopresores": "⬆️",
  "Inotrópicos": "💪",
  "Cronotrópicos / Antibradicárdicos": "⚡",
  "Sedantes / Hipnóticos": "🌙",
  "Opioides": "💊",
  "Relajantes musculares": "🦴",
  "Reversores": "↩️",
  "Anestésicos locales / Sistémicos": "💉",
  "Antiarrítmicos": "❤️‍🩹",
  "Vasodilatadores": "⬇️",
  "Antihipertensivos": "🩸",
  "Prostaglandinas / HTP": "🫁",
  "Anticoagulantes": "🩹",
  "Trombolíticos": "🔓",
  "Antifibrinolíticos": "🛑",
  "Reposición / Reanimación": "🚑",
  "Electrolitos": "⚗️",
  "Insulina": "💧",
  "Oxitócicos": "👶",
  "Broncodilatadores": "🌬️",
  "Diuréticos": "💦",
  "Gastroprotectores": "🛡️",
  "Antieméticos": "🤢",
  "Antiepilépticos": "🧠",
  "Corticosteroides": "💎",
  "Antibióticos": "🦠",
  "Antifúngicos": "🍄",
  "Antídotos / Reanimación": "☠️",
};

// Slug generation
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Load catalog from JSON
export async function loadCatalog(): Promise<DrugCatalog> {
  const res = await fetch("/drugs.json");
  return res.json();
}

// Load catalog at build time (server-side)
export function loadCatalogSync(): DrugCatalog {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const data = require("../../public/drugs.json");
  return data as DrugCatalog;
}

// Get sorted categories
export function getCategories(drugs: Drug[]): string[] {
  const existing = new Set(drugs.map((d) => d.category));
  return CATEGORY_ORDER.filter((c) => existing.has(c));
}

// Get drugs in a category
export function getDrugsInCategory(drugs: Drug[], category: string): Drug[] {
  return drugs
    .filter((d) => d.category === category)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Search drugs
export function searchDrugs(drugs: Drug[], query: string): Drug[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return drugs.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
  );
}

// Find drug by slug
export function findDrugBySlug(drugs: Drug[], slug: string): Drug | undefined {
  return drugs.find((d) => slugify(d.name) === slug);
}

// Format dose range for display
export function formatDoseRange(range: DrugDoseRange): string {
  if (range.min === 0 && range.max === 0) return range.label;
  if (range.min === range.max) return `${range.min} ${range.unit}`;
  return `${range.min} – ${range.max} ${range.unit}`;
}
