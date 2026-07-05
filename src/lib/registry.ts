// src/lib/registry.ts
//
// REGISTRO CENTRAL DE SECCIONES — fuente única de verdad del sistema DEC.
//
// De este archivo derivan: el navbar (agrupado por categoría), las tarjetas de
// la portada, y la página /manual (índice/manual vivo). Agregar o modificar una
// sección aquí propaga el cambio a los tres lugares — no se edita en 3 sitios.
//
// Regla clínica: el campo `manual` describe lo que la sección HACE. No inventar
// contenido; describir la herramienta y su base (fuentes citadas donde aplica).

export type Platform = "web" | "ios" | "ipados" | "watch";

export type Category =
  | "crisis"
  | "calculadoras"
  | "tci"
  | "referencia"
  | "guias"
  | "algoritmos"
  | "valoracion"
  | "cuenta"
  | "info";

export interface Section {
  /** Ruta canónica, ej "/tci". Para grupos externos puede ser un hub. */
  slug: string;
  /** Título completo, ej "TCI / TIVA". */
  title: string;
  /** Etiqueta corta para el navbar, lowercase/mono, ej "tci". */
  navLabel: string;
  category: Category;
  /** Emoji identificador. */
  icon?: string;
  /** Una línea (navbar/tarjetas). */
  short: string;
  /** 2-4 frases para el manual: qué es, qué hace, cómo se usa. */
  manual: string;
  /** Citas/fuentes clínicas si aplica (Vancouver abreviado). */
  sources?: string[];
  /** Plataformas donde existe hoy. */
  platforms: Platform[];
  /** Estilo rojo de urgencia (código azul / crisis). */
  urgent?: boolean;
  /** Marca "nuevo". */
  isNew?: boolean;
  /** No mostrar en navbar aunque esté en el registro (ej. subpáginas legales). */
  hideFromNav?: boolean;
}

const ALL: Platform[] = ["web", "ios", "ipados"];

// ── SECCIONES ──────────────────────────────────────────────────────────────
// Orden lógico: inicio → crisis → referencia → herramientas → guías/algoritmos
// → valoración → cuenta → info. El agrupamiento visual lo da CATEGORIES.

