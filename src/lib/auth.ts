// src/lib/auth.ts
//
// Helpers de autenticación para usar desde Server Components,
// Route Handlers y Server Actions.
//
// Convención: getUser() devuelve null si no hay sesión.
// requireAuth() redirige a /auth/login si no hay sesión.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
  locale: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionTier =
  | "free"
  | "pro_monthly"
  | "pro_annual"
  | "pro_lifetime"
  | "pro_student";

/**
 * Sanea un parámetro `next` de redirección: solo permite rutas internas del
 * mismo origen. Bloquea open redirects — URLs absolutas (https://evil.com),
 * protocolo-relativas (//evil.com), el truco userinfo (@evil.com, que no
 * empieza por "/") y backslash (/\evil que el navegador trata como //).
 * // el phishing entra por la puerta que dejas abierta con un ?next= sin revisar
 */
export function safeNext(raw: string | null | undefined, fallback = "/"): string {
  if (!raw || !raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}

/**
 * Devuelve el user actual o null si no hay sesión.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Redirige a login si no hay sesión. Devuelve user si sí.
 * Útil al inicio de Server Components que requieren auth.
 */
export async function requireAuth(redirectTo = "/auth/login"): Promise<User> {
  const user = await getUser();
  if (!user) redirect(redirectTo);
  return user;
}

/**
 * Devuelve el profile extendido del usuario actual (incluye display_name, etc.)
 */
export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/**
 * ¿Es Pro este usuario? (cualquier tier no-free, activo).
 * Usa la función SQL is_pro() en Supabase.
 */
export async function isPro(): Promise<boolean> {
  const user = await getUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_pro", {
    user_uuid: user.id,
  });
  if (error) return false;
  return data === true;
}

/**
 * Devuelve el tier activo: 'free', 'pro_monthly', etc.
 * Usa la función SQL get_active_tier() en Supabase.
 */
export async function getActiveTier(): Promise<SubscriptionTier> {
  const user = await getUser();
  if (!user) return "free";

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_active_tier", {
    user_uuid: user.id,
  });
  if (error || !data) return "free";
  return data as SubscriptionTier;
}
