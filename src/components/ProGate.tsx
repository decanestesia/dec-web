// src/components/ProGate.tsx
//
// ============================================================
// ProGate — envoltura de contenido Pro para páginas SERVER (async).
//
//   <ProGate feature={PRO_FEATURES.EXPANDED_DRUG_DETAIL}>…</ProGate>
//
// Resuelve is_pro() en el servidor y decide qué renderizar:
//   flag OFF (GATING_ENABLED=false) → SIEMPRE renderiza children.
//                                     Cero cambio visible. Ni consulta la base.
//   flag ON  + usuario Pro          → renderiza children.
//   flag ON  + usuario no-Pro       → muestra el paywall/upsell.
//
// Importa gating.server (server-only), así que SOLO se usa en Server
// Components. Para árboles "use client" usa ProGateClient (recibe `isPro`
// como prop desde el server wrapper).
// ============================================================

import Paywall from "@/components/Paywall";
import { GATING_ENABLED, type ProFeature } from "@/lib/gating";
import { isProUser } from "@/lib/gating.server";

export default async function ProGate({
  feature,
  children,
  fallback,
}: {
  feature: ProFeature;
  children: React.ReactNode;
  /** Paywall a medida; si se omite, se usa <Paywall feature=…/>. */
  fallback?: React.ReactNode;
}) {
  // Flag OFF: pasa siempre, sin pegarle a la base. (isProUser también
  // cortocircuita, pero lo dejamos explícito aquí por claridad.)
  if (!GATING_ENABLED) return <>{children}</>;

  const pro = await isProUser();
  if (pro) return <>{children}</>;

  return <>{fallback ?? <Paywall feature={feature} />}</>;
}
