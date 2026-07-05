// src/lib/pricing.ts
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  FUENTE ÚNICA DE PRECIOS Y FEATURES DE DEC PRO — edita SOLO aquí.          ║
// ╚══════════════════════════════════════════════════════════════════════════╝
//
// El dueño AÚN NO fijó los precios definitivos: se determinan más tarde en
// App Store Connect (iOS) y Lemon Squeezy (web). Mientras tanto esta config usa
// PLACEHOLDERS provisionales. La página /pro deriva TODO de este archivo, así
// que cuando lleguen los precios reales solo se toca este objeto — ni una línea
// de JSX.
//
// ┌────────────────────────────────────────────────────────────────────────┐
// │  👉 DÓNDE SE FIJAN LOS PRECIOS FINALES:                                   │
// │     1. Cambia `price`/`unit`/`note` en PRICING_TIERS (abajo).            │
// │     2. Pon PRICES_ARE_FINAL = true para ocultar el aviso "provisional"   │
// │        y quitar los badges "Próximamente" (cuando el checkout esté vivo, │
// │        pon también CHECKOUT_LIVE = true).                                 │
// │     3. Los precios deben cuadrar con lo configurado en App Store Connect  │
// │        / Lemon Squeezy. Esta constante NO cobra nada por sí sola.         │
// └────────────────────────────────────────────────────────────────────────┘
//
// Regla de negocio (CLAUDE.md / Blueprint §2.1, §3): el catálogo clínico
// completo es y será GRATIS. Pro paga profundidad y velocidad, no seguridad.

/** Placeholder legible para un precio sin decidir. Nunca se muestra un número inventado. */
export const PRICE_TBD = "—" as const;

/**
 * Los precios de PRICING_TIERS son DEFINITIVOS.
 * Mientras sea `false` la página muestra el aviso "precios provisionales".
 * Ponlo en `true` cuando confirmes los importes en las tiendas.
 */
export const PRICES_ARE_FINAL = false;

/**
 * El checkout web (Lemon Squeezy) está cableado y se puede comprar.
 * Mientras sea `false` los tiers muestran "Próximamente" y el CTA real es
 * crear cuenta gratis + waitlist.
 */
export const CHECKOUT_LIVE = false;

/** Días de prueba gratis del primer registro Pro. Se decide junto al precio. */
export const FREE_TRIAL_DAYS = 10;

// ── Tiers ────────────────────────────────────────────────────────────────────
// `price`/`unit` son strings para poder mostrar PRICE_TBD sin romper el tipo.
// Los valores actuales están marcados como PROVISIONALES (ver isProvisional).

export interface PricingTier {
  id: "monthly" | "annual" | "lifetime";
  name: string;
  /** Precio a mostrar. Usa PRICE_TBD si aún no se decide. */
  price: string;
  /** Unidad ("/ mes", "/ año", "pago único"). */
  unit: string;
  /** Nota corta bajo el precio. */
  note: string;
  /** Resalta la tarjeta (mejor valor). */
  highlight?: boolean;
  /** Badge sobre la tarjeta ("Mejor valor"). */
  badge?: string;
  /** true = número provisional de referencia, aún no confirmado en tienda. */
  isProvisional?: boolean;
}

// ⚠️ PRECIOS PROVISIONALES DE REFERENCIA — NO son definitivos.
//    Cambia estos importes (o ponlos en PRICE_TBD) al fijar el pricing real.
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "monthly",
    name: "Pro Mensual",
    price: "$2.99", // provisional — fijar en App Store Connect / Lemon Squeezy
    unit: "/ mes",
    note: `${FREE_TRIAL_DAYS} días de prueba en el primer registro`,
    isProvisional: true,
  },
  {
    id: "annual",
    name: "Pro Anual",
    price: "$19.99", // provisional — fijar en tienda
    unit: "/ año",
    note: `Ahorra ~44% vs. mensual · ${FREE_TRIAL_DAYS} días de prueba`,
    highlight: true,
    badge: "Mejor valor",
    isProvisional: true,
  },
  {
    id: "lifetime",
    name: "Pro Lifetime",
    price: "$49.99", // provisional — fijar en tienda
    unit: "pago único",
    note: "Una vez. Para siempre. Sin trial.",
    isProvisional: true,
  },
];

// ── Matriz Free vs Pro (Blueprint §3, coherente con CLAUDE.md) ───────────────
// Cambiar una capacidad aquí la propaga a la tabla comparativa de /pro.

export interface MatrixRow {
  cap: string;
  free: string;
  pro: string;
}

export const FEATURE_MATRIX: MatrixRow[] = [
  { cap: "Catálogo clínico completo (offline)", free: "Completo", pro: "Completo" },
  { cap: "Dosis, presentaciones, administración", free: "✓", pro: "✓" },
  { cap: "Calculadoras básicas (infusión, antropometría, dilución)", free: "✓", pro: "✓" },
  { cap: "Verificador de interacciones", free: "3 / día", pro: "Ilimitado" },
  { cap: "Calculadoras avanzadas (electrolitos, ROTEM, hemoderivados, VirtualScale)", free: "—", pro: "✓" },
  { cap: "Detalle ampliado (farmacología completa, molecular, todas las marcas)", free: "Resumen", pro: "Completo" },
  { cap: "Publicidad", free: "Con ads", pro: "Sin ads" },
  { cap: "Sync multi-dispositivo (favoritos, ajustes)", free: "—", pro: "✓" },
  { cap: "Favoritos / notas", free: "Máx 10", pro: "Ilimitado" },
];

// ── Copy dependiente de precio ───────────────────────────────────────────────

/** Línea de prueba gratis para el hero/CTA. */
export const FREE_TRIAL_LINE = `${FREE_TRIAL_DAYS} días de prueba gratis`;

/** Política de reembolsos (web). En iOS los gestiona Apple. */
export const REFUND_POLICY =
  "Reembolsos: 14 días (mensual/anual), 30 días (lifetime) en web · en iOS los gestiona Apple.";

/** mailto para la lista de espera del checkout web. */
export const WAITLIST_MAILTO =
  "mailto:hola@decanestesia.com?subject=Avísame%20cuando%20DEC%20Pro%20esté%20disponible%20en%20web" +
  "&body=Quiero%20que%20me%20avisen%20cuando%20se%20pueda%20comprar%20DEC%20Pro%20desde%20la%20web.";

/** mailto para el código Pro Estudiante/Residente (gratis con verificación). */
export const STUDENT_MAILTO =
  "mailto:hola@decanestesia.com?subject=Código%20Pro%20Estudiante";