export const SECTIONS: Section[] = [
  // ── Inicio ──────────────────────────────────────────────────────────────
  {
    slug: "/",
    title: "Inicio",
    navLabel: "sys",
    category: "info",
    icon: "▸",
    short: "Portada y accesos del sistema DEC.",
    manual:
      "Punto de entrada de DEC. Reúne el buscador global de fármacos, las estadísticas del catálogo y los accesos destacados a las herramientas clínicas. Desde aquí se llega a cualquier módulo en un toque.",
    platforms: ALL,
  },

  // ── Crisis / código azul ─────────────────────────────────────────────────
  {
    slug: "/codigo",
    title: "Modo Quirófano / Código Azul",
    navLabel: "código",
    category: "crisis",
    icon: "🚨",
    short: "Dosis de crisis por peso, protocolos en pasos y timer de código.",
    manual:
      "Modo de emergencia glanceable para el quirófano. Introduces el peso del paciente y obtienes las dosis de crisis calculadas (adrenalina, atropina, vasopresores, antídotos), protocolos de reanimación en pasos y un timer de código. Pensado para leerse de reojo en la tablet durante un paro o una crisis hemodinámica.",
    sources: ["ACLS/AHA", "ASA", "PALS"],
    platforms: ALL,
    urgent: true,
    isNew: true,
  },
  {
    slug: "/situacion",
    title: "Búsqueda por situación",
    navLabel: "situación",
    category: "crisis",
    icon: "🔎",
    short: "¿Qué hago si…? → pasos + fármaco + dosis + guía enlazada.",
    manual:
      "Búsqueda orientada al problema en vez de al fármaco. Escribes lo que está pasando (hipotensión, laringoespasmo, LAST, anafilaxia, bradicardia…) y DEC devuelve los pasos de manejo, el fármaco indicado con su dosis y el enlace a la guía completa. Resuelve el momento en que sabes el problema pero no el nombre exacto de la herramienta.",
    platforms: ALL,
    isNew: true,
  },

  // ── Referencia / base de datos ────────────────────────────────────────────
  {
    slug: "/farmacos",
    title: "Catálogo de fármacos",
    navLabel: "fármacos",
    category: "referencia",
    icon: "💊",
    short: "893 fármacos con dosis, farmacología, presentaciones e infusión.",
    manual:
      "Base de datos clínica de 893 fármacos en 57 categorías (anestésicos, vasoactivos, antibióticos, antivirales, oncológicos, biológicos, antídotos). Cada ficha reúne dosis, farmacología completa (mecanismo, T½, Vd, aclaramiento, ajustes renal/hepático), presentaciones, marcas comerciales, advertencias FDA, categoría de embarazo/lactancia y calculadora de infusión donde aplica. Se navega por categoría o con el buscador.",
    sources: ["UpToDate", "Stoelting", "Miller", "Trissel's", "FDA"],
    platforms: ALL,
  },
  {
    slug: "/interacciones",
    title: "Interacciones farmacológicas",
    navLabel: "interacciones",
    category: "referencia",
    icon: "⚠️",
    short: "Verificador multi-fármaco. Antes de mezclar, pregunta.",
    manual:
      "Verificador de interacciones entre fármacos. Seleccionas dos o más agentes y DEC lista las interacciones conocidas clasificadas por severidad, con el mecanismo y la recomendación de manejo. Cada ficha de fármaco también expone sus interacciones. Ante fallo de red no muestra 'sin interacción' (evita el falso negativo clínico).",
    sources: ["UpToDate", "Stockley's", "FDA"],
    platforms: ALL,
  },
  {
    slug: "/eeg",
    title: "Firmas EEG en el DSA",
    navLabel: "eeg",
    category: "referencia",
    icon: "🧠",
    short: "Reconoce el patrón del espectrograma por anestésico.",
    manual:
      "Atlas de firmas electroencefalográficas en el array de densidad espectral (DSA/espectrograma). Para cada anestésico (propofol, ketamina, dexmedetomidina, sevoflurano, óxido nitroso…) muestra el patrón esperado de bandas de frecuencia, para reconocer el estado hipnótico y ajustar la profundidad anestésica leyendo el monitor.",
    sources: ["Purdon (Anesthesiology)", "Miller"],
    platforms: ALL,
    isNew: true,
  },

  // ── Calculadoras ──────────────────────────────────────────────────────────
  {
    slug: "/calculadoras",
    title: "Calculadoras clínicas",
    navLabel: "calc",
    category: "calculadoras",
    icon: "🧮",
    short: "20 calculadoras perioperatorias deterministas y citadas.",
    manual:
      "Hub de 20 calculadoras perioperatorias: antropometría (IMC/IBW/LBM/ABW/volemia), MAC ajustada por edad, riesgo cardíaco (RCRI/METs), pérdida sanguínea máxima (MABL), fluidoterapia 4-2-1/Parkland, QTc y torsades, aclaramiento de creatinina, reversión neuromuscular (sugammadex/neostigmina), electrolitos y gases, ROTEM/TEG, LAST, equianalgesia de opioides, Apfel, STOP-BANG, ROX, ventilación/vía aérea y emergencias pediátricas. Todas deterministas y con fuentes.",
    sources: ["Miller", "Stoelting", "UpToDate"],
    platforms: ALL,
  },
  {
    slug: "/calculadora",
    title: "Calculadora de infusión",
    navLabel: "infusión",
    category: "calculadoras",
    icon: "💧",
    short: "Cálculo bidireccional dosis ⇄ ritmo · 246 fármacos.",
    manual:
      "Calculadora de infusión de fármacos con conversión bidireccional dosis ⇄ mL/h. Para 246 fármacos con dilución estándar: introduces peso, dosis objetivo y concentración, y devuelve el ritmo en mL/h (o al revés), mostrando la concentración resultante. Enlazada desde cada ficha de fármaco con calculadora.",
    sources: ["Trissel's", "UpToDate"],
    platforms: ALL,
  },

  // ── TCI / TIVA ────────────────────────────────────────────────────────────
  {
    slug: "/tci",
    title: "TCI / TIVA",
    navLabel: "tci",
    category: "tci",
    icon: "💉",
    short: "Infusión objetivo-controlada con modelos PK poblacionales.",
    manual:
      "Calculadora de infusión objetivo-controlada (TCI) para anestesia total intravenosa. Simula propofol (modelos Schnider, Marsh, Eleveld) y remifentanilo (Minto, Eleveld) con farmacocinética poblacional, mostrando la concentración plasmática/efecto y el ritmo de infusión para una diana dada. Los modelos PK están citados de la literatura.",
    sources: ["Schnider", "Marsh", "Eleveld", "Minto"],
    platforms: ALL,
    isNew: true,
  },

  // ── Guías clínicas ────────────────────────────────────────────────────────
  {
    slug: "/guias",
    title: "Guías clínicas",
    navLabel: "guías",
    category: "guias",
    icon: "📋",
    short: "34 protocolos de crisis y manejo perioperatorio.",
    manual:
      "Colección de 34 guías de referencia perioperatoria y de cuidados críticos, con umbrales y dosis citados. Incluye crisis (hipertermia maligna, anafilaxia, hemorragia postparto, LAST, paro perioperatorio, embolia de líquido amniótico, feocromocitoma, tormenta tiroidea, status epilepticus) y manejo por paciente (renal/diálisis, hepático, marcapasos/DAI, obesidad, anticoagulación perioperatoria). Cada guía es un protocolo accionable, no un resumen teórico.",
    sources: ["UpToDate", "Miller", "guías de sociedades"],
    platforms: ALL,
  },

  // ── Algoritmos ────────────────────────────────────────────────────────────
  {
    slug: "/algoritmos",
    title: "Algoritmos de crisis y vía aérea",
    navLabel: "algoritmos",
    category: "algoritmos",
    icon: "🌀",
    short: "13 algoritmos de vía aérea y crisis (RSI, DSI, Vortex, CICO, PeRLS).",
    manual:
      "Ayudas cognitivas en forma de árbol de decisión para el código azul y la vía aérea difícil: RSI, DSI, KOBI, intubación despierto, RSA, oxigenación apneica, Vortex, CICO/eFONA, algoritmo ASA 2022 de vía aérea difícil, DAS de intubación difícil, vía aérea difícil pediátrica, PeRLS (ASA 2025) e hipotensión intraoperatoria. Diseñados para seguirse paso a paso bajo presión.",
    sources: ["ASA 2022", "DAS 2015", "Vortex", "PeRLS (ASA 2025)"],
    platforms: ALL,
  },

  // ── Valoración / checklist ────────────────────────────────────────────────
  {
    slug: "/valoracion",
    title: "Valoración preanestésica",
    navLabel: "valoración",
    category: "valoracion",
    icon: "📝",
    short: "Escalas de riesgo perioperatorio (ASA, RCRI, STOP-BANG…) + PDF.",
    manual:
      "Hoja de valoración preanestésica con escalas de riesgo integradas: clasificación ASA, RCRI (cardíaco), STOP-BANG (apnea), Apfel (NVPO), aclaramiento de creatinina y pérdida sanguínea máxima. Introduces los datos del paciente una vez y calcula todos los scores en tiempo real, generando una hoja de riesgo perioperatorio exportable a PDF.",
    sources: ["ASA", "Lee/RCRI", "STOP-BANG", "Apfel", "Cockcroft-Gault"],
    platforms: ALL,
    isNew: true,
  },
  {
    slug: "/checklist",
    title: "Checklist OMS + timers",
    navLabel: "checklist",
    category: "valoracion",
    icon: "✅",
    short: "Verificación quirúrgica OMS (3 fases) + timers de re-dosis ATB.",
    manual:
      "Checklist quirúrgico de la OMS en sus tres fases (entrada/sign-in, pausa/time-out, salida/sign-out) con seguimiento de ítems completados. Incorpora timers de re-dosificación de antibiótico profiláctico según la vida media del agente, para no perder la ventana intraoperatoria.",
    sources: ["OMS/WHO Surgical Safety Checklist"],
    platforms: ALL,
    isNew: true,
  },

  // ── Cuenta / producto ─────────────────────────────────────────────────────
  {
    slug: "/pro",
    title: "DEC Pro",
    navLabel: "pro",
    category: "cuenta",
    icon: "⭐",
    short: "Suscripción: interacciones ilimitadas, detalle ampliado, sin ads.",
    manual:
      "Página de suscripción DEC Pro. El catálogo completo es gratis; Pro añade interacciones ilimitadas (free: 3/día), detalle clínico ampliado (farmacología completa, molecular, marcas), calculadoras avanzadas, sin publicidad y sincronización entre dispositivos. Incluye el pricing y la matriz de comparación Free/Pro.",
    platforms: ALL,
  },

  // ── Info / contenido ──────────────────────────────────────────────────────
  {
    slug: "/manual",
    title: "Manual del sistema",
    navLabel: "📖 manual",
    category: "info",
    icon: "📖",
    short: "Índice vivo de todas las secciones de DEC, con qué hace cada una.",
    manual:
      "Este documento. Manual/índice vivo del sistema DEC generado desde el registro central de secciones: cada vez que se agrega o modifica un módulo, el manual se actualiza solo. Agrupa todas las secciones por categoría con su descripción, fuentes, plataformas y enlace, e incluye un filtro en vivo.",
    platforms: ALL,
    isNew: true,
    // Oculto del navbar por decisión de producto (jul-2026): la página /manual
    // queda en disco pero sin enlaces entrantes hasta reintroducirla.
    hideFromNav: true,
  },
  {
    slug: "/blog",
    title: "Blog",
    navLabel: "blog",
    category: "info",
    icon: "✍️",
    short: "Notas clínicas y de producto del autor.",
    manual:
      "Blog de DEC con notas clínicas y de producto escritas por el autor. Artículos de repaso, decisiones de dosificación y novedades de la herramienta.",
    platforms: ["web"],
  },
  {
    slug: "/about",
    title: "Sobre el autor",
    navLabel: "about",
    category: "info",
    icon: "👤",
    short: "Quién construye DEC y por qué.",
    manual:
      "Presentación del autor: Dr. Jophiel Espaillat, anestesiólogo y neuroanestesiólogo (RD), y la motivación detrás de DEC. Incluye la historia del proyecto.",
    platforms: ["web"],
  },

  // ── Legal (agrupadas; ocultas del navbar principal, viven en el footer) ────
  {
    slug: "/legal/aviso-medico",
    title: "Aviso médico",
    navLabel: "aviso médico",
    category: "info",
    icon: "⚕️",
    short: "Qué es DEC, qué no es, y de quién es la responsabilidad final.",
    manual:
      "Aviso médico-legal: DEC es una herramienta de apoyo a la decisión clínica y no sustituye el juicio profesional, la ficha técnica oficial ni la supervisión. La responsabilidad de verificar dosis, dilución y vía antes de tratar al paciente es siempre del clínico.",
    platforms: ["web"],
    hideFromNav: true,
  },
  {
    slug: "/legal/terminos",
    title: "Términos y condiciones",
    navLabel: "términos",
    category: "info",
    short: "Condiciones de uso del servicio.",
    manual:
      "Términos y condiciones de uso de DEC Anestesia: alcance del servicio, licencia de uso, limitación de responsabilidad y condiciones de la cuenta.",
    platforms: ["web"],
    hideFromNav: true,
  },
  {
    slug: "/legal/privacidad",
    title: "Política de privacidad",
    navLabel: "privacidad",
    category: "info",
    short: "Qué datos se tratan y cómo.",
    manual:
      "Política de privacidad: qué datos personales trata DEC, con qué finalidad, base legal, conservación y derechos del usuario.",
    platforms: ["web"],
    hideFromNav: true,
  },
  {
    slug: "/legal/cookies",
    title: "Política de cookies",
    navLabel: "cookies",
    category: "info",
    short: "Uso de cookies y almacenamiento local.",
    manual:
      "Política de cookies: tipos de cookies y almacenamiento local que utiliza el sitio, su finalidad y cómo gestionarlos.",
    platforms: ["web"],
    hideFromNav: true,
  },
];

