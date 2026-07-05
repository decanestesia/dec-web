// src/app/admin/admin-actions.ts
//
// Server Actions del panel de administración. "use server" → cada función
// es un endpoint POST invocado desde el panel client-side.
//
// SEGURIDAD (doble candado):
//  1. Cada acción re-verifica isAdmin() server-side antes de tocar nada —
//     no confía en que el componente haya gateado la UI.
//  2. Las RPC admin_* son SECURITY DEFINER con gate interno de is_admin; se
//     invocan con el cliente Supabase de la SESIÓN (cookies), nunca con la
//     service key. Si un no-admin forja el POST, la RPC lo rechaza igual.
// El candado real vive en la base; este archivo solo evita trabajo inútil y
// da mensajes limpios.

"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Tiers que acepta admin_grant_subscription (whitelist server-side; el <select>
// del cliente no es autoridad — un POST forjado podría mandar cualquier cosa).
const GRANT_TIERS = new Set([
  "pro_monthly",
  "pro_annual",
  "pro_lifetime",
  "free",
]);
// Tiers de un cupón de canje (no tiene sentido un cupón 'free').
const CODE_TIERS = new Set(["pro_monthly", "pro_annual", "pro_lifetime"]);

// ─── Tipos de fila que devuelve admin_list_users() ────────────────────
export interface AdminUserRow {
  email: string | null;
  display_name: string | null;
  role: string | null;
  is_admin: boolean | null;
  active_tier: string | null;
  sub_platform: string | null;
  sub_expires: string | null;
  created_at: string | null;
}

export type ActionResult<T = never> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// Normaliza días: vacío / 0 / negativo → null (indefinido).
function parseDays(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

function cleanEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "").trim().toLowerCase();
}

// ─── 1. Listar usuarios ───────────────────────────────────────────────
export async function listUsers(): Promise<ActionResult<AdminUserRow[]>> {
  if (!(await isAdmin())) {
    return { ok: false, error: "No autorizado." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");
  if (error) {
    return { ok: false, error: "No se pudo cargar la lista de usuarios." };
  }
  return { ok: true, data: (data ?? []) as AdminUserRow[] };
}

// ─── 2. Dar / cambiar suscripción ─────────────────────────────────────
export async function grantSubscription(
  formData: FormData
): Promise<ActionResult<string>> {
  if (!(await isAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const email = cleanEmail(formData.get("email"));
  if (!email) return { ok: false, error: "El email es obligatorio." };

  const tier = String(formData.get("tier") ?? "").trim();
  if (!GRANT_TIERS.has(tier)) {
    return { ok: false, error: "Tier inválido." };
  }

  const days = parseDays(formData.get("days"));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_grant_subscription", {
    p_email: email,
    p_tier: tier,
    p_days: days,
  });

  if (error) {
    // La RPC lanza si el email no existe o el llamador no es admin.
    return {
      ok: false,
      error: error.message?.includes("not found")
        ? "No existe una cuenta con ese email."
        : "No se pudo aplicar la suscripción. ¿El email tiene cuenta?",
    };
  }

  revalidatePath("/admin");
  return { ok: true, data: String(data ?? "ok") };
}

// ─── 3. Revocar suscripción (→ free) ──────────────────────────────────
export async function revokeSubscription(
  formData: FormData
): Promise<ActionResult<string>> {
  if (!(await isAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const email = cleanEmail(formData.get("email"));
  if (!email) return { ok: false, error: "El email es obligatorio." };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_revoke_subscription", {
    p_email: email,
  });

  if (error) {
    return {
      ok: false,
      error: "No se pudo revocar. ¿El email tiene cuenta?",
    };
  }

  revalidatePath("/admin");
  return { ok: true, data: String(data ?? "ok") };
}

// ─── 4. Generar cupón de canje (offer code Apple) ─────────────────────
export async function createCompCode(
  formData: FormData
): Promise<ActionResult<string>> {
  if (!(await isAdmin())) {
    return { ok: false, error: "No autorizado." };
  }

  const tier = String(formData.get("tier") ?? "").trim();
  if (!CODE_TIERS.has(tier)) {
    return { ok: false, error: "Tier inválido." };
  }

  const days = parseDays(formData.get("days"));
  const notes = String(formData.get("notes") ?? "").trim().slice(0, 200) || null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_create_comp_code", {
    p_tier: tier,
    p_days: days,
    p_notes: notes,
  });

  if (error || !data) {
    return { ok: false, error: "No se pudo generar el cupón." };
  }

  return { ok: true, data: String(data) };
}
