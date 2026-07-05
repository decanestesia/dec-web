// src/app/perfil/profile-actions.ts
//
// Server Action para actualizar el perfil del usuario actual.
// "use server" → endpoint POST invocado desde el formulario client-side.
//
// SEGURIDAD: el UPDATE va contra la tabla `profiles` con el cliente Supabase
// server-side, que lleva la sesión del usuario en cookies. La RLS de la tabla
// (`auth.uid() = id`) garantiza que solo puede tocar SU propia fila. Además,
// nunca escribimos columnas privilegiadas (role de sistema, can_publish,
// avatar_url de OAuth, email): solo el subconjunto que el usuario controla.
// El `.eq("id", user.id)` es defensa en profundidad, no la única barrera.

"use server";

import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type ProfileActionResult =
  | { ok: true }
  | { ok: false; error: string };

// Valores permitidos (whitelist server-side; el <select> del cliente no es
// autoridad — un POST forjado podría mandar cualquier cosa).
const ROLES = new Set([
  "anesthesiologist",
  "resident",
  "fellow",
  "crna",
  "medical_student",
  "other_hcp",
]);
const SPECIALTIES = new Set([
  "general",
  "cardiovascular",
  "pediatric",
  "obstetric",
  "regional_pain",
  "neuro",
  "critical_care",
  "other",
]);
const LOCALES = new Set(["es", "en"]);

const CURRENT_YEAR = new Date().getFullYear();

function cleanText(v: FormDataEntryValue | null, max = 120): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return s.slice(0, max);
}

function cleanEnum(v: FormDataEntryValue | null, allowed: Set<string>): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  return allowed.has(s) ? s : null;
}

function cleanInt(
  v: FormDataEntryValue | null,
  min: number,
  max: number
): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Number.parseInt(s, 10);
  if (Number.isNaN(n) || n < min || n > max) return null;
  return n;
}

export async function updateProfile(
  formData: FormData
): Promise<ProfileActionResult> {
  const user = await getUser();
  if (!user) {
    return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  }

  const display_name = cleanText(formData.get("display_name"), 80);
  if (!display_name) {
    return { ok: false, error: "El nombre para mostrar es obligatorio." };
  }

  const role = cleanEnum(formData.get("role"), ROLES);
  // training_year solo tiene sentido para residentes/fellows.
  const rawTrainingYear = cleanInt(formData.get("training_year"), 1, 12);
  const training_year =
    role === "resident" || role === "fellow" ? rawTrainingYear : null;

  const payload = {
    display_name,
    role,
    specialty: cleanEnum(formData.get("specialty"), SPECIALTIES),
    training_year,
    institution: cleanText(formData.get("institution"), 120),
    country_code: cleanText(formData.get("country_code"), 56),
    locale: cleanEnum(formData.get("locale"), LOCALES),
    birth_year: cleanInt(formData.get("birth_year"), 1900, CURRENT_YEAR),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id); // RLS ya lo fuerza; esto es defensa en profundidad.

  if (error) {
    // La RLS devuelve error o 0 filas ante intento no autorizado.
    return {
      ok: false,
      error: "No se pudo guardar. Reintenta o escribe a soporte@decanestesia.com",
    };
  }

  revalidatePath("/perfil");
  revalidatePath("/", "layout"); // refresca el nombre en el UserMenu del navbar.
  return { ok: true };
}