// ── CATEGORÍAS ───────────────────────────────────────────────────────────────
// Orden + etiquetas para agrupar el navbar, el manual y las tarjetas.

export const CATEGORIES: { key: Category; label: string; desc: string }[] = [
  {
    key: "crisis",
    label: "crisis",
    desc: "Emergencias y código azul: acceso rápido bajo presión.",
  },
  {
    key: "referencia",
    label: "referencia",
    desc: "Base de datos clínica: fármacos, interacciones y firmas EEG.",
  },
  {
    key: "calculadoras",
    label: "calculadoras",
    desc: "Cálculos perioperatorios deterministas y citados.",
  },
  {
    key: "tci",
    label: "tci / tiva",
    desc: "Infusión objetivo-controlada con modelos farmacocinéticos.",
  },
  {
    key: "guias",
    label: "guías",
    desc: "Protocolos accionables de crisis y manejo perioperatorio.",
  },
  {
    key: "algoritmos",
    label: "algoritmos",
    desc: "Árboles de decisión de vía aérea y crisis.",
  },
  {
    key: "valoracion",
    label: "valoración",
    desc: "Preoperatorio: escalas de riesgo y checklist quirúrgico.",
  },
  {
    key: "cuenta",
    label: "cuenta",
    desc: "Suscripción y funciones Pro.",
  },
  {
    key: "info",
    label: "info",
    desc: "Manual, blog, autor y avisos legales.",
  },
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

/** Etiqueta legible de cada plataforma para los badges. */
export const PLATFORM_LABEL: Record<Platform, string> = {
  web: "web",
  ios: "iOS",
  ipados: "iPadOS",
  watch: "watch",
};

/** Secciones de una categoría, en el orden del registro. */
export function sectionsByCategory(cat: Category): Section[] {
  return SECTIONS.filter((s) => s.category === cat);
}

/** Categorías que tienen al menos una sección visible en navbar. */
export function navCategories(): { key: Category; label: string; desc: string }[] {
  return CATEGORIES.filter((c) =>
    SECTIONS.some((s) => s.category === c.key && !s.hideFromNav),
  );
}

/** Secciones visibles en el navbar de una categoría. */
export function navSections(cat: Category): Section[] {
  return SECTIONS.filter((s) => s.category === cat && !s.hideFromNav);
}

// ── NAVBAR PLANO ─────────────────────────────────────────────────────────────
// El navbar es una lista PLANA de enlaces directos (un clic = una sección),
// SIN dropdowns por categoría. Se deriva del registro para mantener la fuente
// única, pero se renderiza plano.

/** Categorías consideradas "secundarias" en el navbar: van al overflow "···". */
const SECONDARY_CATEGORIES: Category[] = ["info"];

/** Slugs excluidos del navbar plano (además de hideFromNav). */
const NAV_EXCLUDE_SLUGS = new Set(["/", "/manual"]);

/** ¿Es una sección clínica/primaria? (siempre visible y directa en el navbar). */
function isPrimaryNavSection(s: Section): boolean {
  return !SECONDARY_CATEGORIES.includes(s.category);
}

/**
 * Secciones PRIMARIAS del navbar plano: herramientas clínicas + producto.
 * Siempre visibles y directas (nunca anidadas). En orden del registro.
 */
export function primaryNavSections(): Section[] {
  return SECTIONS.filter(
    (s) => !s.hideFromNav && !NAV_EXCLUDE_SLUGS.has(s.slug) && isPrimaryNavSection(s),
  );
}

/**
 * Secciones SECUNDARIAS del navbar plano: blog, about, etc.
 * Pueden ir en un pequeño overflow "···" si no caben. En orden del registro.
 */
export function secondaryNavSections(): Section[] {
  return SECTIONS.filter(
    (s) => !s.hideFromNav && !NAV_EXCLUDE_SLUGS.has(s.slug) && !isPrimaryNavSection(s),
  );
}
