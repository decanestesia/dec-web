// src/app/auth/_components/auth-actions.ts
//
// Server Actions invocadas desde formularios client-side.
// "use server" hace que cada función sea un endpoint POST.

"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export type AuthActionResult =
  | { ok: true; redirect?: string }
  | { ok: false; error: string };

// ─── Sign in con email + password ─────────────────────────────────
export async function signInWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email y contraseña son requeridos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: traduceError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Sign up con email + password ─────────────────────────────────
export async function signUpWithPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "").trim();

  if (!email || !password) {
    return { ok: false, error: "Email y contraseña son requeridos." };
  }
  if (password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: displayName || email.split("@")[0] },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: traduceError(error.message) };
  }

  // Si email confirmation está OFF (modo dev), el usuario queda logueado.
  // Si está ON (producción), debe verificar email primero.
  return { ok: true, redirect: "/auth/login?registered=1" };
}

// ─── Solicitar email de reset password ────────────────────────────
export async function requestPasswordReset(
  formData: FormData
): Promise<AuthActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return { ok: false, error: "Email es requerido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/reset/confirm`,
  });

  if (error) {
    return { ok: false, error: traduceError(error.message) };
  }

  return { ok: true };
}

// ─── Confirmar nueva password (callback del link de email) ────────
export async function setNewPassword(
  formData: FormData
): Promise<AuthActionResult> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { ok: false, error: traduceError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/?password_updated=1");
}

// ─── Sign out ─────────────────────────────────────────────────────
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Helper: traduce mensajes de error de Supabase a español ──────
function traduceError(msg: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email o contraseña incorrectos.",
    "Email not confirmed": "Verifica tu email antes de iniciar sesión.",
    "User already registered": "Este email ya está registrado. Intenta iniciar sesión.",
    "Password should be at least 6 characters":
      "La contraseña debe tener al menos 8 caracteres.",
    "Email rate limit exceeded":
      "Demasiados intentos. Espera unos minutos antes de reintentar.",
    "Unable to validate email address: invalid format": "Email inválido.",
    "For security purposes, you can only request this once every 60 seconds":
      "Por seguridad, solo puedes solicitarlo cada 60 segundos.",
  };
  return map[msg] ?? msg;
}
