// ============================================================
// Verificador de interacciones — Server entry.
// La UI es interactiva (selección + fetch a Supabase), así que vive en
// el Client Component colocado (InteraccionesClient). Aquí resolvemos
// isPro() en el server y lo bajamos como prop: con el flag de gating OFF
// da `true` (todo desbloqueado) sin pegarle a la base.
// ============================================================

import InteraccionesClient from "./InteraccionesClient";
import { isProUser } from "@/lib/gating.server";

export default async function InteraccionesPage() {
  const isPro = await isProUser();
  return <InteraccionesClient isPro={isPro} />;
}
