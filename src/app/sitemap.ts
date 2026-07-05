// src/app/sitemap.ts
//
// Sitemap XML de decanestesia.com. Incluye TODAS las rutas públicas y excluye
// las privadas (/admin, /perfil, /auth/*, /blog/nuevo, /blog/editar).
//
// Los listados de sub-rutas (calculadoras, guías, algoritmos) se mantienen a
// mano y espejan las carpetas de src/app/*: al añadir una sección nueva, añade
// su slug aquí. Los fármacos y los posts del blog se derivan de datos.

import type { MetadataRoute } from "next";
import { loadCatalogSync, slugify } from "@/lib/drugs";
import { getAllEntries } from "@/lib/blog-data";

const BASE = "https://decanestesia.com";

// ── Sub-rutas estáticas (espejo de src/app/*) ────────────────────────────────

const CALCULADORAS = [
  "aclaramiento-creatinina", "anestesicos-locales", "antropometria", "apfel",
  "concentracion-plasmatica", "electrolitos", "emergencia-pediatrica",
  "fluidoterapia", "mac", "opioides-equianalgesia", "perdida-sanguinea-maxima",
  "qtc", "reversion-neuromuscular", "riesgo-cardiaco", "rotem-teg", "rox",
  "salino-hipertonico", "stop-bang", "ventilacion",
];

const GUIAS = [
  "anafilaxia", "anticoagulantes-perioperatorio", "aspiracion-mendelson",
  "bloqueos-regionales", "broncoespasmo-laringoespasmo",
  "crisis-celulas-falciformes", "crisis-hipertension-pulmonar",
  "delirium-emergencia", "disreflexia-autonomica", "dolor-agudo-postoperatorio",
  "embolia-gaseosa-venosa", "embolia-liquido-amniotico", "espinal-alta-total",
  "extubacion", "feocromocitoma-crisis-htn", "hemorragia-postparto",
  "hipertermia-maligna", "insuficiencia-hepatica-perioperatoria",
  "insuficiencia-suprarrenal", "isquemia-miocardica-perioperatoria",
  "metahemoglobinemia", "nvpo-manejo", "obesidad-perioperatoria",
  "paciente-marcapasos-dai", "paciente-renal-dialisis", "paro-perioperatorio",
  "preeclampsia-eclampsia", "reaccion-protamina", "sepsis-perioperatoria",
  "serotoninergico-nms", "sindrome-reperfusion-aortico", "status-epilepticus",
  "tormenta-tiroidea", "transfusion",
];

const ALGORITMOS = [
  "asa-via-aerea-dificil", "cico-efona", "das-intubacion-dificil", "dsi",
  "hipotension-intraoperatoria", "intubacion-despierto", "kobi",
  "oxigenacion-apneica", "perls", "rsa", "rsi",
  "via-aerea-dificil-pediatrica", "vortex",
];

const LEGAL = ["terminos", "privacidad", "cookies", "aviso-medico", "disclaimer"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = loadCatalogSync();
  const today = new Date().toISOString().split("T")[0];

  const entry = (
    path: string,
    priority: number,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ): MetadataRoute.Sitemap[number] => ({
    url: `${BASE}${path}`,
    lastModified: today,
    changeFrequency,
    priority,
  });

  // ── Rutas top-level ────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    entry("", 1.0, "weekly"),
    // Referencia / base de datos
    entry("/farmacos", 0.9, "weekly"),
    entry("/interacciones", 0.85, "weekly"),
    // Herramientas
    entry("/calculadoras", 0.8, "monthly"),
    entry("/calculadora", 0.6, "monthly"), // calculadora de infusión (legacy)
    entry("/tci", 0.8, "monthly"),
    // Crisis / quirófano
    entry("/codigo", 0.8, "monthly"),
    entry("/situacion", 0.8, "monthly"),
    entry("/checklist", 0.7, "monthly"),
    // Guías / algoritmos / referencia visual
    entry("/guias", 0.75, "monthly"),
    entry("/algoritmos", 0.75, "monthly"),
    entry("/eeg", 0.7, "monthly"),
    // Valoración preoperatoria
    entry("/valoracion", 0.75, "monthly"),
    // Manual (índice vivo)
    entry("/manual", 0.6, "monthly"),
    // Producto / contenido / info
    entry("/pro", 0.7, "monthly"),
    entry("/app-ios", 0.6, "monthly"),
    entry("/blog", 0.5, "weekly"),
    entry("/about", 0.5, "monthly"),
  ];

  const calcPages = CALCULADORAS.map((s) => entry(`/calculadoras/${s}`, 0.65, "monthly"));
  const guiaPages = GUIAS.map((s) => entry(`/guias/${s}`, 0.65, "monthly"));
  const algoPages = ALGORITMOS.map((s) => entry(`/algoritmos/${s}`, 0.65, "monthly"));
  const legalPages = LEGAL.map((s) => entry(`/legal/${s}`, 0.3, "yearly"));

  // ── Fichas de fármaco ──────────────────────────────────────────────────────
  const drugPages: MetadataRoute.Sitemap = catalog.drugs.map((d) => ({
    url: `${BASE}/farmacos/${slugify(d.name)}`,
    lastModified: catalog.last_updated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ── Posts del blog (Supabase publicados + legacy). getAllEntries tolera
  //    que Supabase esté caído/pausado (cae a legacy). ────────────────────────
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getAllEntries();
    blogPages = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: p.date || today,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Un fallo del blog no debe tumbar el sitemap de las rutas clínicas.
    blogPages = [];
  }

  return [
    ...staticPages,
    ...calcPages,
    ...guiaPages,
    ...algoPages,
    ...legalPages,
    ...blogPages,
    ...drugPages,
  ];
}
