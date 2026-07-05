// src/components/ProGateClient.tsx
//
// ============================================================
// ProGateClient — envoltura de contenido Pro para árboles "use client".
//
//   <ProGateClient feature={PRO_FEATURES.TCI} isPro={isPro}>…</ProGateClient>
//
// Recibe `isPro` ya calculado en el server wrapper (page.tsx) para no
// re-consultar la base desde el cliente. Con el flag OFF ignora el prop y
// renderiza children igual (cero cambio visible).
//
// Es CLIENT-SAFE: no importa gating.server ni supabase/server, solo el
// núcleo `@/lib/gating` y el Paywall presentacional. Vive en su propio
// archivo (separado del ProGate server async) para que el bundle de
// cliente nunca arrastre código server-only.
//
// No lleva "use client" propio: es un componente síncrono sin hooks,
// seguro en ambos entornos; hereda el contexto del que lo importa.
// ============================================================

import Paywall from "@/components/Paywall";
import { GATING_ENABLED, type ProFeature } from "@/lib/gating";

export default function ProGateClient({
  feature,
  isPro,
  children,
  fallback,
}: {
  feature: ProFeature;
  /** Resultado de isProUser() calculado en el server wrapper. */
  isPro: boolean;
  children: React.ReactNode;
  /** Paywall a medida; si se omite, se usa <Paywall feature=…/>. */
  fallback?: React.ReactNode;
}) {
  if (!GATING_ENABLED) return <>{children}</>;
  if (isPro) return <>{children}</>;
  return <>{fallback ?? <Paywall feature={feature} />}</>;
}
