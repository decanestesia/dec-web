// src/lib/gating.ts
//
// ============================================================
// INFRAESTRUCTURA DE GATING Free/Pro — DEC web · núcleo CLIENT-SAFE
// ============================================================
//
// Este módulo NO importa nada server-only (ni supabase/server, ni
// next/headers): es seguro importarlo desde Client Components. Contiene
// el flag maestro, el catálogo de features y las etiquetas de copy.
//
// La lógica que consulta la base (isProUser/canAccess) vive en
// `src/lib/gating.server.ts` (server-only). Sepáralas así para que los
// árboles "use client" (TCI, valoración, código, interacciones) puedan
// leer el flag y las features SIN arrastrar supabase/server al bundle.
//
// ------------------------------------------------------------------
// Decisión del dueño (pre-launch): la infra está CABLEADA en los puntos
// de entrada Pro, pero DESACTIVADA por el flag maestro. Con el flag en
// `false`, TODO pasa: cero cambio de comportamiento visible. El día que
// se abra la compra (Lemon Squeezy, Sprint D.5), poner el flag en `true`
// activa el gating en todos esos puntos de golpe, sin tocar más código.
//
// ⚠️ SOLO gatea la UI. La barrera real es server-side: is_pro() en
// Supabase (SECURITY DEFINER) + RLS. Esto esconde/muestra puertas.
// ============================================================

// ------------------------------------------------------------
// FLAG MAESTRO
// ------------------------------------------------------------
// false = gating APAGADO → canAccess() siempre true, ProGate siempre
//         renderiza children. La app se ve/funciona EXACTAMENTE igual
//         que hoy. NO tocar sin coordinar el launch de checkout.
// true  = gating ENCENDIDO → los usuarios no-Pro ven el paywall en los
//         puntos Pro; los Pro pasan.
//
// Cuando el dueño quiera activar el gating: cambiar esta línea a `true`.
export const GATING_ENABLED = false;

// ------------------------------------------------------------
// FEATURES Pro — llaves estables para marcar cada punto de entrada.
// (const-object en vez de enum: mismo lookup, sin runtime enum extra,
//  y el tipo `ProFeature` sale del propio objeto.)
// ------------------------------------------------------------
export const PRO_FEATURES = {
  /** Calculadora TCI / TIVA (infusión controlada por objetivo). */
  TCI: "tci",
  /** Valoración preanestésica (scores de riesgo + PDF). */
  PREANESTHETIC_ASSESSMENT: "valoracion",
  /** Modo quirófano / código azul (dosis de crisis). */
  CODE_BLUE: "codigo",
  /** Ficha ampliada: farmacología completa, molecular, todas las marcas. */
  EXPANDED_DRUG_DETAIL: "ficha_ampliada",
  /** Verificador de interacciones ilimitado (Free = 3/día). */
  UNLIMITED_INTERACTIONS: "interacciones_ilimitadas",
  /** Calculadoras avanzadas (electrolitos, ROTEM, hemoderivados…). */
  ADVANCED_CALCULATORS: "calculadoras_avanzadas",
  /** Sync multi-dispositivo (favoritos, ajustes). */
  SYNC: "sync",
} as const;

export type ProFeature = (typeof PRO_FEATURES)[keyof typeof PRO_FEATURES];

// Etiquetas legibles (ES-RD) por feature, para el copy del paywall.
export const PRO_FEATURE_LABELS: Record<ProFeature, string> = {
  [PRO_FEATURES.TCI]: "Calculadora TCI / TIVA",
  [PRO_FEATURES.PREANESTHETIC_ASSESSMENT]: "Valoración preanestésica",
  [PRO_FEATURES.CODE_BLUE]: "Modo quirófano / código azul",
  [PRO_FEATURES.EXPANDED_DRUG_DETAIL]: "Ficha ampliada del fármaco",
  [PRO_FEATURES.UNLIMITED_INTERACTIONS]: "Interacciones ilimitadas",
  [PRO_FEATURES.ADVANCED_CALCULATORS]: "Calculadoras avanzadas",
  [PRO_FEATURES.SYNC]: "Sync multi-dispositivo",
};
