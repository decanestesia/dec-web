// src/lib/gating.server.ts
//
// ============================================================
// Gating Free/Pro — lógica SERVER-ONLY.
//
// Importa supabase/server (que usa next/headers), así que SOLO se puede
// importar desde Server Components, Route Handlers o Server Actions.
// El núcleo client-safe (flag, features, labels) vive en `./gating`.
//
// (No usamos el paquete `server-only` para no añadir deps; el import de
//  supabase/server → next/headers ya lo hace inutilizable en cliente y
//  Turbopack rompe el build si alguien lo importa desde un "use client".)
// ============================================================

import { cache } from "react";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { GATING_ENABLED, type ProFeature } from "@/lib/gating";

// ------------------------------------------------------------
// isProUser() — server-side. getUser() → RPC is_pro().
// Sin sesión → false. Error de red/RPC → false (fail-closed a Free;
// con el flag off da igual, con el flag on preferimos no regalar Pro).
//
// Cacheado POR REQUEST con React.cache: si varios ProGate/canAccess se
// evalúan en el mismo render server, solo se pega UNA vez a Supabase.
// (No persiste entre requests — cada navegación revalúa.)
// ------------------------------------------------------------
export const isProUser = cache(async (): Promise<boolean> => {
  // Cortocircuito: con el gating apagado no hace falta ni consultar a la
  // base. Ahorra el round-trip y garantiza que un fallo de Supabase nunca
  // afecte el comportamiento actual (todo-desbloqueado).
  if (!GATING_ENABLED) return true;

  const user = await getUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_pro", {
    user_uuid: user.id,
  });
  if (error) return false;
  return data === true;
});

// ------------------------------------------------------------
// canAccess(feature) — ¿puede el usuario actual usar esta feature Pro?
//
//   flag OFF          → true (siempre; todo desbloqueado)
//   flag ON  + Pro    → true
//   flag ON  + no-Pro → false → el punto de entrada muestra paywall
//
// El parámetro `feature` hoy no cambia la respuesta (todas las features
// Pro se desbloquean con is_pro()). Se recibe igual para: (a) marcar la
// intención en cada call site, y (b) permitir gating por-feature futuro
// (ej. un tier que incluya unas features y no otras) sin cambiar firmas.
// ------------------------------------------------------------
export async function canAccess(_feature: ProFeature): Promise<boolean> {
  if (!GATING_ENABLED) return true;
  return isProUser();
}
